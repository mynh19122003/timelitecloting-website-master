import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import Card from '../components/Card/Card'
import styles from './Reports.module.css'
import AdminPage from '../components/AdminPage/AdminPage'
import ordersService from '../services/ordersService'

const funnelData = [
  { stage: 'Visits', value: 1280 },
  { stage: 'Add to Cart', value: 840 },
  { stage: 'Checkout', value: 520 },
  { stage: 'Purchase', value: 368 }
]

const deviceVisits = [
  { device: 'Desktop', value: 45 },
  { device: 'Mobile', value: 33 },
  { device: 'Tablet', value: 22 }
]

const colors = ['#2a6bff', '#4dd0e1', '#f6a609', '#f2555b']

const Reports = () => {
  const [loading, setLoading] = useState(true)
  const [ordersOverTime, setOrdersOverTime] = useState([
    { hour: '0h', current: 0, previous: 0 },
    { hour: '3h', current: 0, previous: 0 },
    { hour: '6h', current: 0, previous: 0 },
    { hour: '9h', current: 0, previous: 0 },
    { hour: '12h', current: 0, previous: 0 },
    { hour: '15h', current: 0, previous: 0 },
    { hour: '18h', current: 0, previous: 0 },
    { hour: '21h', current: 0, previous: 0 }
  ])
  const [salesByDay, setSalesByDay] = useState([
    { day: 'Mon', revenue: 0 },
    { day: 'Tue', revenue: 0 },
    { day: 'Wed', revenue: 0 },
    { day: 'Thu', revenue: 0 },
    { day: 'Fri', revenue: 0 },
    { day: 'Sat', revenue: 0 },
    { day: 'Sun', revenue: 0 }
  ])
  const [revenueBreakdown, setRevenueBreakdown] = useState([
    { name: 'United States', value: 0 },
    { name: 'India', value: 0 },
    { name: 'Germany', value: 0 },
    { name: 'Australia', value: 0 },
    { name: 'Brazil', value: 0 }
  ])

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setLoading(true)
        // Load orders for reports
        const ordersRes = await ordersService.listOrders({ page: 1, limit: 1000 })
        const orders = ordersRes?.items || []
        
        // Calculate sales by day (simplified - would need proper date grouping)
        const dailySales = salesByDay.map(() => ({ day: 'Mon', revenue: 0 }))
        orders.forEach(order => {
          const dayIndex = Math.floor(Math.random() * 7) // Placeholder
          if (dailySales[dayIndex]) {
            dailySales[dayIndex].revenue += parseFloat(order.total_amount || 0) || 0
          }
        })
        setSalesByDay(dailySales)
        
        // Revenue breakdown would need country data from orders
        // For now, keep placeholder data
      } catch (error) {
        console.error('Failed to load reports data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadReportsData()
  }, [])

  if (loading) {
    return <AdminPage title="Reports" subtitle="Loading reports..."><div>Loading...</div></AdminPage>
  }

  return (
    <AdminPage title="Reports" subtitle="Analytics and performance reports for your store">
      <div className={styles.grid}>
        <Card title="Customer Growth" subtitle="Returning vs new customers (last 6 months)" bleed className={styles.fullWidth}>
          <div className={styles.chartLarge}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={salesByDay} margin={{ top: 20, right: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,32,70,0.08)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(42,107,255,0.12)' }}
                  contentStyle={{ borderRadius: 14, border: 'none', boxShadow: 'var(--shadow-soft)' }}
                />
                <Bar dataKey="revenue" fill="#2a6bff" radius={[14, 14, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Average Order Value" subtitle="Current vs previous period" bleed>
          <div className={styles.chartSmall}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ordersOverTime} margin={{ top: 20, right: 16, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,32,70,0.08)" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 14, border: 'none', boxShadow: 'var(--shadow-soft)' }}
                />
                <Line type="monotone" dataKey="current" stroke="#2a6bff" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="previous" stroke="#a0b4ff" strokeDasharray="4 4" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
              <div>
                <span className={styles.swatchPrimary} /> Current
              </div>
              <div>
                <span className={styles.swatchSecondary} /> Previous
              </div>
            </div>
          </div>
        </Card>

        <Card title="Revenue by Country" subtitle="Top five markets this period" bleed>
          <div className={styles.chartSmall}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={6}
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: 14, border: 'none', boxShadow: 'var(--shadow-soft)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className={styles.legendList}>
              {revenueBreakdown.map((entry, index) => (
                <li key={entry.name}>
                  <span className={styles.legendDot} style={{ background: colors[index % colors.length] }} />
                  <span>{entry.name}</span>
                  <strong>${entry.value.toLocaleString()}</strong>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Store Funnel" subtitle="Conversion rate across funnel stages">
          <div className={styles.funnel}>
            {funnelData.map((item, idx) => (
              <div key={item.stage} className={styles.funnelRow}>
                <span>{item.stage}</span>
                <div className={styles.funnelBar}>
                  <div style={{ width: `${(item.value / funnelData[0].value) * 100}%` }} />
                </div>
                <strong>{item.value}</strong>
                {idx === 0 && <span className={styles.rate}>Conversion 28%</span>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Visits by Device" subtitle="Share of sessions by device type">
          <ul className={styles.deviceList}>
            {deviceVisits.map((item) => (
              <li key={item.device}>
                <span>{item.device}</span>
                <div className={styles.deviceProgress}>
                  <div style={{ width: `${item.value}%` }} />
                </div>
                <strong>{item.value}%</strong>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AdminPage>
  )
}

export default Reports
