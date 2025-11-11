import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiDownload, FiEye, FiPlus, FiRepeat, FiSearch, FiTrash } from 'react-icons/fi'
import Button from '../../components/Button/Button'
import DataTable from '../../components/DataTable/DataTable'
import styles from './Coupons.module.css'
import { ensureTypeLabel, statusTone, getTypeMeta, parseDateValue, normalizeCoupon } from './utils'

const pageSizes = [5, 10, 20]

const sortOptions = [
  { value: 'recent', label: 'Newest start date' },
  { value: 'ending', label: 'Ending soon' },
  { value: 'usage', label: 'Highest usage' },
  { value: 'name', label: 'Name (A-Z)' }
]

const getVisiblePages = (current, total) => {
  const max = 5
  const half = Math.floor(max / 2)
  let start = Math.max(1, current - half)
  let end = Math.min(total, start + max - 1)
  if (end - start < max - 1) {
    start = Math.max(1, end - max + 1)
  }
  const pages = []
  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }
  return pages
}

const isExpiringSoon = (coupon) => {
  const end = parseDateValue(coupon.endDate)
  if (!Number.isFinite(end)) return false
  const now = Date.now()
  const diff = end - now
  return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 7
}

const Coupons = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortKey, setSortKey] = useState('recent')
  const [pageSize, setPageSize] = useState(pageSizes[0])
  const [page, setPage] = useState(1)

  useEffect(() => {
    const incoming = location.state?.newCoupon
    if (!incoming) return

    setCoupons((prev) => {
      const normalized = normalizeCoupon(incoming)
      const index = prev.findIndex((item) => item.id === normalized.id)
      if (index === -1) {
        return [normalized, ...prev]
      }
      const next = [...prev]
      next[index] = normalizeCoupon(incoming, prev[index])
      return next
    })

    setPage(1)
    navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter, typeFilter, sortKey, pageSize])

  const statusOptions = useMemo(() => {
    const unique = new Set(coupons.map((coupon) => coupon.status))
    return ['All', ...unique]
  }, [coupons])

  const typeOptions = useMemo(() => {
    const unique = new Set(coupons.map((coupon) => ensureTypeLabel(coupon.type)))
    return ['All', ...unique]
  }, [coupons])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return coupons.filter((coupon) => {
      if (statusFilter !== 'All' && coupon.status !== statusFilter) return false
      if (typeFilter !== 'All' && ensureTypeLabel(coupon.type) !== typeFilter) return false
      if (!needle) return true
      return [
        coupon.name,
        coupon.code,
        coupon.type,
        coupon.status,
        coupon.appliesTo
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [coupons, query, statusFilter, typeFilter])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sortKey) {
      case 'usage':
        return list.sort((a, b) => b.usage - a.usage)
      case 'ending':
        return list.sort((a, b) => parseDateValue(a.endDate, Number.POSITIVE_INFINITY) - parseDateValue(b.endDate, Number.POSITIVE_INFINITY))
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      case 'recent':
      default:
        return list.sort((a, b) => parseDateValue(b.startDate, 0) - parseDateValue(a.startDate, 0))
    }
  }, [filtered, sortKey])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  const quickFilters = useMemo(() => {
    const activeCount = coupons.filter((coupon) => coupon.status === 'Active').length
    const scheduledCount = coupons.filter((coupon) => coupon.status === 'Scheduled').length
    const expiringSoon = coupons.filter(isExpiringSoon).length
    const freeShipping = coupons.filter((coupon) => ensureTypeLabel(coupon.type) === 'Free Shipping').length

    return [
      {
        id: 'active',
        label: 'Active campaigns',
        count: activeCount,
        active: statusFilter === 'Active' && typeFilter === 'All',
        apply: () => {
          setStatusFilter('Active')
          setTypeFilter('All')
        }
      },
      {
        id: 'scheduled',
        label: 'Scheduled',
        count: scheduledCount,
        active: statusFilter === 'Scheduled',
        apply: () => {
          setStatusFilter('Scheduled')
          setTypeFilter('All')
        }
      },
      {
        id: 'expiring',
        label: 'Expiring soon',
        count: expiringSoon,
        active: sortKey === 'ending',
        apply: () => setSortKey('ending')
      },
      {
        id: 'shipping',
        label: 'Free shipping',
        count: freeShipping,
        active: typeFilter === 'Free Shipping',
        apply: () => {
          setTypeFilter('Free Shipping')
          setStatusFilter('All')
        }
      }
    ]
  }, [coupons, sortKey, statusFilter, typeFilter])

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('All')
    setTypeFilter('All')
    setSortKey('recent')
    setPageSize(pageSizes[0])
  }

  const toneClass = (tone) => {
    if (!tone) return ''
    const key = `tone${tone.charAt(0).toUpperCase()}${tone.slice(1)}`
    return styles[key] || ''
  }

  const handleExport = () => {
    const headers = [
      'ID',
      'Name',
      'Code',
      'Status',
      'Type',
      'Usage',
      'Start Date',
      'End Date',
      'Applies To',
      'Usage Limit',
      'Discount Value'
    ]
    const rows = sorted.map((coupon) => [
      coupon.id,
      coupon.name,
      coupon.code,
      coupon.status,
      coupon.type,
      coupon.usage,
      coupon.startDate,
      coupon.endDate,
      coupon.appliesTo,
      coupon.usageLimit,
      coupon.discountValue
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'coupons-export.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this coupon?')) return
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id))
  }

  const handleDuplicate = (coupon) => {
    const clone = normalizeCoupon({
      ...coupon,
      id: undefined,
      name: `${coupon.name} copy`,
      code: `${coupon.code}-COPY`,
      usage: 0,
      status: 'Scheduled'
    })
    setCoupons((prev) => [clone, ...prev])
    setPage(1)
  }

  const handleView = (coupon) => {
    navigate(`/coupons/${coupon.id}`, { state: { coupon } })
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <h1>Coupons</h1>
          <p>Create promotions, track usage, and keep tabs on the campaigns that drive conversions.</p>
        </div>
        <div className={styles.headerActions}>
          <Button type="button" variant='ghost' onClick={handleExport}>
            <FiDownload /> Export CSV
          </Button>
          <Button
            type="button"
            variant='primary'
            onClick={() => navigate('/coupons/new')}
          >
            <FiPlus /> New coupon
          </Button>
        </div>
      </section>

      <section className={styles.toolbar}>
        <label className={styles.search}>
          <FiSearch />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, code, or type"
          />
        </label>
        <div className={styles.toolbarControls}>
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
            Type
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              {typeOptions.map((option) => (
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
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
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
            <h2>Promotion catalog</h2>
            <p>
              Monitor how each coupon performs, spot campaigns that are about to expire, and duplicate successful ones.
            </p>
          </div>
          <div className={styles.tableActions}>
            <Button type="button" variant='ghost' onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        </header>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Coupon</th>
                <th className={styles.alignCenter}>Type</th>
                <th className={styles.alignCenter}>Status</th>
                <th className={styles.alignCenter}>Usage</th>
                <th>Schedule</th>
                <th>Applies to</th>
                <th className={styles.alignCenter}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <h3>No coupons match your filters</h3>
                      <p>Adjust the search or clear filters to see more promotions.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((coupon) => {
                  const { Icon } = getTypeMeta(coupon.type)
                  return (
                    <tr key={coupon.id}>
                      <td>
                        <div className={styles.couponCell}>
                          <span className={styles.couponIcon}>
                            <Icon />
                          </span>
                          <div>
                            <strong>{coupon.name}</strong>
                            <span>{coupon.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.alignCenter}>{ensureTypeLabel(coupon.type)}</td>
                      <td className={styles.alignCenter}>
                        <span className={`${styles.badge} ${toneClass(statusTone(coupon.status))}`}>
                          <span className={styles.badgeDot} />
                          {coupon.status}
                        </span>
                      </td>
                      <td className={styles.alignCenter}>{coupon.usage}</td>
                      <td>
                        <div>
                          <strong>{coupon.startDate}</strong>
                          <span className={styles.metaMuted}>Ends {coupon.endDate}</span>
                        </div>
                      </td>
                      <td>{coupon.appliesTo}</td>
                      <td className={styles.alignCenter}>
                        <div className={styles.actionsCell}>
                          <button type="button" onClick={() => handleView(coupon)} title="View details">
                            <FiEye />
                          </button>
                          <button type="button" onClick={() => handleDuplicate(coupon)} title="Duplicate coupon">
                            <FiRepeat />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.tableFooter}>
          <div>
            Showing {paginated.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
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

export default Coupons


