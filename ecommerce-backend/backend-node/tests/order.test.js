const request = require('supertest');
const app = require('../src/app');

describe('Order Management Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Register and login a user for testing
    const userData = {
      email: 'ordertest@example.com',
      password: 'password123'
    };

    const registerResponse = await request(app)
      .post('/api/users/register')
      .send(userData);

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('POST /api/orders', () => {
    it('should create order successfully', async () => {
      const orderData = {
        items: [
          {
            product_id: 1,
            quantity: 2
          },
          {
            product_id: 2,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.user_id).toBe(userId);
      expect(response.body.data).toHaveProperty('total_amount');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.items).toHaveLength(2);
    });

    it('should fail to create order without token', async () => {
      const orderData = {
        items: [
          {
            product_id: 1,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(response.body.error).toBe('ERR_MISSING_TOKEN');
    });

    it('should fail to create order with invalid product', async () => {
      const orderData = {
        items: [
          {
            product_id: 99999,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(404);

      expect(response.body.error).toBe('ERR_PRODUCT_NOT_FOUND');
    });

    it('should fail to create order with insufficient stock', async () => {
      const orderData = {
        items: [
          {
            product_id: 1,
            quantity: 99999
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe('ERR_INSUFFICIENT_STOCK');
    });

    it('should fail to create order with empty items', async () => {
      const orderData = {
        items: []
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe('ERR_VALIDATION_FAILED');
    });

    it('should fail to create order with invalid quantity', async () => {
      const orderData = {
        items: [
          {
            product_id: 1,
            quantity: 0
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe('ERR_VALIDATION_FAILED');
    });
  });

  describe('GET /api/orders/history', () => {
    it('should get order history successfully', async () => {
      const response = await request(app)
        .get('/api/orders/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.orders)).toBe(true);
    });

    it('should get order history with pagination', async () => {
      const response = await request(app)
        .get('/api/orders/history?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should fail to get order history without token', async () => {
      const response = await request(app)
        .get('/api/orders/history')
        .expect(401);

      expect(response.body.error).toBe('ERR_MISSING_TOKEN');
    });
  });

  describe('GET /api/orders/:id', () => {
    let orderId;

    beforeAll(async () => {
      // Create an order first
      const orderData = {
        items: [
          {
            product_id: 1,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      orderId = response.body.data.id;
    });

    it('should get order by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.user_id).toBe(userId);
      expect(response.body.data).toHaveProperty('items');
    });

    it('should fail to get non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('ERR_ORDER_NOT_FOUND');
    });

    it('should fail to get order without token', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(401);

      expect(response.body.error).toBe('ERR_MISSING_TOKEN');
    });
  });
});
