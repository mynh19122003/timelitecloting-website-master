const express = require('express');
const router = express.Router();
const shippoService = require('../services/shippoService');

/**
 * POST /api/shipping/validate-address
 * Validate a US address using Shippo API
 */
router.post('/validate-address', async (req, res) => {
    try {
        const { streetAddress, city, state, zipCode, name } = req.body;

        // Validate required fields
        if (!city || !state || !zipCode) {
            return res.status(400).json({
                error: 'INVALID_ADDRESS',
                message: 'Missing required address fields (city, state, zipCode)'
            });
        }

        const result = await shippoService.validateAddress({
            name,
            streetAddress,
            city,
            state,
            zipCode
        });

        res.json(result);
    } catch (error) {
        console.error('Address validation error:', error);
        res.status(500).json({
            error: 'VALIDATION_ERROR',
            message: error.message || 'Failed to validate address'
        });
    }
});

/**
 * POST /api/shipping/calculate-rates
 * Calculate shipping rates for given destination and items
 * Returns rates from multiple carriers (USPS, UPS, FedEx)
 */
router.post('/calculate-rates', async (req, res) => {
    try {
        const { destination, items } = req.body;

        // Validate destination
        if (!destination || !destination.zipCode || !destination.city || !destination.state) {
            return res.status(400).json({
                error: 'INVALID_DESTINATION',
                message: 'Missing required destination fields (zipCode, city, state)'
            });
        }

        // Calculate rates using Shippo
        const rates = await shippoService.calculateShippingRates(destination, items);

        // Check if rates are fallback
        const isFallback = rates.some(rate => rate.fallback);

        res.json({
            success: true,
            rates,
            origin: shippoService.getServiceInfo().origin,
            fallback: isFallback,
            warning: isFallback ? 'Using estimated rates. Carrier API temporarily unavailable.' : undefined
        });
    } catch (error) {
        console.error('Calculate rates error:', error);
        res.status(500).json({
            error: 'RATE_CALCULATION_ERROR',
            message: error.message || 'Failed to calculate shipping rates'
        });
    }
});

/**
 * GET /api/shipping/test
 * Test endpoint to verify Shippo service configuration
 */
router.get('/test', async (req, res) => {
    try {
        const serviceInfo = shippoService.getServiceInfo();

        res.json({
            success: true,
            message: 'Shippo shipping service configured',
            service: 'Shippo (Multi-carrier: USPS, UPS, FedEx, DHL)',
            config: {
                configured: serviceInfo.configured,
                origin: {
                    street: serviceInfo.origin.street1,
                    city: serviceInfo.origin.city,
                    state: serviceInfo.origin.state,
                    zipCode: serviceInfo.origin.zip
                },
                defaults: {
                    weight: `${serviceInfo.defaultParcel.weight} lb`,
                    dimensions: `${serviceInfo.defaultParcel.length}x${serviceInfo.defaultParcel.width}x${serviceInfo.defaultParcel.height} in`
                }
            }
        });
    } catch (error) {
        console.error('Shipping test error:', error);
        res.status(500).json({
            success: false,
            error: 'SHIPPING_TEST_FAILED',
            message: error.message || 'Shipping service test failed'
        });
    }
});

module.exports = router;

