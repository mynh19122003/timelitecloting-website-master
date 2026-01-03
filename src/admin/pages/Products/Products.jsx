import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaPlus, FaFileExport, FaEdit, FaTrash, FaCloudUploadAlt, FaSpinner, FaTags } from 'react-icons/fa'
import Button from '../../components/Button/Button'
import DataTable from '../../components/DataTable/DataTable'
import styles from './Products.module.css'
import defaultProductImage from '../../assets/products/product-01.svg'
import productsService from '../../services/productsService'
import BulkProductModal from '../../components/BulkProductModal/BulkProductModal'
import VariantsModal from '../../components/VariantsModal/VariantsModal'

const ensureId = (value, fallback) => {
  // Ensure value is a string
  let stringValue = ''
  if (value) {
    if (typeof value === 'string') {
      stringValue = value
    } else if (typeof value === 'number') {
      stringValue = String(value)
    } else if (value && typeof value === 'object') {
      // If it's an object, try to extract id property
      stringValue = String(value.id || value.product_id || value.products_id || JSON.stringify(value))
    } else {
      stringValue = String(value)
    }
  }

  if (stringValue) {
    return stringValue.startsWith('PRD-') ? stringValue : `PRD-${stringValue}`
  }
  if (fallback) {
    const fallbackStr = typeof fallback === 'string' ? fallback : String(fallback || '')
    return fallbackStr.startsWith('PRD-') ? fallbackStr : `PRD-${fallbackStr}`
  }
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

const ID_PRIORITY_KEYS = ['id', 'product_id', 'products_id', 'productId', 'sku', 'code', 'value']

const normalizeProductIdForApi = (value) => {
  if (value == null) return ''
  const raw = String(value).trim()
  if (!raw) return ''
  return raw.replace(/^PRD-/, '')
}

const resolvePrimitiveId = (value, depth = 0) => {
  if (value == null || depth > 4) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      for (const entry of value) {
        const maybe = resolvePrimitiveId(entry, depth + 1)
        if (maybe) return maybe
      }
    } else {
      for (const key of ID_PRIORITY_KEYS) {
        if (value[key] != null) {
          const maybe = resolvePrimitiveId(value[key], depth + 1)
          if (maybe) return maybe
        }
      }
      // fallback: try all values to catch nested objects with unknown keys
      for (const entry of Object.values(value)) {
        const maybe = resolvePrimitiveId(entry, depth + 1)
        if (maybe) return maybe
      }
    }
  }
  return ''
}

