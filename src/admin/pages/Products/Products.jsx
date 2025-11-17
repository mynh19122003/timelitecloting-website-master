import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaPlus, FaFileExport, FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../../components/Button/Button'
import DataTable from '../../components/DataTable/DataTable'
import styles from './Products.module.css'
import defaultProductImage from '../../assets/products/product-01.svg'
import productsService from '../../services/productsService'

const ensureId = (value, fallback) => {
  if (value) {
    return value.startsWith('PRD-') ? value : `PRD-${value}`
  }
  if (fallback) return fallback
  return `PRD-${Date.now().toString().slice(-6)}`
}

const parseInventoryCount = (payload, fallback) => {
  if (payload?.stock?.onHand != null) return Number(payload.stock.onHand) || 0
  if (payload?.inventory?.value != null) {
    const numeric = String(payload.inventory.value).replace(/[^0-9]/g, '')
    if (numeric) return Number(numeric)
  }
  return fallback ?? 0
}

const normalizeProduct = (incoming, existing) => {
  const id = ensureId(incoming.id, existing?.id)
  const onHand = parseInventoryCount(incoming, existing?.stock?.onHand)
  const status = incoming.status || existing?.status || { label: 'Published', tone: 'success' }
  const listPrice = incoming.pricing?.listPrice || incoming.price || existing?.pricing?.listPrice || '$0.00'

  return {
    id,
    name: incoming.name || existing?.name || 'Untitled product',
    sku: existing?.sku || incoming.sku || `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
    image: incoming.image || existing?.image || defaultProductImage,
    category: incoming.type || incoming.category || existing?.category || 'General',
    color: incoming.color || existing?.color || '-',
    variant: incoming.variant || existing?.variant || '-',
    stock: {
      onHand,
      state: incoming.stock?.state || incoming.inventory?.label || existing?.stock?.state || 'In stock',
      tone: incoming.stock?.tone || incoming.inventory?.tone || existing?.stock?.tone || 'success'
    },
    pricing: {
      listPrice,
      compareAt: incoming.pricing?.compareAt ?? existing?.pricing?.compareAt ?? null
    },
    status,
    rating: typeof incoming.rating === 'number'
      ? incoming.rating
      : Number(incoming.rating) || existing?.rating || 0,
    votes: incoming.votes ?? existing?.votes ?? 0
  }
}

const Products = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const { items } = await productsService.listProducts({ page: 1, limit: 1000 })
        if (mounted) setProducts(items)
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load products')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const incoming = location.state?.newProduct
    if (!incoming) return

    setProducts((prev) => {
      const normalizedId = ensureId(incoming.id)
      const index = prev.findIndex((item) => item.id === normalizedId)
      if (index === -1) {
        return [normalizeProduct({ ...incoming, id: normalizedId }), ...prev]
      }
      const next = [...prev]
      next[index] = normalizeProduct({ ...incoming, id: normalizedId }, prev[index])
      return next
    })

    setPage(1)
    navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  const categories = useMemo(() => {
    const setCats = new Set(products.map((p) => p.category))
    return ['All', ...Array.from(setCats)]
  }, [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (filterCategory !== 'All' && p.category !== filterCategory) return false
      if (!q) return true
      return p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    })
  }, [products, query, filterCategory])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const columns = [
    { key: 'select', label: '', width: '40px', render: () => <input type="checkbox" /> },
    {
      key: 'product',
      label: 'Product',
      render: (_, row) => (
        <div className={styles.productCell}>
          <img src={row.image || defaultProductImage} alt={row.name} className={styles.thumb} />
          <div>
            <div className={styles.productName}>{row.name}</div>
            <div className={styles.productMeta}>{row.category}</div>
          </div>
        </div>
      )
    },
    { key: 'stock', label: 'Inventory', render: (_, row) => `${row.stock.onHand} in stock` },
    { key: 'color', label: 'Color', render: (v, r) => r.color },
    { key: 'price', label: 'Price', render: (v, r) => r.pricing.listPrice },
    {
      key: 'rating',
      label: 'Rating',
      render: (_, row) => `${row.rating.toFixed(1)} (${row.votes} Votes)`
    },
    {
      key: 'actions',
      label: '',
      width: '110px',
      render: (_, row) => {
        // Ensure id is a string to avoid [object Object] in URL
        const productId = typeof row.id === 'string' ? row.id : String(row.id || '')
        return (
          <div className={styles.rowActions}>
            <button
              type="button"
              className={styles.tableLink}
              onClick={() => navigate(`/admin/products/${encodeURIComponent(productId)}/edit`)}
            >
              <FaEdit /> Edit
            </button>
            <button type="button" className={styles.deleteButton} onClick={() => handleDelete(productId)}>
              <FaTrash /> Delete
            </button>
          </div>
        )
      }
    }
  ]

  function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    // Ensure id is a string for comparison
    const productId = typeof id === 'string' ? id : String(id || '')
    setProducts((prev) => prev.filter((p) => {
      const pId = typeof p.id === 'string' ? p.id : String(p.id || '')
      return pId !== productId
    }))
  }

  function handleExport() {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Color', 'Stock', 'Price', 'Rating']
    const rows = products.map((p) => [p.id, p.name, p.sku, p.category, p.color, p.stock.onHand, p.pricing.listPrice, p.rating])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2>Products</h2>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={handleExport} title="Export">
            <FaFileExport /> Export
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/products/new')}>
            <FaPlus /> Add Product
          </Button>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.filterRow}>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            placeholder="Search by name or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className={styles.errorMsg}>{error}</div>
      )}
      {loading ? (
        <div className={styles.loading}>Loading products…</div>
      ) : (
        <DataTable columns={columns} data={paginated} emptyState="No products found" />
      )}

      <div className={styles.pagerRow}>
        <div>
          Showing {Math.min((page - 1) * pageSize + 1, filtered.length)} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className={styles.pagerControls}>
          <button onClick={() => setPage(1)} disabled={page === 1}>{'<<'}</button>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>{'<'}</button>
          <span className={styles.pageIndicator}>{page}</span>
          <button onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount}>{'>'}</button>
          <button onClick={() => setPage(pageCount)} disabled={page === pageCount}>{'>>'}</button>
        </div>
      </div>
    </div>
  )
}

export default Products
