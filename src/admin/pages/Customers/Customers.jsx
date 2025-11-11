import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiDownload, FiEdit, FiSearch, FiTrash } from 'react-icons/fi'
import Button from '../../components/Button/Button'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import DataTable from '../../components/DataTable/DataTable'
import styles from './Customers.module.css'
import { listCustomers } from '../../services/customersService'

const pageSizes = [5, 10, 20]

const sortOptions = [
  { value: 'recency', label: 'Most recent order' },
  { value: 'orders', label: 'Most orders' },
  { value: 'name', label: 'Name (A-Z)' }
]

const getInitials = ({ firstName = '', lastName = '' }) => {
  const first = firstName.trim().charAt(0)
  const last = lastName.trim().charAt(0)
  return `${first || ''}${last || ''}`.toUpperCase() || 'CU'
}

const isParsableDate = (value) => {
  if (!value) return false
  return !Number.isNaN(Date.parse(value))
}

const parseOrderDate = (value) => {
  if (!isParsableDate(value)) return 0
  return Date.parse(value)
}

const getVisiblePages = (current, total) => {
  const maxButtons = 5
  const half = Math.floor(maxButtons / 2)
  let start = Math.max(1, current - half)
  let end = Math.min(total, start + maxButtons - 1)
  if (end - start < maxButtons - 1) {
    start = Math.max(1, end - maxButtons + 1)
  }
  const pages = []
  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }
  return pages
}

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [query, setQuery] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortKey, setSortKey] = useState('recency')
  const [pageSize, setPageSize] = useState(pageSizes[1])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setPage(1)
  }, [query, segmentFilter, statusFilter, sortKey, pageSize])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const { items, pagination } = await listCustomers({ page, limit: pageSize, q: query })
        if (!cancelled) {
          setCustomers(items)
          setTotal(pagination.total)
          setTotalPages(pagination.totalPages)
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Không thể tải khách hàng')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [page, pageSize, query])

  const segmentOptions = useMemo(() => {
    const segments = new Set(customers.map((customer) => customer.segment))
    return ['All', ...segments]
  }, [customers])

  const statusOptions = useMemo(() => {
    const statuses = new Set(customers.map((customer) => customer.status))
    return ['All', ...statuses]
  }, [customers])

  const filtered = useMemo(() => customers, [customers])

  const sorted = useMemo(() => {
    const next = [...filtered]
    switch (sortKey) {
      case 'value':
        return next.sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      case 'orders':
        return next.sort((a, b) => b.orders - a.orders)
      case 'name':
        return next.sort((a, b) => {
          const left = `${a.firstName} ${a.lastName}`.trim().toLowerCase()
          const right = `${b.firstName} ${b.lastName}`.trim().toLowerCase()
          return left.localeCompare(right)
        })
      case 'recency':
      default:
        return next.sort((a, b) => parseOrderDate(b.lastOrder) - parseOrderDate(a.lastOrder))
    }
  }, [filtered, sortKey])

  const pageCount = Math.max(1, Number(totalPages) || 1)

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount])

  const paginated = useMemo(() => sorted, [sorted])

  const quickFilters = useMemo(() => {
    const vipCount = customers.filter((customer) => customer.segment === 'VIP').length
    const churnCount = customers.filter((customer) => customer.status === 'Churn Risk').length
    const newCount = customers.filter((customer) => customer.segment === 'New').length

    return [
      {
        id: 'vip',
        label: 'VIP customers',
        count: vipCount,
        active: segmentFilter === 'VIP' && statusFilter === 'All',
        apply: () => {
          setSegmentFilter('VIP')
          setStatusFilter('All')
        }
      },
      {
        id: 'churn',
        label: 'Churn risk',
        count: churnCount,
        active: statusFilter === 'Churn Risk',
        apply: () => {
          setSegmentFilter('All')
          setStatusFilter('Churn Risk')
        }
      },
      {
        id: 'new',
        label: 'New customers',
        count: newCount,
        active: segmentFilter === 'New' && statusFilter === 'All',
        apply: () => {
          setSegmentFilter('New')
          setStatusFilter('All')
        }
      }
    ]
  }, [customers, segmentFilter, statusFilter])

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Status', 'Orders', 'Last Order']
    const rows = sorted.map((customer) => [
      customer.id,
      `${customer.firstName} ${customer.lastName}`.trim(),
      customer.email,
      customer.phone,
      `${customer.city}, ${customer.state}`,
      customer.status,
      customer.orders,
      customer.lastOrder
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'customers-export.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this customer?')) return
    setCustomers((prev) => prev.filter((customer) => customer.id !== id))
  }

  const resetFilters = () => {
    setQuery('')
    setSegmentFilter('All')
    setStatusFilter('All')
    setSortKey('recency')
    setPageSize(pageSizes[1])
  }
  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (value, row) => (
        <div className={styles.customerCell}>
          <span className={styles.avatar}>{getInitials(row)}</span>
          <div>
            <strong>
              {row.firstName} {row.lastName}
            </strong>
            <span>{row.id}</span>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value, row) => (
        <div className={styles.contactCell}>
          <span>{row.email}</span>
          <span>{row.phone}</span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      align: 'center',
      render: (value, row) => (row.city && row.city !== '-' ? `${row.city}, ${row.state}` : row.state || '—')
    },
    {
      key: 'orders',
      label: 'Orders',
      align: 'center',
      render: (value, row) => row.orders
    },
    {
      key: 'lastOrder',
      label: 'Last order',
      align: 'center',
      render: (value, row) => <span className={styles.metaMuted}>{row.lastOrder || '-'}</span>
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value, row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (value, row) => (
        <div className={styles.actionGroup}>
          <Link to={`/customers/${row.id}/edit`} className={styles.tableLink}>
            <FiEdit /> Edit
          </Link>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => handleDelete(row.id)}
          >
            <FiTrash /> Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <h1>Customers</h1>
          <p>Monitor retention, segment audiences, and export profiles for campaigns.</p>
        </div>
        <div className={styles.headerActions}>
          <Button type="button" variant='ghost' onClick={handleExport}>
            <FiDownload /> Export CSV
          </Button>
        </div>
      </section>

      <section className={styles.toolbar}>
        <label className={styles.search}>
          <FiSearch />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, phone, or ID"
          />
        </label>
        <div className={styles.toolbarControls}>
          <div className={styles.selectGroup}>
            <label className={styles.select}>
              Segment
              <select value={segmentFilter} onChange={(event) => setSegmentFilter(event.target.value)}>
                {segmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.select}>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.select}>
              Sort by
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.select}>
              Rows per page
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className={styles.quickFilters}>
        {quickFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`${styles.chip} ${filter.active ? styles.chipActive : ''}`}
            onClick={() => {
              filter.apply()
              setPage(1)
            }}
          >
            {filter.label}
            <span>{filter.count}</span>
          </button>
        ))}
        <button type="button" className={`${styles.chip} ${styles.ghost}`} onClick={resetFilters}>
          Reset
        </button>
      </section>

      <section className={styles.tableCard}>
        <header className={styles.tableHeader}>
          <div>
            <h2>Customer directory</h2>
            <p>
              Showing {customers.length} of {total} customers. Use filters to narrow campaigns and retention work.
            </p>
          </div>
          <div className={styles.tableActions}>
            <Button type="button" variant='ghost' onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        </header>

        <DataTable
          columns={columns}
          data={paginated}
          emptyState="No customers match your filters"
        />

        <footer className={styles.tableFooter}>
          <div>
            Showing {customers.length ? (page - 1) * pageSize + 1 : 0} -
            {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className={styles.pagination}>
            <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              Previous
            </button>
            <div>
              {getVisiblePages(page, pageCount).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={pageNumber === page ? styles.currentPage : ''}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount}>
              Next
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

export default Customers

















