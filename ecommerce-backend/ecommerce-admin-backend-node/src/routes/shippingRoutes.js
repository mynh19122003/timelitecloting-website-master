const express = require('express');
const router = express.Router();
const uspsService = require('../services/uspsService');

/**
 * POST /api/shipping/validate-address
 * Validate a US address using USPS API
 */
router.post('/validate-address', async (req, res) => {
    try {
        const { streetAddress, city, state, zipCode } = req.body;

        // Validate required fields
        if (!streetAddress || !city || !state || !zipCode) {
            return res.status(400).json({
                error: 'INVALID_ADDRESS',
                message: 'Missing required address fields'
            });
        }

        const result = await uspsService.validateAddress({
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

        // Calculate rates
        try {
            const rates = await uspsService.calculateShippingRates(destination, items);

            res.json({
                success: true,
                rates,
                origin: {
                    zipCode: uspsService.originZip,
                    city: uspsService.originCity,
                    state: uspsService.originState
                }
            });
        } catch (apiError) {
            // Fallback to static rates if USPS API fails
            console.warn('USPS API failed, using fallback rates:', apiError.message);

            const fallbackRates = uspsService.getFallbackRates();

            res.json({
                success: true,
                rates: fallbackRates,
                fallback: true,
                warning: 'Using estimated rates. USPS API temporarily unavailable.'
            });
        }
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
 * Test endpoint to verify USPS service configuration
 */
router.get('/test', async (req, res) => {
    try {
        // Test OAuth authentication
        const token = await uspsService.getAccessToken();

        res.json({
            success: true,
            message: 'USPS service configured correctly',
            config: {
                baseURL: uspsService.baseURL,
                origin: {
                    zipCode: uspsService.originZip,
                    city: uspsService.originCity,
                    state: uspsService.originState
                },
                defaults: {
                    weight: uspsService.defaultWeight,
                    dimensions: `${uspsService.defaultLength}x${uspsService.defaultWidth}x${uspsService.defaultHeight} inches`
                },
                authenticated: !!token
            }
        });
    } catch (error) {
        console.error('USPS test error:', error);
        res.status(500).json({
            success: false,
            error: 'USPS_TEST_FAILED',
            message: error.message || 'USPS service test failed'
        });
    }
});

module.exports = router;
