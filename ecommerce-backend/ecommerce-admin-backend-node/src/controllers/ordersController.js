const ordersService = require('../services/ordersService');

class OrdersController {
  // GET list via query params
  async listGet(req, res) {
    try {
      const { page = 1, limit = 10, status, order_id } = req.query || {};
      const result = await ordersService.listOrders(parseInt(page), parseInt(limit), { status, order_id });
      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ error: 'ERR_GET_ORDERS_FAILED', message: 'Failed to get orders' });
    }
  }

  async list(req, res) {
    try {
      const { page = 1, limit = 10, status, order_id } = req.body || {};
      const result = await ordersService.listOrders(parseInt(page), parseInt(limit), { status, order_id });
      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ error: 'ERR_GET_ORDERS_FAILED', message: 'Failed to get orders' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await ordersService.getOrderById(parseInt(id));
      return res.json({ success: true, data: order });
    } catch (err) {
      if (err.message === 'ERR_ORDER_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_ORDER_NOT_FOUND', message: 'Order not found' });
      }
      return res.status(500).json({ error: 'ERR_GET_ORDER_FAILED', message: 'Failed to get order' });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params; // here id represents order_id, e.g. ORD00001
      const { status } = req.body;
      const updated = await ordersService.updateOrderStatusByOrderId(id, status);
      return res.json({ success: true, message: 'Order status updated successfully', data: updated });
    } catch (err) {
      if (err.message === 'ERR_ORDER_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_ORDER_NOT_FOUND', message: 'Order not found' });
      }
      return res.status(500).json({ error: 'ERR_UPDATE_ORDER_STATUS_FAILED', message: 'Failed to update order status' });
    }
  }

  async getByOrderId(req, res) {
    try {
      const orderId = req.params.orderId || req.params.id; // support both :orderId and :id
      const order = await ordersService.getOrderByOrderId(orderId);
      return res.json({ success: true, data: order });
    } catch (err) {
      if (err.message === 'ERR_ORDER_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_ORDER_NOT_FOUND', message: 'Order not found' });
      }
      return res.status(500).json({ error: 'ERR_GET_ORDER_FAILED', message: 'Failed to get order' });
    }
  }
}

module.exports = new OrdersController();



