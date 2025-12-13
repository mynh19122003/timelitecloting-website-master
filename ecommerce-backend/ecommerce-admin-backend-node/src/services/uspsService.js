const axios = require('axios');

/**
 * USPS API Service
 * Handles OAuth authentication and shipping-related API calls
 */
class USPSService {
    constructor() {
        this.consumerKey = process.env.USPS_CONSUMER_KEY;
        this.consumerSecret = process.env.USPS_CONSUMER_SECRET;
        // USPS has different environments:
        // Production: https://api.usps.com
        // Testing: https://apis-tem.usps.com (for new apps/sandbox testing)
        this.baseURL = process.env.USPS_API_BASE_URL || 'https://api.usps.com';
        this.accessToken = null;
        this.tokenExpiry = null;

        // Default shipping origin (warehouse address)
        this.originZip = process.env.USPS_ORIGIN_ZIP || '95127';
        this.originCity = process.env.USPS_ORIGIN_CITY || 'San Jose';
        this.originState = process.env.USPS_ORIGIN_STATE || 'CA';

        // Default package dimensions for clothing
        this.defaultWeight = parseFloat(process.env.USPS_DEFAULT_WEIGHT || '1.5'); // lbs
        this.defaultLength = parseFloat(process.env.USPS_DEFAULT_LENGTH || '14'); // inches
        this.defaultWidth = parseFloat(process.env.USPS_DEFAULT_WIDTH || '10'); // inches
        this.defaultHeight = parseFloat(process.env.USPS_DEFAULT_HEIGHT || '3'); // inches
    }

    /**
     * Get OAuth access token from USPS
     */
    async getAccessToken() {
        // Return cached token if still valid
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            // Use URLSearchParams for proper form encoding
            const formBody = new URLSearchParams();
            formBody.append('grant_type', 'client_credentials');

            const response = await axios.post(
                `${this.baseURL}/oauth2/v3/token`,
                formBody.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')}`
                    }
                }
            );

            this.accessToken = response.data.access_token;
            // Set expiry 5 minutes before actual expiry to be safe
            this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

            console.log('✅ USPS OAuth token obtained successfully');
            return this.accessToken;
        } catch (error) {
            console.error('❌ USPS OAuth error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with USPS API');
        }
    }

    /**
     * Validate and standardize a US address
     */
    async validateAddress(address) {
        try {
            const token = await this.getAccessToken();

            const requestData = {
                streetAddress: address.streetAddress,
                city: address.city,
                state: address.state,
                ZIPCode: address.zipCode
            };

            const response = await axios.post(
                `${this.baseURL}/addresses/v3/address`,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                valid: true,
                standardized: response.data
            };
        } catch (error) {
            console.error('Address validation error:', error.response?.data || error.message);
            return {
                valid: false,
                error: error.response?.data?.error?.message || 'Address validation failed'
            };
        }
    }

    /**
     * Calculate domestic shipping rates
     */
    async calculateShippingRates(destination, items = []) {
        try {
            const token = await this.getAccessToken();

            // Calculate total weight based on items
            const totalWeight = items.length > 0
                ? items.reduce((sum, item) => sum + (item.quantity * this.defaultWeight), 0)
                : this.defaultWeight;

            // Prepare requests for different mail classes
            const mailClasses = [
                {
                    name: 'USPS Ground Advantage',
                    code: 'USPS_GROUND_ADVANTAGE',
                    processingCategory: 'MACHINABLE',
                    rateIndicator: 'DR'
                },
                {
                    name: 'Priority Mail',
                    code: 'PRIORITY_MAIL',
                    processingCategory: 'MACHINABLE',
                    rateIndicator: 'DR'
                },
                {
                    name: 'Priority Mail Express',
                    code: 'PRIORITY_MAIL_EXPRESS',
                    processingCategory: 'MACHINABLE',
                    rateIndicator: 'DR'
                }
            ];

            const rates = await Promise.all(
                mailClasses.map(async (mailClass) => {
                    try {
                        const requestData = {
                            originZIPCode: this.originZip,
                            destinationZIPCode: destination.zipCode,
                            weight: totalWeight,
                            length: this.defaultLength,
                            width: this.defaultWidth,
                            height: this.defaultHeight,
                            mailClass: mailClass.code,
                            processingCategory: mailClass.processingCategory,
                            destinationEntryFacilityType: 'NONE',
                            rateIndicator: mailClass.rateIndicator,
                            priceType: 'RETAIL'
                        };

                        const response = await axios.post(
                            `${this.baseURL}/prices/v3/base-rates/search`,
                            requestData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        const priceData = response.data;
                        const totalPrice = priceData.totalBasePrice || priceData.price || 0;

                        return {
                            id: mailClass.code.toLowerCase().replace(/_/g, '_'),
                            name: mailClass.name,
                            price: parseFloat(totalPrice),
                            time: this.getEstimatedDeliveryTime(mailClass.code),
                            service: mailClass.code
                        };
                    } catch (error) {
                        console.error(`Error fetching rate for ${mailClass.name}:`, error.response?.data || error.message);
                        return null;
                    }
                })
            );

            // Filter out failed requests and return successful rates
            const validRates = rates.filter(rate => rate !== null && rate.price > 0);

            if (validRates.length === 0) {
                throw new Error('No valid shipping rates available');
            }

            return validRates;
        } catch (error) {
            console.error('❌ Calculate shipping rates error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get estimated delivery time for mail class
     */
    getEstimatedDeliveryTime(mailClass) {
        const deliveryTimes = {
            'USPS_GROUND_ADVANTAGE': '2-5 business days',
            'PRIORITY_MAIL': '1-3 business days',
            'PRIORITY_MAIL_EXPRESS': '1-2 business days'
        };
        return deliveryTimes[mailClass] || 'Standard delivery';
    }

    /**
     * Get fallback static rates if USPS API fails
     */
    getFallbackRates() {
        return [
            { id: 'usps_ground', name: 'USPS Ground Advantage', price: 7.23, time: '3 business days' },
            { id: 'usps_priority', name: 'USPS Priority Mail', price: 8.64, time: '2 business days' },
            { id: 'usps_express', name: 'USPS Priority Mail Express', price: 58.35, time: '1 business day' }
        ];
    }
}

module.exports = new USPSService();
