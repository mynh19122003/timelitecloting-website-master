const orderService = require('../services/orderService');
const poyntService = require('../services/poyntService');


// Simple in-memory rate limiting (for production, use Redis)
const orderRateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ORDERS_PER_MINUTE = 5;

class OrderController {
  async createOrder(req, res) {
    try {
      // Support both authenticated users and guest checkout
      const userId = req.user ? req.user.userId : null;
      
      // Rate limiting check (only for authenticated users)
      if (userId) {
        const now = Date.now();
        const userLimits = orderRateLimits.get(userId) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
        
        if (now > userLimits.resetAt) {
          // Reset window
          userLimits.count = 0;
          userLimits.resetAt = now + RATE_LIMIT_WINDOW;
        }
        
        if (userLimits.count >= MAX_ORDERS_PER_MINUTE) {
          return res.status(429).json({
            error: 'ERR_TOO_MANY_REQUESTS',
            message: 'Too many orders. Please wait a moment before placing another order.'
          });
        }
        
        userLimits.count++;
        orderRateLimits.set(userId, userLimits);
      }
      
      const { 
        items, 
        firstname, 
        lastname, 
        address, 
        phonenumber, 
        payment_method, 
        notes, 
        total_amount,
        email,
        company,
        street_address,
        apartment,
        city,
        state,
        zip,
        country,
        shipping_method,
        shipping_cost,
        shipping_firstname,
        shipping_lastname,
        shipping_company,
        shipping_address,
        shipping_phone,
        billing_firstname,
        billing_lastname,
        billing_company,
        billing_address,
        billing_phone
      } = req.body;

      const orderDetails = {
        firstname,
        lastname,
        address,
        phonenumber,
        payment_method,
        notes,
        total_amount,
        email,
        company,
        street_address,
        apartment,
        city,
        state,
        zip,
        country,
        shipping_method,
        shipping_cost,
        shipping_firstname,
        shipping_lastname,
        shipping_company,
        shipping_address,
        shipping_phone,
        billing_firstname,
        billing_lastname,
        billing_company,
        billing_address,
        billing_phone
      };
      
      const order = await orderService.createOrder(userId, items, orderDetails);
      
      // Calculate total price for payment processing
      const totalPrice = total_amount || order.total_price || 0;
      
      let paymentUrl = null;
      let paymentErrorMsg = null;
      let transactionResult = null;

      if (payment_method === 'poynt') {
        try {
          // If we have a nonce, we perform a direct charge (Poynt Collect flow)
          if (req.body.payment_nonce) {
             console.log('Processing Poynt Collect Payment (Nonce)...');
             transactionResult = await poyntService.chargeNonce(
                 req.body.payment_nonce, 
                 totalPrice, 
                 order.order_id
             );
             paymentUrl = null; 
          }
          // Server-Side Tokenization Fallback
          else if (req.body.payment_card) {
               console.log('Processing Poynt Direct Card Payment (Server Tokenization)...');
               transactionResult = await poyntService.chargeCard(
                   req.body.payment_card,
                   totalPrice,
                   order.order_id
               );
               paymentUrl = null;
          } 
          else {
             // Fallback to Hosted Checkout/Pay Link flow (Legacy/Backwards compatibility)
             console.log('Generating Poynt Payment URL (Hosted)...');
             /* ... existing hosted logic ... */
             
              // Use enriched items from the order result (which includes prices fetched from DB)
              /* ... */
              let enrichedItems = [];
              if (typeof order.products_items === 'string') {
                  try { enrichedItems = JSON.parse(order.products_items); } catch (e) { enrichedItems = items; }
              } else if (Array.isArray(order.products_items)) {
                  enrichedItems = order.products_items;
              } else {
                  enrichedItems = items;
              }

              const poyntPayload = {
                ...orderDetails,
                items: enrichedItems,
                order_id: order.order_id 
              };
              paymentUrl = await poyntService.createPaymentUrl(poyntPayload);
              console.log('Poynt URL Generated:', paymentUrl);
          }
        } catch (poyntError) {
          console.error('Failed to process Poynt Payment:', poyntError);
          paymentErrorMsg = poyntError.message || JSON.stringify(poyntError);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
        paymentUrl: paymentUrl, // Add payment URL to response
        paymentError: paymentErrorMsg // Return error if any
      });
    } catch (error) {
      if (error.message === 'ERR_PRODUCT_NOT_FOUND') {
        return res.status(404).json({
          error: 'ERR_PRODUCT_NOT_FOUND',
          message: 'One or more products not found'
        });
      }
      
      if (error.message === 'ERR_INSUFFICIENT_STOCK') {
        return res.status(400).json({
          error: 'ERR_INSUFFICIENT_STOCK',
          message: 'Insufficient stock for one or more products'
        });
      }
      
      console.error('Create order error:', error);
      res.status(500).json({
        error: 'ERR_CREATE_ORDER_FAILED',
        message: 'Failed to create order'
      });
    }
  }

  async getOrderHistory(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await orderService.getOrderHistory(
        userId,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        error: 'ERR_GET_ORDER_HISTORY_FAILED',
        message: 'Failed to get order history'
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const order = await orderService.getOrderById(parseInt(id), userId);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      if (error.message === 'ERR_ORDER_NOT_FOUND') {
        return res.status(404).json({
          error: 'ERR_ORDER_NOT_FOUND',
          message: 'Order not found'
        });
      }
      
      res.status(500).json({
        error: 'ERR_GET_ORDER_FAILED',
        message: 'Failed to get order'
      });
    }
  }
}

module.exports = new OrderController();
