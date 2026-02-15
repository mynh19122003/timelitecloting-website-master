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

      // LOG đầy đủ request đầu vào
      console.log('==========================================');
      console.log('[PoyntController] 📥 RECEIVED REQUEST:');
      console.log('Full Body:', JSON.stringify(req.body, null, 2));
      console.log('==========================================');

      // Validate input
      if (!card || !amount || !orderId) {
        console.error('[PoyntController] ❌ Thiếu field bắt buộc');
        return res.status(400).json({
          success: false,
          error: 'ERR_VALIDATION_FAILED',
          message: 'Missing required fields: card, amount, orderId'
        });
      }

      // Validate chi tiết card fields
      const cardValidation = {
        hasNumber: !!card.number,
        numberLength: card.number?.length,
        hasExpMonth: !!card.expirationMonth,
        expMonth: card.expirationMonth,
        hasExpYear: !!card.expirationYear,
        expYear: card.expirationYear,
        hasCVV: !!card.cvv,
        cvvLength: card.cvv?.length,
        hasCardHolderName: !!card.cardHolderName
      };

      console.log('[PoyntController] 🔍 Card Field Validation:', cardValidation);

      if (!card.number || !card.expirationMonth || !card.expirationYear || !card.cvv) {
        console.error('[PoyntController] ❌ Card thiếu field bắt buộc:', cardValidation);
        return res.status(400).json({
          success: false,
          error: 'ERR_INVALID_CARD_DATA',
          message: 'Missing required card fields: number, expirationMonth, expirationYear, cvv',
          details: cardValidation
        });
      }

      logger.info('[PoyntController] Processing payment', {
        orderId,
        amount,
        cardLast4: card.number.slice(-4)
      });

      // Call Poynt service to charge card
      const result = await poyntService.chargeCard(card, amount, orderId);

      console.log('==========================================');
      console.log('[PoyntController] ✅ PAYMENT SUCCESS:');
      console.log('Order ID:', orderId);
      console.log('Transaction ID:', result.id);
      console.log('Status:', result.status);
      console.log('==========================================');

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
      // LOG lỗi chi tiết
      console.error('==========================================');
      console.error('[PoyntController] ❌ PAYMENT FAILED:');
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      if (error.response) {
        console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('==========================================');
      
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
