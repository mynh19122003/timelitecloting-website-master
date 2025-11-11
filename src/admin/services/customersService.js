import api from '../api/client'

const BASE = '/customers'

const splitName = (fullName = '') => {
  const tokens = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return { firstName: '', lastName: '' }
  if (tokens.length === 1) return { firstName: tokens[0], lastName: '' }
  const firstName = tokens[0]
  const lastName = tokens.slice(1).join(' ')
  return { firstName, lastName }
}

const parseAddress = (userAddress = '') => {
  if (!userAddress) return { address: '', city: '', state: '', postalCode: '' }
  const parts = String(userAddress).split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return { address: '', city: '', state: '', postalCode: '' }
  if (parts.length === 1) return { address: parts[0], city: '', state: '', postalCode: '' }
  if (parts.length === 2) return { address: '', city: parts[0], state: parts[1], postalCode: '' }
  return { address: parts[0], city: parts[0] && parts.length === 3 ? parts[0] : parts[0], state: parts[1] || '', postalCode: parts[2] || '' }
}

const normalizeCustomer = (raw = {}) => {
  const code = raw.user_code || raw.code || raw.id || ''
  const name = raw.user_name || ''
  const { firstName, lastName } = splitName(name)
  const addr = parseAddress(raw.user_address)
  return {
    // UI shape
    id: String(code || ''),
    firstName,
    lastName,
    email: raw.email || '',
    phone: raw.user_phone || '',
    address: addr.address || '',
    city: addr.city || '',
    state: addr.state || '',
    postalCode: addr.postalCode || '',
    // placeholders for UI features not supported by backend yet
    segment: 'New',
    status: 'Active',
    orders: 0,
    lifetimeValue: 0,
    lastOrder: '',
    // keep raw for reference if needed
    _raw: raw
  }
}

export const listCustomers = async ({ page = 1, limit = 10, q = '' } = {}) => {
  const res = await api
    .get(`${BASE}`, { params: { page, limit, q } })
    .catch((err) => {
      const message = err?.data?.message || err?.message || 'Không thể tải danh sách khách hàng.'
      throw new Error(message)
    })
  const payload = res?.data || {}
  const data = payload?.data || payload || {}
  const customers = Array.isArray(data.customers) ? data.customers : []
  const pagination = data.pagination || {}
  return {
    items: customers.map(normalizeCustomer),
    pagination: {
      page: Number(pagination.page) || page,
      limit: Number(pagination.limit) || limit,
      total: Number(pagination.total) || customers.length,
      totalPages: Number(pagination.totalPages) || 1
    }
  }
}

export const getCustomer = async (identifier) => {
  if (!identifier) throw new Error('Thiếu mã khách hàng')
  const res = await api
    .get(`${BASE}/${encodeURIComponent(identifier)}`)
    .catch((err) => {
      const message = err?.data?.message || err?.message || 'Không thể tải khách hàng.'
      throw new Error(message)
    })
  const payload = res?.data || {}
  const data = payload?.data || payload || {}
  return normalizeCustomer(data)
}

export const updateCustomer = async (identifier, changes = {}) => {
  if (!identifier) throw new Error('Thiếu mã khách hàng')
  // Map UI form to backend contract
  const body = {
    first_name: changes.firstName,
    last_name: changes.lastName,
    email: changes.email,
    phone: changes.phone,
    street_address: changes.address,
    city: changes.city,
    state: changes.state,
    postal_code: changes.postalCode
  }
  const res = await api
    .patch(`${BASE}/${encodeURIComponent(identifier)}`, body)
    .catch((err) => {
      const message = err?.data?.message || err?.message || 'Không thể cập nhật khách hàng.'
      throw new Error(message)
    })
  const payload = res?.data || {}
  const data = payload?.data || payload || {}
  return normalizeCustomer(data)
}

export default {
  listCustomers,
  getCustomer,
  updateCustomer
}


