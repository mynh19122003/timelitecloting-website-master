import axios from 'axios'
import { getPublicApiBaseUrl } from './config'

// Public catalog/order API client (non-admin)
const resolvedBase = getPublicApiBaseUrl()
// Debug: log once to verify where Public API points to
// eslint-disable-next-line no-console
console.log('[PublicApi] baseURL =', resolvedBase)

const publicApi = axios.create({
  baseURL: resolvedBase,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' }
})

export default publicApi



