import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiActivity,
  FiTrendingUp
} from 'react-icons/fi'
import styles from './Dashboard.module.css'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import productsService from '../../services/productsService'
import ordersService from '../../services/ordersService'
import { listCustomers } from '../../services/customersService'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    revenue: { value: '$0', change: '0%', trend: 'up' },
    orders: { value: '0', change: '0%', trend: 'up' },
    visits: { value: '0', change: '0%', trend: 'up' },
    newCustomers: { value: '0', change: '0%', trend: 'up' },
    returningCustomers: { value: '0', change: '0%', trend: 'up' }
  })
  const [transactions, setTransactions] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        // Load orders for transactions and revenue
        const ordersRes = await ordersService.listOrders({ page: 1, limit: 5 })
        const orders = ordersRes?.items || []
        
        // Load products for top products
        const productsRes = await productsService.listProducts({ page: 1, limit: 5 })
        const products = productsRes?.items || []
        
        // Load customers for customer metrics
        const customersRes = await listCustomers({ page: 1, limit: 100 })
        const customers = customersRes?.items || []
        
        // Calculate metrics
        const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount || 0) || 0), 0)
        const revenueValue = `$${(totalRevenue / 1000).toFixed(2)}k`
        
        // Set transactions from recent orders
        setTransactions(orders.slice(0, 5).map((order, index) => {
          const name = order.customer_name || 'Customer'
          return {
            id: order.id || order.order_id || `tx-${index}`,
            name,
            date: order.created_at
              ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '-',
            amount: `$${parseFloat(order.total_amount || 0).toFixed(2)}`,
            status: order.status || 'Pending'
          }
        }))
        
        // Set top products
        setTopProducts(products.slice(0, 5).map((product, index) => ({
          id: product.id || product.product_id || `prod-${index}`,
          name: product.name,
          sku: product.sku || '-',
          price: product.pricing?.listPrice || '$0',
          units: 0, // Would need order items data
          image: product.image || ''
        })))
        
        // Set metrics
        setMetrics({
          revenue: { value: revenueValue, change: '+0%', trend: 'up' },
          orders: { value: orders.length.toString(), change: '+0%', trend: 'up' },
          visits: { value: '0', change: '0%', trend: 'up' },
          newCustomers: { value: customers.length.toString(), change: '+0%', trend: 'up' },
          returningCustomers: { value: '0', change: '0%', trend: 'up' }
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  const metricCards = [
    { label: 'Total Revenue', value: metrics.revenue.value, change: metrics.revenue.change, trend: metrics.revenue.trend, icon: FiDollarSign },
    { label: 'Orders', value: metrics.orders.value, change: metrics.orders.change, trend: metrics.orders.trend, icon: FiShoppingBag },
    { label: 'Unique Visits', value: metrics.visits.value, change: metrics.visits.change, trend: metrics.visits.trend, icon: FiActivity },
    { label: 'New Customers', value: metrics.newCustomers.value, change: metrics.newCustomers.change, trend: metrics.newCustomers.trend, icon: FiUsers },
    { label: 'Returning Customers', value: metrics.returningCustomers.value, change: metrics.returningCustomers.change, trend: metrics.returningCustomers.trend, icon: FiTrendingUp }
  ]

  const ordersSummary = [
    { label: 'Orders Today', value: '0' },
    { label: 'Orders Yesterday', value: '0' }
  ]

  const lineSeries = {
    current: [14, 18, 24, 31, 28, 36, 42, 38, 46, 40, 48, 44],
    previous: [10, 12, 18, 20, 18, 22, 28, 26, 30, 28, 34, 32]
  }

  const timeLabels = ['4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm']

  const salesSnapshot = {
    items: '0',
    revenue: '$0',
    highlight: '$0',
    bars: [
      { label: '12', value: 0 },
      { label: '13', value: 0 },
      { label: '14', value: 0 },
      { label: '15', value: 0, highlight: true },
      { label: '16', value: 0 },
      { label: '17', value: 0 },
      { label: '18', value: 0 }
    ]
  }

  const buildPolyline = (series) => {
    const allValues = [...lineSeries.current, ...lineSeries.previous]
    const max = Math.max(...allValues) || 1
    const min = Math.min(...allValues)
    const range = Math.max(max - min, 1)

    return series
      .map((value, index) => {
        const x = (index / (series.length - 1 || 1)) * 100
        const y = 100 - ((value - min) / range) * 80 - 10
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  const ordersPolyline = useMemo(() => buildPolyline(lineSeries.current), [])
  const previousPolyline = useMemo(() => buildPolyline(lineSeries.previous), [])
  const chartRef = useRef(null)

  useEffect(() => {
    const svg = chartRef.current
    if (!svg) return

    const lines = Array.from(
      svg.querySelectorAll(`.${styles.chartLineCurrent}, .${styles.chartLinePrevious}`)
    )

    lines.forEach((line) => {
      if (typeof line.getTotalLength !== 'function') return
      const length = line.getTotalLength()
      line.style.setProperty('--line-length', `${length}`)
      line.style.strokeDasharray = `${length}`
      line.style.strokeDashoffset = `${length}`
    })

    const frame = requestAnimationFrame(() => {
      svg.classList.add(styles.chartCanvasAnimate)
      lines.forEach((line) => {
        line.style.strokeDashoffset = '0'
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      svg.classList.remove(styles.chartCanvasAnimate)
      lines.forEach((line) => {
        line.style.strokeDashoffset = '0'
      })
    }
  }, [ordersPolyline, previousPolyline])

  return (
    <div className={styles.page}>
      <section className={styles.metricsRow}>
        {metricCards.map(({ label, value, change, trend, icon: Icon }) => (
          <article key={label} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>{label}</span>
              <span
                className={`${styles.metricDelta} ${trend === 'up' ? styles.deltaPositive : styles.deltaNegative}`}
              >
                {change}
              </span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricIcon}>
                <Icon />
              </span>
              <strong className={styles.metricValue}>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.mainGrid}>
        <div className={styles.ordersCard}>
          <header className={styles.cardHeader}>
            <div>
              <h2>Orders over time</h2>
              <p>Last 12 hours</p>
            </div>
            <button type="button" className={styles.exportBtn}>
              Export report
            </button>
          </header>

          <div className={styles.ordersSummary}>
            {ordersSummary.map((item) => (
              <div key={item.label} className={styles.summaryItem}>
                <span className={styles.summaryValue}>{item.value}</span>
                <span className={styles.summaryLabel}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.chartSurface}>
            <svg
              ref={chartRef}
              className={styles.chartCanvas}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="currentLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(66, 118, 255, 0.35)" />
                  <stop offset="100%" stopColor="rgba(66, 118, 255, 0)" />
                </linearGradient>
              </defs>
              <polyline
                points={`${ordersPolyline} 100,90 0,90`}
                fill="url(#currentLineGradient)"
                className={styles.chartFill}
              />
              <polyline points={previousPolyline} className={styles.chartLinePrevious} fill="none" />
              <polyline points={ordersPolyline} className={styles.chartLineCurrent} fill="none" />
              {lineSeries.current.map((value, index) => {
                const point = ordersPolyline.split(' ')[index]
                const [cx, cy] = point.split(',').map(Number)
                return <circle key={value + index} cx={cx} cy={cy} r={1.5} className={styles.chartDot} />
              })}
            </svg>
            <footer className={styles.chartLegend}>
              {timeLabels.map((label, index) => (
                <span key={label} className={index % 2 === 0 ? '' : styles.hiddenLabel}>
                  {label}
                </span>
              ))}
            </footer>
          </div>
        </div>

        <aside className={styles.salesCard}>
          <header className={styles.salesHeader}>
            <h3>Last 7 days sales</h3>
            <span className={styles.salesSubhead}>Performance snapshot</span>
          </header>
          <div className={styles.salesSummary}>
            <div>
              <span className={styles.salesMetric}>{salesSnapshot.items}</span>
              <span className={styles.salesLabel}>Items sold</span>
            </div>
            <div>
              <span className={styles.salesMetric}>{salesSnapshot.revenue}</span>
              <span className={styles.salesLabel}>Revenue</span>
            </div>
          </div>
          <div className={styles.salesBars}>
            {salesSnapshot.bars.map((bar) => (
              <div key={bar.label} className={`${styles.barWrapper} ${bar.highlight ? styles.barHighlight : ''}`}>
                <div className={styles.bar} style={{ height: `${Math.max(bar.value, 6)}%` }} />
                <span className={styles.barLabel}>{bar.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.salesCallout}>
            <span className={styles.calloutLabel}>Best day</span>
            <strong>{salesSnapshot.highlight}</strong>
          </div>
        </aside>
      </section>

      <section className={styles.bottomGrid}>
        <div className={styles.transactionsCard}>
          <header className={styles.cardHeader}>
            <div>
              <h3>Recent transactions</h3>
              <p>Latest payments from the past week</p>
            </div>
            <button type="button" className={styles.viewAllBtn}>
              View all
            </button>
          </header>

          <table className={styles.transactionsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th className={styles.alignRight}>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id || `${transaction.name}-${index}`}>
                  <td>{transaction.name}</td>
                  <td>{transaction.date}</td>
                  <td className={styles.alignRight}>{transaction.amount}</td>
                  <td className={styles.statusCell}>
                    <span
                      className={`${styles.statusPill} ${
                        transaction.status === 'Paid' ? styles.statusPaid : styles.statusPending
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.productsCard}>
          <header className={styles.cardHeader}>
            <div>
              <h3>Top products by units sold</h3>
              <p>Performance across the last 7 days</p>
            </div>
          </header>

                    <table className={styles.productsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th className={styles.alignRight}>Price</th>
                <th className={styles.alignRight}>Units sold</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.id || product.sku || `${product.name}-${index}`}>
                  <td>
                    <div className={styles.productCell}>
                      <img src={product.image} alt={product.name} className={styles.productThumb} />
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.name}</span>
                        <span className={styles.productMeta}>{product.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.alignRight}>{product.price}</td>
                  <td className={styles.alignRight}>{product.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Dashboard





