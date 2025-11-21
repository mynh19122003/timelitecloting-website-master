import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiPrinter, FiRefreshCw } from 'react-icons/fi'
import AdminPage from '../../components/AdminPage/AdminPage'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import Button from '../../components/Button/Button'
import { Toast } from '../../components/Toast/Toast'
import { statusToneMap } from '../../data/orders'
import { AdminApi } from '../../api'
import styles from './Orders.module.css'

const formatCurrency = (value) => {
  const roundedValue = Math.round(value);
  return `${roundedValue.toLocaleString("vi-VN", { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })} VNĐ`;
}

const getStatusTone = (status) => statusToneMap[status?.toLowerCase()] || 'muted'

const getPaymentStatusTone = (status) => {
  const paymentToneMap = {
    paid: 'success',
    pending: 'warning',
    failed: 'critical',
    refunded: 'muted',
    cancelled: 'muted'
  }
  return paymentToneMap[status?.toLowerCase()] || 'muted'
}

const buildDetail = (order, apiData) => {
  if (!order || !apiData) {
    return null
  }

  // Map products_items from API
  const items = (apiData.products_items || []).map((item) => ({
    name: `${item.name || 'Unknown'}${item.color ? ` (${item.color})` : ''}${item.size ? ` - ${item.size}` : ''}`,
    sku: item.products_id || 'N/A',
    quantity: item.qty || 0,
    price: Number(item.price || 0),
    total: Number(item.price || 0) * (item.qty || 0)
  }))

  // Calculate subtotal from products_price
  const subtotal = Number(apiData.products_price || 0)
  // TODO: API cần trả về shipping_fee, tax_amount riêng
  // Tạm thời giả định:
  const shippingFee = 0 // Chưa có trong API
  const tax = 0 // Chưa có trong API
  const total = Number(apiData.total_price || 0)

  // Map payment method
  const paymentMethodMap = {
    credit_card: 'Credit Card',
    bank_transfer: 'Bank Transfer',
    cod: 'Cash on Delivery',
    e_wallet: 'E-Wallet'
  }
  const paymentMethod = paymentMethodMap[apiData.payment_method] || apiData.payment_method || 'N/A'

  // Map payment status
  const paymentStatusMap = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded',
    cancelled: 'Cancelled'
  }
  const paymentStatus = paymentStatusMap[apiData.payment_status] || apiData.payment_status || 'Unknown'

  // TODO: API cần trả về user_email
  const email = 'N/A' // Chưa có trong API

  return {
    email,
    phone: apiData.user_phone || 'N/A',
    shippingAddress: apiData.user_address || 'N/A',
    billingAddress: 'Same as shipping address', // TODO: API cần trả billing_address riêng nếu khác
    payment: {
      method: paymentMethod,
      status: paymentStatus,
      statusRaw: apiData.payment_status, // For badge tone mapping
      subtotal,
      tax,
      shipping: shippingFee,
      total
    },
    items,
    // TODO: API cần endpoint riêng GET /admin/orders/:id/timeline để lấy lịch sử đơn hàng
    timeline: [
      {
        id: 'placed',
        date: order.date,
        title: 'Order placed',
        description: `Order confirmed for ${order.customerName}.`
      }
    ],
    // TODO: API cần trả về order_notes hoặc admin_notes
    notes: 'No additional notes.'
  }
}

