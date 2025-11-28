import { AdminApi, PublicApi } from '../api'
import { deleteMethod } from '../api/admin'
import { getApiBaseUrl } from '../api/config'
import PublicApiClient from '../api/public'

const toNumber = (value, fallback = 0) => {
  const n = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.\-]/g, '')) : Number(value)
  return Number.isFinite(n) ? n : fallback
}

const toInt = (value, fallback = 0) => {
  const n = typeof value === 'string' ? parseInt(value.replace(/[^0-9\-]/g, ''), 10) : parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

const resolveMediaPath = (value, fallback = '') => {
  if (!value) return fallback
  const raw = String(value)
  const isAbsolute = /^https?:\/\//i.test(raw) || raw.startsWith('data:')
  if (isAbsolute) return raw
  if (raw.startsWith('/admin/media/')) return raw
  if (raw.startsWith('admin/media/')) return `/${raw}`
  const base = getApiBaseUrl()
  const prefix = `${base.replace(/\/+$/, '')}/media/`
  return `${prefix}${raw.replace(/^\/?(admin\/media\/)?/, '')}`
}

const parseJsonArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch (_) {
      return []
    }
  }
  return []
}

const normalizeUiProduct = (apiProduct = {}, fallbackImage = '') => {
  const priceValue = toNumber(apiProduct.price, 0)
  const listPrice = priceValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const stockOnHand = toInt(apiProduct.stock, 0)
  const stockTone = stockOnHand <= 0 ? 'danger' : stockOnHand < 150 ? 'warning' : 'success'
  const stockLabel = stockOnHand <= 0 ? 'out of stock' : stockOnHand < 150 ? 'low stock' : 'in stock'
  const rating = toNumber(apiProduct.rating, 0)
  
  // Preserve products_id for bulk operations
  const productsId = apiProduct.products_id || apiProduct.product_id || null

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

  const resolvedImage = resolveMediaPath(apiProduct.image_url || apiProduct.image || '', fallbackImage)
  const galleryRaw = parseJsonArray(apiProduct.gallery)
  const resolvedGallery = galleryRaw
    .map((entry) => resolveMediaPath(entry, ''))
    .filter(Boolean)

  // Ensure id is always a string
  let rawId = apiProduct.products_id || apiProduct.product_id || apiProduct.id
  // Handle case where rawId might be an object
  if (rawId && typeof rawId === 'object' && rawId !== null) {
    rawId = rawId.id || rawId.product_id || rawId.products_id || null
  }
  const productId = rawId ? String(rawId) : `PRD-${Date.now().toString().slice(-6)}`
  
  return {
    id: productId,
    products_id: productsId, // Preserve products_id for bulk delete
    product_id: productsId, // Also preserve as product_id for compatibility
    name: apiProduct.name || 'Untitled product',
    sku: rawId ? String(rawId) : '',
    image: resolvedImage,
    gallery: resolvedGallery,
    category: apiProduct.category || 'General',
    color: parsedColors[0] || '',
    variant: apiProduct.variant || '-',
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

  // Normalize tags: accept JSON string or array
  let tagsPayload = []
  if (Array.isArray(formData.tags)) {
    tagsPayload = formData.tags
  } else if (typeof formData.tags === 'string' && formData.tags.trim()) {
    try {
      const parsed = JSON.parse(formData.tags)
      if (Array.isArray(parsed)) {
        tagsPayload = parsed
      }
    } catch (_) {
      // If not JSON, treat as comma-separated string
      tagsPayload = formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
    }
  }

  const baseImagePayload = typeof formData.imagePreview === 'string' && formData.imagePreview.startsWith('data:')
    ? formData.imagePreview
    : undefined

  const galleryPayload = Array.isArray(formData.galleryPayload)
    ? formData.galleryPayload.filter((img) => typeof img === 'string' && img.startsWith('data:'))
    : []

  const payload = {
    name: formData.name,
    price: toNumber(formData.price, 0),
    stock: toInt(formData.inventory, 0),
    description: formData.description || '',
    category: formData.type || '',
    variant: formData.variant || '',
    rating: toNumber(formData.rating, 0),
    colors: colorsPayload,
    sizes: sizesPayload,
    // Optional fields left blank for now
    short_description: '',
    original_price: null,
    tags: tagsPayload
  }

  if (baseImagePayload) {
    payload.image_url = baseImagePayload
  }

  if (galleryPayload.length) {
    payload.gallery = galleryPayload
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

  try {
    const res = await AdminApi.post('/products', payload)
    const api = res?.data?.data || res?.data || {}
    return normalizeUiProduct(api, formData.imagePreview)
  } catch (error) {
    // Log chi tiết lỗi để debug
    console.error('[createProduct] API call failed:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      error: error?.response?.data?.error,
      message: error?.response?.data?.message,
      url: error?.config?.url,
      method: error?.config?.method,
      baseURL: error?.config?.baseURL,
      headers: {
        authorization: error?.config?.headers?.Authorization ? 'Bearer ***' : 'missing',
        'x-admin-token': error?.config?.headers?.['X-Admin-Token'] ? '***' : 'missing',
        'content-type': error?.config?.headers?.['Content-Type']
      },
      payload: payload
    })
    
    // Re-throw với message rõ ràng hơn
    if (error?.response?.status === 403) {
      const backendMessage = error?.response?.data?.message || 'Forbidden'
      const backendError = error?.response?.data?.error || 'ERR_FORBIDDEN'
      throw new Error(`403 Forbidden: ${backendMessage} (${backendError}). Kiểm tra ADMIN_API_TOKEN trong env hoặc localStorage.`)
    } else if (error?.response?.status === 401) {
      const backendMessage = error?.response?.data?.message || 'Unauthorized'
      throw new Error(`401 Unauthorized: ${backendMessage}. Token không hợp lệ hoặc thiếu.`)
    } else if (error?.response?.data?.message) {
      throw new Error(`${error.response.status || 'Error'}: ${error.response.data.message}`)
    }
    
    throw error
  }
}

export const bulkCreateProducts = async (productsArray) => {
  const payload = {
    products: productsArray.map((product) => ({
      name: product.name,
      description: product.description || '',
      color: product.color || '',
      category: product.category || '',
      variant: product.variant || '',
      inventory: Number(product.inventory) || 0,
      price: Number(product.price) || 0,
      status: product.status || 'published',
      rating: Number(product.rating) || 0,
      sizes: product.sizes || [],
      tags: product.tags || [],
      imagePreview: product.imagePreview || '',
      mediaUploads: product.mediaUploads || []
    }))
  }

  try {
    const res = await AdminApi.post('/products/bulk', payload)
    return res?.data?.data || res?.data || {}
  } catch (error) {
    console.error('[bulkCreateProducts] API call failed:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      error: error?.response?.data?.error,
      message: error?.response?.data?.message
    })
    throw error
  }
}

