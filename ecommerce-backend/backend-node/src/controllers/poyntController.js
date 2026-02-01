const poyntService = require('../services/poyntService');
const logger = console; // Use console for logging instead of logger module

class PoyntController {
  /**
   * Charge card endpoint for PHP backend to call
   * POST /api/poynt/charge-card
   */
  async chargeCard(req, res) {
    try {
      const { card, amount, orderId } = req.body;

      // Validate input
      if (!card || !amount || !orderId) {
        return res.status(400).json({
          success: false,
          error: 'ERR_VALIDATION_FAILED',
          message: 'Missing required fields: card, amount, orderId'
        });
      }

      // Validate card data
      if (!card.number || !card.expirationMonth || !card.expirationYear || !card.cvv) {
        return res.status(400).json({
          success: false,
          error: 'ERR_INVALID_CARD_DATA',
          message: 'Missing required card fields'
        });
      }

      logger.info('[PoyntController] Processing payment', {
        orderId,
        amount,
        cardLast4: card.number.slice(-4)
      });

      // Call Poynt service to charge card
      const result = await poyntService.chargeCard(card, amount, orderId);

      logger.info('[PoyntController] Payment successful', {
        orderId,
        transactionId: result.id
      });

      return res.json({
        success: true,
        transactionId: result.id,
        status: result.status,
        message: 'Payment processed successfully'
      });

    } catch (error) {
      logger.error('[PoyntController] Payment failed', error);
      
      // Return user-friendly error
      return res.status(400).json({
        success: false,
        error: 'ERR_PAYMENT_FAILED',
        message: error.message || 'Payment processing failed'
      });
    }
  }
}

module.exports = new PoyntController();
