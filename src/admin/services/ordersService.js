import { AdminApi } from '../api'

export const listOrders = async ({ page = 1, limit = 10, status, order_id } = {}) => {
  try {
    const res = await AdminApi.get('/orders', {
      params: { page, limit, status, order_id }
    })
    
    const payload = res?.data || {}
    const data = payload?.data || payload || {}
    const orders = Array.isArray(data.orders) ? data.orders : []
    const pagination = data.pagination || {}
    
    return {
      items: orders.map(order => ({
        id: order.order_id || order.id,
        order_id: order.order_id,
        customer_name: order.customer_name || order.customer_email || 'Customer',
        customer_email: order.customer_email,
        total_amount: order.total_amount || order.total || 0,
        status: order.status || 'pending',
        created_at: order.created_at || order.created_date,
        updated_at: order.updated_at || order.updated_date,
        items: order.items || []
      })),
      pagination: {
        page: Number(pagination.page) || page,
        limit: Number(pagination.limit) || limit,
        total: Number(pagination.total) || orders.length,
        totalPages: Number(pagination.totalPages) || 1
      }
    }
  } catch (error) {
    console.error('Failed to list orders:', error)
    throw error
  }
}

export const getOrder = async (orderId) => {
  try {
    const res = await AdminApi.get(`/orders/${orderId}`)
    const payload = res?.data || {}
    const data = payload?.data || payload || {}
    
    return {
      id: data.order_id || data.id,
      order_id: data.order_id,
      customer_name: data.customer_name || data.customer_email || 'Customer',
      customer_email: data.customer_email,
      total_amount: data.total_amount || data.total || 0,
      status: data.status || 'pending',
      created_at: data.created_at || data.created_date,
      updated_at: data.updated_at || data.updated_date,
      items: data.items || []
    }
  } catch (error) {
    console.error('Failed to get order:', error)
    throw error
  }
}

export default {
  listOrders,
  getOrder
}