export const getProduct = async (idOrCode) => {
  if (!idOrCode) throw new Error('Missing product id')
  const res = await AdminApi.get(`/products/${encodeURIComponent(idOrCode)}`)
  const api = res?.data?.data || res?.data || {}
  return normalizeUiProduct(api)
}

export const updateProduct = async (idOrCode, formData = {}) => {
  if (!idOrCode) throw new Error('Missing product id')
  
  // Map UI form -> backend payload (similar to createProduct)
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

  // Normalize tags: accept JSON string or array
  let tagsPayload = []
  if (Array.isArray(formData.tags)) {
    tagsPayload = formData.tags
  } else if (typeof formData.tags === 'string' && formData.tags.trim()) {
    try {
      const parsed = JSON.parse(formData.tags)
      if (Array.isArray(parsed)) {
        tagsPayload = parsed
      }
    } catch (_) {
      // If not JSON, treat as comma-separated string
      tagsPayload = formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
    }
  }

  const baseImagePayload = typeof formData.imagePreview === 'string' && formData.imagePreview.startsWith('data:')
    ? formData.imagePreview
    : undefined

  const galleryPayload = Array.isArray(formData.galleryPayload)
    ? formData.galleryPayload.filter((img) => typeof img === 'string' && img.startsWith('data:'))
    : []

  const payload = {
    name: formData.name,
    price: toNumber(formData.price, 0),
    stock: toInt(formData.inventory, 0),
    description: formData.description || '',
    category: formData.type || '',
    variant: formData.variant || '',
    rating: toNumber(formData.rating, 0),
    colors: colorsPayload,
    sizes: sizesPayload,
    short_description: formData.short_description || '',
    original_price: formData.original_price || null,
    tags: tagsPayload
  }

  if (baseImagePayload) {
    payload.image_url = baseImagePayload
  }

  if (galleryPayload.length) {
    payload.gallery = galleryPayload
  }

  // Dev debug
  if (import.meta?.env?.DEV) {
    try {
      console.groupCollapsed('[DEBUG] PATCH /admin/products/:id payload')
      console.log('Product ID:', idOrCode)
      console.log('Payload:', payload)
      console.groupEnd()
    } catch (_) {
      // ignore
    }
  }

  try {
    const res = await AdminApi.patch(`/products/${encodeURIComponent(idOrCode)}`, payload)
    const api = res?.data?.data || res?.data || {}
    return normalizeUiProduct(api, formData.imagePreview)
  } catch (error) {
    console.error('[updateProduct] API call failed:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      error: error?.response?.data?.error,
      message: error?.response?.data?.message,
      url: error?.config?.url,
      method: error?.config?.method,
      baseURL: error?.config?.baseURL
    })
    
    if (error?.response?.status === 403) {
      const backendMessage = error?.response?.data?.message || 'Forbidden'
      const backendError = error?.response?.data?.error || 'ERR_FORBIDDEN'
      throw new Error(`403 Forbidden: ${backendMessage} (${backendError}). Kiểm tra ADMIN_API_TOKEN trong env hoặc localStorage.`)
    } else if (error?.response?.status === 401) {
      const backendMessage = error?.response?.data?.message || 'Unauthorized'
      throw new Error(`401 Unauthorized: ${backendMessage}. Token không hợp lệ hoặc thiếu.`)
    } else if (error?.response?.status === 404) {
      throw new Error(`404 Not Found: Product không tồn tại.`)
    } else if (error?.response?.data?.message) {
      throw new Error(`${error.response.status || 'Error'}: ${error.response.data.message}`)
    }
    
    throw error
  }
}

