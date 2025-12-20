/**
 * Shippo Shipping Service
 * Multi-carrier shipping rates API (USPS, UPS, FedEx, DHL)
 * https://goshippo.com/docs/
 */
const Shippo = require('shippo');

class ShippoService {
    constructor() {
        // Initialize Shippo with API key
        this.apiKey = process.env.SHIPPO_API_KEY;
        if (!this.apiKey) {
            console.warn('⚠️ SHIPPO_API_KEY not set - shipping rates will use fallback');
        }
        this.shippo = this.apiKey ? Shippo(this.apiKey) : null;

        // Default shipping origin (warehouse address)
        this.originAddress = {
            name: 'Timelite Clothing',
            street1: process.env.SHIPPO_ORIGIN_STREET || '236 N Claremont Ave',
            city: process.env.SHIPPO_ORIGIN_CITY || 'San Jose',
            state: process.env.SHIPPO_ORIGIN_STATE || 'CA',
            zip: process.env.SHIPPO_ORIGIN_ZIP || '95127',
            country: 'US',
            phone: process.env.SHIPPO_ORIGIN_PHONE || '+1 669 254 7401',
            email: 'henry@timeliteclothing.com'
        };

        // Default package dimensions for clothing
        this.defaultParcel = {
            length: parseFloat(process.env.SHIPPO_DEFAULT_LENGTH || '14'),
            width: parseFloat(process.env.SHIPPO_DEFAULT_WIDTH || '10'),
            height: parseFloat(process.env.SHIPPO_DEFAULT_HEIGHT || '3'),
            distance_unit: 'in',
            weight: parseFloat(process.env.SHIPPO_DEFAULT_WEIGHT || '1.5'),
            mass_unit: 'lb'
        };
    }

    /**
     * Validate and standardize a US address using Shippo
     */
    async validateAddress(address) {
        if (!this.shippo) {
            return {
                valid: false,
                error: 'Shippo API key not configured'
            };
        }

        try {
            const result = await this.shippo.address.create({
                name: address.name || 'Customer',
                street1: address.streetAddress,
                city: address.city,
                state: address.state,
                zip: address.zipCode,
                country: 'US',
                validate: true
            });

            return {
                valid: result.validation_results?.is_valid || false,
                standardized: {
                    streetAddress: result.street1,
                    city: result.city,
                    state: result.state,
                    zipCode: result.zip
                },
                messages: result.validation_results?.messages || []
            };
        } catch (error) {
            console.error('❌ Shippo address validation error:', error.message);
            return {
                valid: false,
                error: error.message || 'Address validation failed'
            };
        }
    }

    /**
     * Calculate shipping rates for given destination
     * @param {Object} destination - { city, state, zipCode, streetAddress? }
     * @param {Array} items - Optional cart items for weight calculation
     * @returns {Array} - Array of shipping rate options
     */
    async calculateShippingRates(destination, items = []) {
        if (!this.shippo) {
            console.warn('⚠️ Shippo not configured, using fallback rates');
            return this.getFallbackRates();
        }

        try {
            // Calculate total weight based on items
            const totalWeight = items.length > 0
                ? items.reduce((sum, item) => sum + ((item.quantity || 1) * this.defaultParcel.weight), 0)
                : this.defaultParcel.weight;

            // Create destination address object
            const toAddress = {
                name: destination.name || 'Customer',
                street1: destination.streetAddress || destination.street1 || '123 Main St',
                city: destination.city,
                state: destination.state,
                zip: destination.zipCode || destination.zip,
                country: 'US'
            };

            // Create parcel with calculated weight
            const parcel = {
                ...this.defaultParcel,
                weight: totalWeight
            };

            console.log('📦 Creating Shippo shipment:', {
                from: `${this.originAddress.city}, ${this.originAddress.state} ${this.originAddress.zip}`,
                to: `${toAddress.city}, ${toAddress.state} ${toAddress.zip}`,
                weight: `${totalWeight} lb`
            });

            // Create shipment to get rates
            const shipment = await this.shippo.shipment.create({
                address_from: this.originAddress,
                address_to: toAddress,
                parcels: [parcel],
                async: false // Wait for rates
            });

            if (!shipment.rates || shipment.rates.length === 0) {
                console.warn('⚠️ No rates returned from Shippo, using fallback');
                return this.getFallbackRates();
            }

            // Format rates for frontend
            const formattedRates = shipment.rates.map(rate => ({
                id: rate.object_id,
                name: `${rate.provider} ${rate.servicelevel.name}`,
                provider: rate.provider, // USPS, UPS, FedEx, etc.
                service: rate.servicelevel.token,
                serviceName: rate.servicelevel.name,
                price: parseFloat(rate.amount),
                currency: rate.currency,
                time: rate.estimated_days 
                    ? `${rate.estimated_days} business day${rate.estimated_days > 1 ? 's' : ''}`
                    : rate.duration_terms || 'Standard delivery',
                estimatedDays: rate.estimated_days,
                rateId: rate.object_id // For purchasing later
            }));

            // Filter to only show USPS rates (as requested by user)
            const uspsRates = formattedRates.filter(rate => rate.provider === 'USPS');

            // Sort by price (cheapest first)
            uspsRates.sort((a, b) => a.price - b.price);

            console.log(`✅ Shippo returned ${uspsRates.length} USPS shipping rates (filtered from ${formattedRates.length} total)`);
            return uspsRates;

        } catch (error) {
            console.error('❌ Shippo calculate rates error:', error.message);
            
            // Return fallback rates on error
            return this.getFallbackRates();
        }
    }

    /**
     * Get fallback static rates if Shippo API fails
     */
    getFallbackRates() {
        return [
            { 
                id: 'fallback_ground', 
                name: 'USPS Ground Advantage', 
                provider: 'USPS',
                service: 'usps_ground_advantage',
                price: 7.49, 
                time: '3-5 business days',
                estimatedDays: 5,
                fallback: true
            },
            { 
                id: 'fallback_priority', 
                name: 'USPS Priority Mail', 
                provider: 'USPS',
                service: 'usps_priority',
                price: 9.99, 
                time: '1-3 business days',
                estimatedDays: 3,
                fallback: true
            },
            { 
                id: 'fallback_express', 
                name: 'USPS Priority Mail Express', 
                provider: 'USPS',
                service: 'usps_priority_express',
                price: 29.99, 
                time: '1-2 business days',
                estimatedDays: 2,
                fallback: true
            }
        ];
    }

    /**
     * Get service test info
     */
    getServiceInfo() {
        return {
            configured: !!this.shippo,
            origin: this.originAddress,
            defaultParcel: this.defaultParcel
        };
    }
}

module.exports = new ShippoService();