const OrderDetail = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()

  const [order, setOrder] = useState(null)
  const [apiData, setApiData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchOrder = async () => {
      if (!orderId) return
      try {
        setIsLoading(true)
        setLoadError('')
        // Ensure orderId is a string to avoid [object Object] in URL
        const orderIdStr = typeof orderId === 'string' ? orderId : String(orderId || '')
        if (!orderIdStr) {
          setLoadError('Invalid order ID')
          setIsLoading(false)
          return
        }
        const { data } = await AdminApi.get(`/orders/${encodeURIComponent(orderIdStr)}`)
        const api = data?.data
        if (!api) throw new Error('Not found')
        const createdAt = api.create_date ? new Date(api.create_date) : new Date()
        const formattedDate = createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
        const mapped = {
          id: api.order_id ? `#${api.order_id}` : `#${api.id}`,
          date: formattedDate,
          customerName: api.user_name || 'Unknown customer',
          customerLocation: api.user_address || 'N/A',
          status: (api.status || 'processing').replace(/^\w/, (c) => c.toUpperCase()),
          total: Number(api.total_price || 0)
        }
        if (!cancelled) {
          setOrder(mapped)
          setApiData(api)
          // Set initial selected status from order status
          setSelectedStatus((api.status || 'processing').toLowerCase())
        }
      } catch (error) {
        if (!cancelled) setLoadError('Failed to load order')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchOrder()
    return () => {
      cancelled = true
    }
  }, [orderId])

  const detail = useMemo(() => buildDetail(order, apiData), [order, apiData])

  const handleStatusUpdate = async () => {
    if (!orderId || !selectedStatus) return
    
    setIsUpdatingStatus(true)
    try {
      // Ensure orderId is a string
      const orderIdStr = typeof orderId === 'string' ? orderId : String(orderId || '')
      await AdminApi.patch(`/orders/${encodeURIComponent(orderIdStr)}/status`, { status: selectedStatus })
      const { data } = await AdminApi.get(`/orders/${encodeURIComponent(orderIdStr)}`)
      const api = data?.data
      if (api) {
        const createdAt = api.create_date ? new Date(api.create_date) : new Date()
        const formattedDate = createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
        const mapped = {
          id: api.order_id ? `#${api.order_id}` : `#${api.id}`,
          date: formattedDate,
          customerName: api.user_name || 'Unknown customer',
          customerLocation: api.user_address || 'N/A',
          status: (api.status || 'processing').replace(/^\w/, (c) => c.toUpperCase()),
          total: Number(api.total_price || 0)
        }
        setOrder(mapped)
        setApiData(api)
        setSelectedStatus(api.status?.toLowerCase() || 'processing')
      }
      setToast({
        type: 'success',
        message: `Order status successfully updated to "${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}"`
      })
    } catch (error) {
      console.error('Failed to update order status:', error)
      setToast({
        type: 'error',
        message: 'Failed to update order status. Please try again.'
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <AdminPage title="Order detail" subtitle="Loading order…">
        <div className={styles.detailPage} />
      </AdminPage>
    )
  }

  if (loadError || !order || !detail) {
    return (
      <AdminPage title="Order detail" subtitle="The requested order could not be found.">
        <div className={styles.detailPage}>
          <div className={styles.detailError}>
            <p>We couldn&apos;t locate that order. It may have been archived or removed.</p>
            <Button type="button" onClick={() => navigate('/admin/orders')}>
              Return to orders
            </Button>
          </div>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage title="Order detail" subtitle={`Full status and fulfilment history for ${order.id}.`}>
      <div className={styles.detailPage}>
        <header className={styles.detailHeader}>
          <div>
            <button type="button" className={styles.backLink} onClick={() => navigate('/admin/orders')}>
              <FiArrowLeft /> Back to orders
            </button>
            <h1 className={styles.detailTitle}>{order.id}</h1>
            <p className={styles.detailSubtitle}>
              {order.customerName} · {order.customerLocation}
            </p>
            <div className={styles.detailMeta}>
              <StatusBadge tone={getStatusTone(order.status)}>{order.status}</StatusBadge>
              <span>Placed on {order.date}</span>
              <span>Total {formatCurrency(order.total)}</span>
            </div>
          </div>
          <div className={styles.detailActions}>
            <Button type="button" variant="ghost">
              <FiDownload /> Export PDF
            </Button>
            <Button type="button" variant="ghost" onClick={() => window.print()}>
              <FiPrinter /> Print invoice
            </Button>
          </div>
        </header>

        <section className={styles.detailCard} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Update Order Status</h2>
            <StatusBadge tone={getStatusTone(apiData?.status || order?.status)}>
              {(apiData?.status || order?.status || 'Processing').replace(/^\w/, (c) => c.toUpperCase())}
            </StatusBadge>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ flex: 1, maxWidth: '300px' }}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={isUpdatingStatus}
                className={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <Button
              type="button"
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus || selectedStatus === apiData?.status?.toLowerCase()}
            >
              {isUpdatingStatus ? (
                <>
                  <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> Updating...
                </>
              ) : (
                <>
                  <FiRefreshCw /> Update Status
                </>
              )}
            </Button>
          </div>
        </section>

        <section className={styles.detailGrid}>
          <article className={styles.detailCard}>
            <h2>Customer</h2>
            <dl className={styles.detailList}>
              <div>
                <dt>Email</dt>
                <dd>{detail.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{detail.phone}</dd>
              </div>
              <div>
                <dt>Shipping address</dt>
                <dd>
                  {detail.shippingAddress.split('\n').map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Billing address</dt>
                <dd>{detail.billingAddress}</dd>
              </div>
            </dl>
          </article>

          <article className={styles.detailCard}>
            <h2>Payment summary</h2>
            <dl className={styles.detailList}>
              <div>
                <dt>Method</dt>
                <dd>{detail.payment.method}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge tone={getPaymentStatusTone(detail.payment.statusRaw)}>
                    {detail.payment.status}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(detail.payment.subtotal)}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{formatCurrency(detail.payment.tax)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{formatCurrency(detail.payment.shipping)}</dd>
              </div>
              <div>
                <dt>Total collected</dt>
                <dd>{formatCurrency(detail.payment.total)}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section className={styles.detailCard}>
          <h2>Line items</h2>
          <div className={styles.detailTableWrapper}>
            <table className={styles.detailTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>SKU</th>
                  <th className={styles.alignRight}>Qty</th>
                  <th className={styles.alignRight}>Price</th>
                  <th className={styles.alignRight}>Total</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((item) => (
                  <tr key={item.sku}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td className={styles.alignRight}>{item.quantity}</td>
                    <td className={styles.alignRight}>{formatCurrency(item.price)}</td>
                    <td className={styles.alignRight}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.detailGrid}>
          <article className={styles.detailCard}>
            <h2>Timeline</h2>
            <ul className={styles.timeline}>
              {detail.timeline.map((event) => (
                <li key={event.id}>
                  <span className={styles.timelineDate}>{event.date}</span>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                </li>
              ))}
            </ul>
          </article>
          <article className={styles.detailCard}>
            <h2>Notes for fulfilment</h2>
            <p className={styles.detailNotes}>{detail.notes}</p>
          </article>
        </section>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </AdminPage>
  )
}

export default OrderDetail