export const deleteProduct = async (idOrCode) => {
  if (!idOrCode) throw new Error('Missing product id')

  const safeId = encodeURIComponent(String(idOrCode).trim())

  try {
    const res = await AdminApi.del(`/products/${safeId}`)
    return res?.data || { success: true }
  } catch (error) {
    console.error('[deleteProduct] API call failed:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.response?.data?.message,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL
    })

    if (error?.response?.status === 404) {
      throw new Error('Sản phẩm không tồn tại hoặc đã bị xoá.')
    }

    if (error?.response?.status === 401) {
      throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
    }

    if (error?.response?.status === 403) {
      throw new Error('Tài khoản hiện không có quyền xoá sản phẩm.')
    }

    throw new Error(error?.response?.data?.message || 'Xoá sản phẩm thất bại. Vui lòng thử lại.')
  }
}

export const bulkDeleteProducts = async (productIds) => {
  const payload = {
    productIds: productIds.map((id) => String(id).trim()).filter(Boolean)
  }

  console.log('[bulkDeleteProducts] Sending payload:', JSON.stringify(payload, null, 2))

  try {
    // Use axios.delete with data in config
    const res = await deleteMethod('/products/bulk', payload)
    return res?.data?.data || res?.data || {}
  } catch (error) {
    console.error('[bulkDeleteProducts] API call failed:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      error: error?.response?.data?.error,
      message: error?.response?.data?.message
    })
    throw error
  }
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

export const getTags = async () => {
  try {
    // Use admin API endpoint /admin/products/tags
    const res = await AdminApi.get('/products/tags')
    const body = res?.data || {}
    
    // Support different response shapes
    const tags = body?.data?.tags || body?.tags || []
    return Array.isArray(tags) ? tags : []
  } catch (error) {
    console.error('[getTags] API call failed:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url
    })
    // Return empty array on error instead of throwing
    return []
  }
}

export const getCategories = async () => {
  try {
    // Use admin API endpoint /admin/products/categories
    const res = await AdminApi.get('/products/categories')
    const body = res?.data || {}
    
    // Support different response shapes
    const categories = body?.data?.categories || body?.categories || []
    return Array.isArray(categories) ? categories : []
  } catch (error) {
    console.error('[getCategories] API call failed:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url
    })
    // Return empty array on error instead of throwing
    return []
  }
}

export default {
  createProduct,
  bulkCreateProducts,
  deleteProduct,
  bulkDeleteProducts,
  getProduct,
  listProducts,
  updateProduct,
  getTags,
  getCategories
}


