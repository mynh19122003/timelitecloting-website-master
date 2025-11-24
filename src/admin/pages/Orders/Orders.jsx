import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiUploadCloud,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPrinter,
  FiEdit,
  FiTrash,
  FiX
} from 'react-icons/fi'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import Button from '../../components/Button/Button'
import DataTable from '../../components/DataTable/DataTable'
import { statusToneMap, usStates } from '../../data/orders'
import { AdminApi } from '../../api'
import styles from './Orders.module.css'

const usdCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const formatCurrency = (value) => usdCurrencyFormatter.format(Number(value || 0))

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('all')
  const [importError, setImportError] = useState('')
  const [lastImportCount, setLastImportCount] = useState(null)
  const fileInputRef = useRef(null)

  const handleImportClick = () => fileInputRef.current?.click()

  const parseCsvRecords = (rawText) => {
    const rows = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (rows.length < 2) return []

    const header =
      rows[0]
        .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        ?.map((cell) => cell.replace(/^"|"$/g, '').trim().toLowerCase()) || []

    if (!header.length) return []

    return rows.slice(1).map((row) => {
      const cells =
        row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map((cell) => cell.replace(/^"|"$/g, '').trim()) || []
      const record = {}
      header.forEach((key, index) => {
        record[key] = cells[index] ?? ''
      })
      return record
    })
  }

  const normaliseOrders = (list) =>
    list
      .map((item, index) => {
        const rawId = item.id || item.orderid || `TMP-${index + 1}`
        const displayId = rawId.startsWith('#') ? rawId : `#${rawId}`
        // Store actual order ID without # for navigation
        const actualOrderId = rawId.replace(/^#/, '')
        return {
          id: displayId,
          orderId: actualOrderId, // Store actual order ID for navigation
          date:
            item.date ||
            item.createdat ||
            new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
          customerName: item.customerName || item.customer || item.name || 'Unknown customer',
          customerLocation: item.customerLocation || item.location || 'N/A',
          status: item.status || 'Processing',
          total: Number(item.total ?? item.amount ?? item.totalAmount ?? 0) || 0
        }
      })
      .filter((order) => order.id && order.customerName)

  const mapApiOrders = (apiOrders) =>
    (apiOrders || []).map((order) => {
      const createdAt = order.create_date ? new Date(order.create_date) : new Date()
      const formattedDate = createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      const displayId = order.order_id ? `#${order.order_id}` : `#${order.id}`
      // Store the actual order ID for navigation (order_id or id from API)
      const actualOrderId = order.order_id || order.id || ''
      return {
        id: displayId,
        orderId: actualOrderId, // Store actual order ID for navigation
        date: formattedDate,
        customerName: order.user_name || 'Unknown customer',
        customerLocation: order.user_address || 'N/A',
        status: (order.status || 'processing').replace(/^\w/, (c) => c.toUpperCase()),
        total: Number(order.total_price || 0)
      }
    })

  const handleImportChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = reader.result
        const isCsv =
          file.type === 'text/csv' ||
          file.name.toLowerCase().endsWith('.csv')

        const parsed = isCsv ? parseCsvRecords(raw) : JSON.parse(raw)
        if (!Array.isArray(parsed)) throw new Error('File must contain a list of orders')

        const mapped = normaliseOrders(parsed)
        if (!mapped.length) throw new Error('No valid orders found in file')

        setOrders(mapped)
        setImportError('')
        setLastImportCount(mapped.length)
      } catch (error) {
        setImportError(error.message || 'Unable to read file')
        setLastImportCount(null)
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const filterOptions = useMemo(() => {
    const counts = orders.reduce(
      (acc, order) => {
        const key = order.status.toLowerCase()
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      { processing: 0, pending: 0, delivered: 0, cancelled: 0, shipped: 0, packed: 0 }
    )

    return [
      { value: 'all', label: 'All orders', count: orders.length },
      { value: 'processing', label: 'Processing', count: counts.processing + counts.packed + counts.shipped },
      { value: 'pending', label: 'Pending', count: counts.pending },
      { value: 'delivered', label: 'Delivered', count: counts.delivered },
      { value: 'cancelled', label: 'Cancelled', count: counts.cancelled }
    ]
  }, [orders])

  const visibleOrders = useMemo(() => {
    const matchesStatus = (order) => {
      if (activeFilter === 'all') return true
      const key = order.status.toLowerCase()
      if (activeFilter === 'processing') {
        return key === 'processing' || key === 'packed' || key === 'shipped'
      }
      return key === activeFilter
    }

    const matchesSearch = (order) => {
      if (!searchTerm.trim()) return true
      const term = searchTerm.trim().toLowerCase()
      const haystack = [
        order.id,
        order.customerName,
        order.customerLocation,
        order.status,
        order.date,
        order.total,
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total)
      ]

      return haystack
        .map((value) => String(value).toLowerCase())
        .some((value) => value.includes(term))
    }

    const matchesLocation = (order) => {
      if (selectedState === 'all') return true
      return order.customerLocation.toLowerCase().includes(selectedState.toLowerCase())
    }

    return orders.filter((order) => matchesStatus(order) && matchesSearch(order) && matchesLocation(order))
  }, [orders, activeFilter, searchTerm, selectedState])

  const getStatusTone = (status) => statusToneMap[status.toLowerCase()] || 'muted'

  const totalCount = visibleOrders.length
  const showingCount = visibleOrders.length

  useEffect(() => {
    if (!searchTerm.trim()) return
    if (activeFilter !== 'all') {
      setActiveFilter('all')
    }
    if (selectedState !== 'all') {
      setSelectedState('all')
    }
  }, [searchTerm, activeFilter, selectedState])

  useEffect(() => {
    let cancelled = false
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        setLoadError('')
        const { data } = await AdminApi.get('/orders', {
          params: { page: 1, limit: 100 }
        })
        const apiList = data?.data?.orders || []
        const mapped = mapApiOrders(apiList)
        if (!cancelled) setOrders(mapped)
      } catch (error) {
        if (!cancelled) setLoadError('Failed to load orders')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchOrders()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const downloadFile = (fileName, content, mimeType = 'text/csv') => {
    if (typeof window === 'undefined') return
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const escapeCsv = (value) => {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const handleDownloadSummary = () => {
    const statusCounts = orders.reduce((acc, order) => {
      const key = order.status || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total || 0), 0)
    const summaryRows = [
      ['Metric', 'Value'],
      ['Total orders', orders.length],
      ['Visible orders', visibleOrders.length],
      ['Active filter', activeFilter],
      ['Selected state', selectedState],
      ['Search term', searchTerm || 'None'],
      ['Total revenue', formatCurrency(totalRevenue)],
      ['', ''],
      ['Status', 'Count'],
      ...Object.entries(statusCounts).map(([status, count]) => [status, count])
    ]

    const csv = summaryRows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    downloadFile('orders-summary.csv', csv)
  }

  const handleExportCsv = () => {
    if (!visibleOrders.length) return

    const headers = ['Order ID', 'Date', 'Customer', 'Location', 'Status', 'Total']
    const rows = visibleOrders.map((order) => [
      order.id,
      order.date,
      order.customerName,
      order.customerLocation,
      order.status,
      formatCurrency(order.total)
    ])

    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
    downloadFile('orders-export.csv', csv)
  }

  const handlePrintSlip = () => {
    if (!visibleOrders.length || typeof window === 'undefined') return

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return

    const rows = visibleOrders
      .map(
        (order) => `
          <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.date)}</td>
            <td>${escapeHtml(order.customerName)}</td>
            <td>${escapeHtml(order.customerLocation)}</td>
            <td>${escapeHtml(order.status)}</td>
            <td style="text-align:right;">${escapeHtml(formatCurrency(order.total))}</td>
          </tr>
        `
      )
      .join('')

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Order slips</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 16px; font-size: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            th { text-align: left; background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Order slips (${visibleOrders.length})</h1>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Status</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handleDelete = (id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id))
  }

  const columns = [
    {
      key: 'select',
      label: '',
      render: () => <input type="checkbox" />
    },
    {
      key: 'order',
      label: 'Order',
      render: (value, row) => (
        <div className={styles.orderCell}>
          <strong>{row.id}</strong>
          <span>{row.date}</span>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value, row) => (
        <div className={styles.customerCell}>
          <div className={styles.avatar}>{row.customerName.slice(0, 1)}</div>
          <div>
            <strong>{row.customerName}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      render: (value, row) => <span>{row.customerLocation}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => <StatusBadge tone={getStatusTone(row.status)}>{row.status}</StatusBadge>
    },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      render: (value, row) => formatCurrency(row.total)
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (value, row) => {
        // Get the actual order ID for navigation (orderId or fallback to id without #)
        const orderId = row.orderId || row.id.replace('#', '')
        // Ensure orderId is a string and properly encoded
        const orderIdStr = typeof orderId === 'string' ? orderId : String(orderId || '')
        return (
          <div className={styles.actionGroup}>
            <Link
              to={`/admin/orders/${encodeURIComponent(orderIdStr)}`}
              className={styles.tableLink}
            >
              <FiEdit /> View
            </Link>
            <button
              type='button'
              className={styles.deleteButton}
              onClick={() => handleDelete(row.id)}
            >
              <FiTrash /> Delete
            </button>
          </div>
        )
      }
    }
  ];

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <h1>Orders</h1>
          <p>Track, export, and fulfil orders across your catalogues.</p>
        </div>
        <div className={styles.headerActions}>
          <input type='file' className={styles.hiddenInput} ref={fileInputRef} onChange={handleImportChange} />
          <Button type='button' variant='ghost' onClick={handleImportClick}>
            <FiUploadCloud />
            Import orders
          </Button>
          <Button type='button' variant='primary' onClick={handleDownloadSummary}>
            <FiDownload />
            Download summary
          </Button>
        </div>
      </section>

      {importError && (
        <div className={`${styles.importFeedback} ${styles.importError}`} role='alert'>
          {importError}
        </div>
      )}
      {lastImportCount !== null && !importError && (
        <div className={styles.importFeedback} role='status'>
          Imported {lastImportCount} orders successfully.
        </div>
      )}

      <section className={styles.toolbar}>
        <form
          className={styles.search}
          role='search'
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <FiSearch aria-hidden='true' />
          <input
            type='search'
            placeholder='Search orders, customers, or reference...'
            aria-label='Search orders'
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm.trim() ? (
            <button
              type='button'
              className={styles.clearSearch}
              onClick={handleClearSearch}
              aria-label='Clear search'
            >
              <FiX />
            </button>
          ) : null}
        </form>

        <div className={styles.toolbarControls}>
          <div className={styles.selectGroup}>
            <label className={styles.select}>
              Status
              <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.select}>
              State
              <select value={selectedState} onChange={(event) => setSelectedState(event.target.value)}>
                <option value='all'>All states</option>
                {usStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Button type='button' variant='ghost'>
            <FiFilter />
            Filter
          </Button>
        </div>
      </section>

      <section className={styles.filterChips}>
        {filterOptions.map((chip) => (
          <button
            key={chip.value}
            type='button'
            onClick={() => setActiveFilter(chip.value)}
            disabled={chip.value !== 'all' && chip.count === 0}
            className={`${styles.chip} ${activeFilter === chip.value ? styles.chipActive : ''}`}
          >
            {chip.label}
            <span>{chip.count}</span>
          </button>
        ))}
      </section>

      <section className={styles.tableCard}>
        <header className={styles.tableHeader}>
          <div>
            <h2>Order pipeline</h2>
            <p>Review newest orders, export details, or print slips for your packing area.</p>
          </div>
          <div className={styles.tableActions}>
            <Button
              type='button'
              variant='ghost'
              onClick={handleExportCsv}
              disabled={!visibleOrders.length}
            >
              <FiDownload />
              Export CSV
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={handlePrintSlip}
              disabled={!visibleOrders.length}
            >
              <FiPrinter />
              Print slip
            </Button>
          </div>
        </header>

        {loadError ? (
          <div className={styles.importFeedback} role='alert'>{loadError}</div>
        ) : (
          <DataTable
            columns={columns}
            data={isLoading ? [] : visibleOrders}
            emptyState={isLoading ? 'Loading orders…' : 'No orders found'}
          />
        )}

        <footer className={styles.tableFooter}>
          <span>
            {showingCount > 0
              ? `Showing 1-${showingCount} of ${totalCount} orders`
              : `Showing 0 of ${totalCount} orders`}
          </span>
          <div className={styles.pagination}>
            <button type='button' disabled>
              Prev
            </button>
            <div>
              <button type='button' className={styles.currentPage}>
                1
              </button>
              <button type='button'>2</button>
              <button type='button'>3</button>
              <button type='button'>4</button>
            </div>
            <button type='button'>Next</button>
          </div>
        </footer>
      </section>
    </div>
  )
}

export default Orders
