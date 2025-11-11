import { AdminApi, PublicApi } from '../api'
import { getApiBaseUrl } from '../api/config'

const toNumber = (value, fallback = 0) => {
  const n = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.\-]/g, '')) : Number(value)
  return Number.isFinite(n) ? n : fallback
}

const toInt = (value, fallback = 0) => {
  const n = typeof value === 'string' ? parseInt(value.replace(/[^0-9\-]/g, ''), 10) : parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

const normalizeUiProduct = (apiProduct = {}, fallbackImage = '') => {
  const priceValue = toNumber(apiProduct.price, 0)
  const listPrice = priceValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const stockOnHand = toInt(apiProduct.stock, 0)
  const stockTone = stockOnHand <= 0 ? 'danger' : stockOnHand < 150 ? 'warning' : 'success'
  const stockLabel = stockOnHand <= 0 ? 'out of stock' : stockOnHand < 150 ? 'low stock' : 'in stock'
  const rating = toNumber(apiProduct.rating, 0)

  // Parse colors if backend returns JSON string from MySQL JSON column
  let parsedColors = []
  try {
    if (Array.isArray(apiProduct.colors)) {
      parsedColors = apiProduct.colors
    } else if (typeof apiProduct.colors === 'string') {
      const maybe = JSON.parse(apiProduct.colors)
      if (Array.isArray(maybe)) parsedColors = maybe
    }
  } catch (_) {
    // ignore parse error -> keep empty
  }

  // Parse sizes if backend returns JSON string from MySQL JSON column
  let parsedSizes = []
  try {
    if (Array.isArray(apiProduct.sizes)) {
      parsedSizes = apiProduct.sizes
    } else if (typeof apiProduct.sizes === 'string') {
      const maybe = JSON.parse(apiProduct.sizes)
      if (Array.isArray(maybe)) parsedSizes = maybe
    }
  } catch (_) {
    // ignore parse error -> keep empty
  }

  const resolvedImage = (() => {
    const raw = apiProduct.image_url || apiProduct.image || ''
    if (!raw) return fallbackImage
    const isAbsolute = /^https?:\/\//i.test(raw) || raw.startsWith('data:')
    if (isAbsolute) return raw
    // If backend already returns `/admin/media/...`, keep it as-is
    if (raw.startsWith('/admin/media/')) return raw
    // Also handle accidental leading 'admin/media/...'
    if (raw.startsWith('admin/media/')) return `/${raw}`
    const base = getApiBaseUrl() // '/admin' in dev, 'http://host/admin' in prod
    const prefix = `${base.replace(/\/+$/, '')}/media/`
    return `${prefix}${String(raw).replace(/^\/?(admin\/media\/)?/, '')}`
  })()

  return {
    id: apiProduct.products_id || apiProduct.product_id || apiProduct.id || `PRD-${Date.now().toString().slice(-6)}`,
    name: apiProduct.name || 'Untitled product',
    sku: apiProduct.products_id || apiProduct.product_id || apiProduct.id || '',
    image: resolvedImage,
    category: apiProduct.category || 'General',
    color: parsedColors[0] || '',
    variant: '-',
    stock: {
      onHand: stockOnHand,
      state: stockLabel,
      tone: stockTone
    },
    pricing: {
      listPrice,
      compareAt: null
    },
    status: { label: 'Published', tone: 'success' },
    rating,
    votes: 0,
    sizes: parsedSizes
  }
}

export const createProduct = async (formData = {}) => {
  // Map UI form -> backend payload
  // Normalize colors: accept comma-separated string or JSON array string
  let colorsPayload = []
  if (Array.isArray(formData.colors)) {
    colorsPayload = formData.colors
  } else if (typeof formData.color === 'string') {
    const raw = formData.color.trim()
    if (raw) {
      if (raw.startsWith('[')) {
        try {
          const arr = JSON.parse(raw)
          if (Array.isArray(arr)) colorsPayload = arr
        } catch (_) { /* ignore */ }
      }
      if (!colorsPayload.length) {
        colorsPayload = raw.split(',').map((v) => v.trim()).filter(Boolean)
      }
    }
  }

  // Normalize sizes: accept array of size strings
  let sizesPayload = []
  if (Array.isArray(formData.sizes)) {
    sizesPayload = formData.sizes
  }

  const payload = {
    name: formData.name,
    price: toNumber(formData.price, 0),
    stock: toInt(formData.inventory, 0),
    description: formData.description || '',
    image_url: formData.imagePreview || '',
    category: formData.type || '',
    rating: toNumber(formData.rating, 0),
    colors: colorsPayload,
    sizes: sizesPayload,
    // Optional fields left blank for now
    short_description: '',
    original_price: null,
    tags: formData.tags || ''
  }

  // Dev debug: in ra payload đúng lúc POST để kiểm tra trường gửi lên API
  if (import.meta?.env?.DEV) {
    try {
      // eslint-disable-next-line no-console
      console.groupCollapsed('[DEBUG] POST /admin/products payload')
      // eslint-disable-next-line no-console
      console.log(payload)
      // eslint-disable-next-line no-console
      console.groupEnd()
    } catch (_) {
      // ignore
    }
  }

  const res = await AdminApi.post('/products', payload)
  const api = res?.data?.data || res?.data || {}
  return normalizeUiProduct(api, formData.imagePreview)
}

export const getProduct = async (idOrCode) => {
  if (!idOrCode) throw new Error('Missing product id')
  const res = await AdminApi.get(`/products/${encodeURIComponent(idOrCode)}`)
  const api = res?.data?.data || res?.data || {}
  return normalizeUiProduct(api)
}

export const listProducts = async ({ page = 1, limit = 1000, search = '', category = '' } = {}) => {
  try {
    const res = await AdminApi.get('/products', {
      params: { page, limit, q: search, category }
    })

    // Debug: log raw API response
    console.log('[listProducts] response', { status: res?.status, data: res?.data })

  const body = res?.data || {}

  // Support multiple backend shapes:
  // 1) Admin backend: { success, items: [...], pagination: {...} }
  // 2) Legacy: { data: { products: [...], pagination } }
  // 3) Fallback: array response
  const itemsFromAdmin = Array.isArray(body.items) ? body.items : []
  const productsFromData = Array.isArray(body?.data?.products) ? body.data.products : []
  const arrayPayload = Array.isArray(body?.data)
    ? body.data
    : (Array.isArray(body) ? body : [])

  const rawProducts = itemsFromAdmin.length
    ? itemsFromAdmin
    : (productsFromData.length ? productsFromData : arrayPayload)

  const pagination = body.pagination || body?.data?.pagination || {
    page,
    limit,
    total: rawProducts.length,
    totalPages: 1
  }

  return {
    items: rawProducts.map((p) => normalizeUiProduct(p)),
    pagination
  }
  } catch (error) {
    // Debug: log rich error details for axios/network errors
    const errInfo = {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error?.config?.url,
      data: error?.response?.data
    }
    console.error('[listProducts] error', errInfo)
    throw error
  }
}

export default {
  createProduct,
  getProduct,
  listProducts
}