const extractProductId = (payload) => {
  if (!payload) return ''
  const direct = resolvePrimitiveId(payload?.id ?? payload)
  if (direct) return direct
  for (const key of ID_PRIORITY_KEYS) {
    if (key === 'id') continue
    const maybe = resolvePrimitiveId(payload?.[key])
    if (maybe) return maybe
  }
  return ''
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
  const [deletingId, setDeletingId] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showVariantsModal, setShowVariantsModal] = useState(false)

  // Bulk Upload State
  const [bulkUploadState, setBulkUploadState] = useState({
    uploading: false,
    progress: { current: 0, total: 0 },
    status: '',
    errors: []
  })

  const pageSize = 5

  useEffect(() => {
    let mounted = true
      ; (async () => {
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

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(paginated.map((row) => {
        // Try to get products_id directly first, then fallback to extractProductId
        const id = row.products_id || row.product_id || extractProductId(row)
        return id ? normalizeProductIdForApi(id) : null
      }).filter(Boolean))
      setSelectedIds(allIds)
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (productId, checked) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev)
      if (checked) {
        newSelected.add(productId)
      } else {
        newSelected.delete(productId)
      }
      return newSelected
    })
  }

  const isAllSelected = paginated.length > 0 && paginated.every((row) => {
    // Try to get products_id directly first, then fallback to extractProductId
    const id = row.products_id || row.product_id || extractProductId(row)
    const apiId = id ? normalizeProductIdForApi(id) : null
    return apiId && selectedIds.has(apiId)
  })

  const columns = [
    {
      key: 'select',
      label: '',
      width: '40px',
      render: (_, row) => {
        // Try to get products_id directly first, then fallback to extractProductId
        let productId = row.products_id || row.product_id || extractProductId(row)
        const apiId = productId ? normalizeProductIdForApi(productId) : null
        if (!apiId) {
          console.warn('[Products] Cannot extract product ID from row:', row)
          return null
        }
        return (
          <input
            type="checkbox"
            checked={selectedIds.has(apiId)}
            onChange={(e) => handleSelectOne(apiId, e.target.checked)}
          />
        )
      }
    },
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
        const productId = extractProductId(row)
        if (!productId) {
          console.warn('[Products] Unable to resolve product id from row:', row)
          return (
            <div className={styles.rowActions}>
              <button type="button" className={styles.tableLink} disabled title="Missing product id">
                <FaEdit /> Edit
              </button>
              <button type="button" className={styles.deleteButton} disabled title="Missing product id">
                <FaTrash /> Delete
              </button>
            </div>
          )
        }

        return (
          <div className={styles.rowActions}>
            <button
              type="button"
              className={styles.tableLink}
              onClick={() => navigate(`/admin/products/${encodeURIComponent(productId)}/edit`)}
            >
              <FaEdit /> Edit
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => handleDelete(productId)}
              disabled={deletingId === productId}
            >
              <FaTrash /> {deletingId === productId ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )
      }
    }
  ]

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return

    const productId = extractProductId({ id }) || (typeof id === 'string' ? id : String(id || ''))
    const apiId = normalizeProductIdForApi(productId)

    if (!apiId) {
      window.alert('Không xác định được mã sản phẩm để xoá.')
      return
    }

    try {
      setError('')
      setDeletingId(productId)
      await productsService.deleteProduct(apiId)
      setProducts((prev) =>
        prev.filter((p) => {
          const currentId = extractProductId(p) || (typeof p.id === 'string' ? p.id : String(p.id || ''))
          const normalizedCurrentId = normalizeProductIdForApi(currentId)
          return normalizedCurrentId !== apiId && currentId !== productId
        })
      )
      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(apiId)
        return newSet
      })
    } catch (err) {
      console.error('[Products] delete failed', err)
      const message = err?.message || 'Failed to delete product'
      setError(message)
      window.alert(message)
    } finally {
      setDeletingId('')
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) {
      window.alert('Vui lòng chọn ít nhất một sản phẩm để xoá.')
      return
    }

    const count = selectedIds.size
    if (!window.confirm(`Bạn có chắc chắn muốn xoá ${count} sản phẩm đã chọn?`)) return

    try {
      setError('')
      setIsBulkDeleting(true)
      const productIdsArray = Array.from(selectedIds)
      console.log('[Products] Bulk delete - Selected IDs:', productIdsArray)
      const result = await productsService.bulkDeleteProducts(productIdsArray)

      if (result.failedCount > 0) {
        const failedMessages = result.failed.map((f) => `Product ${f.productId}: ${f.error}`).join('\n')
        window.alert(`Đã xoá ${result.successCount} sản phẩm. Lỗi:\n${failedMessages}`)
      } else {
        window.alert(`Đã xoá thành công ${result.successCount} sản phẩm!`)
      }

      // Remove deleted products from UI
      setProducts((prev) =>
        prev.filter((p) => {
          const currentId = extractProductId(p)
          const apiId = currentId ? normalizeProductIdForApi(currentId) : null
          return !apiId || !selectedIds.has(apiId)
        })
      )

      setSelectedIds(new Set())
    } catch (err) {
      console.error('[Products] bulk delete failed', err)
      const message = err?.response?.data?.message || err?.message || 'Failed to delete products'
      setError(message)
      window.alert(message)
    } finally {
      setIsBulkDeleting(false)
    }
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

  const handleStartBulkUpload = async (imageFiles, formData) => {
    setShowBulkModal(false)
    setBulkUploadState({
      uploading: true,
      progress: { current: 0, total: imageFiles.length },
      status: 'Starting upload...',
      errors: []
    })

    const successList = []
    const errorList = []

    for (let i = 0; i < imageFiles.length; i++) {
      const { filename, fileData } = imageFiles[i]
      const currentCount = i + 1

      try {
        setBulkUploadState(prev => ({
          ...prev,
          status: `Uploading ${currentCount}/${imageFiles.length}: ${filename}...`,
          progress: { current: currentCount, total: imageFiles.length }
        }))

        // Get base64
        const base64 = await fileData.async('base64')
        const mime = filename.toLowerCase().endsWith('.png') ? 'image/png' :
          filename.toLowerCase().endsWith('.webp') ? 'image/webp' :
            filename.toLowerCase().endsWith('.gif') ? 'image/gif' : 'image/jpeg'
        const dataUrl = `data:${mime};base64,${base64}`

        // Auto-increment name: "Name", "Name 2", "Name 3"...
        const productName = i === 0 ? formData.name : `${formData.name} ${i + 1}`

        const payload = {
          name: productName,
          description: formData.description,
          price: formData.price,
          inventory: formData.inventory,
          color: formData.color,
          type: formData.type,
          variant: formData.variant,
          rating: formData.rating,
          status: formData.status,
          sizes: formData.sizes,
          tags: formData.tags,
          imagePreview: dataUrl,
          galleryPayload: []
        }

        await productsService.createProduct(payload)
        successList.push({ name: filename })

      } catch (err) {
        console.error(`Failed to upload ${filename}`, err)
        errorList.push({ name: filename, error: err.message })
      }
    }

    // Refresh list
    try {
      const { items } = await productsService.listProducts({ page: 1, limit: 1000 })
      setProducts(items)
    } catch (_) { /* ignore */ }

    setBulkUploadState(prev => ({
      ...prev,
      uploading: false,
      status: `Complete! ${successList.length} success, ${errorList.length} errors.`,
      errors: errorList
    }))

    if (errorList.length > 0) {
      alert(`Upload complete with errors.\nSuccess: ${successList.length}\nFailed: ${errorList.length}\nCheck console for details.`)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2>Products</h2>
        <div className={styles.headerActions}>
          {selectedIds.size > 0 && (
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              title={`Delete ${selectedIds.size} selected product(s)`}
            >
              <FaTrash /> {isBulkDeleting ? 'Deleting…' : `Delete ${selectedIds.size} selected`}
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowVariantsModal(true)}>
            <FaTags /> Add Variants
          </Button>
          <Button variant="ghost" onClick={handleExport} title="Export">
            <FaFileExport /> Export
          </Button>
          <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
            <FaCloudUploadAlt /> Upload Multi Products
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/products/new')} disabled={bulkUploadState.uploading}>
            {bulkUploadState.uploading ? (
              <>
                <FaSpinner className={styles.spin} />
                Uploading {bulkUploadState.progress.current}/{bulkUploadState.progress.total}
              </>
            ) : (
              <>
                <FaPlus /> Add Product
              </>
            )}
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
        <>
          {paginated.length > 0 && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </span>
            </div>
          )}
          <DataTable columns={columns} data={paginated} emptyState="No products found" />
        </>
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

      {showBulkModal && (
        <BulkProductModal
          onClose={() => setShowBulkModal(false)}
          onStartUpload={handleStartBulkUpload}
        />
      )}

      {showVariantsModal && (
        <VariantsModal
          onClose={() => setShowVariantsModal(false)}
          onVariantCreated={() => {
            // Optionally reload page to show new variants
            console.log('Variant created successfully');
          }}
        />
      )}
    </div>

  )
}

export default Products
