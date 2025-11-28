import api from './client'

// Base URL for this module is already /admin (from client baseURL)
export const get = (path = '', config) => api.get(path || '/', config)
export const post = (path = '', data, config) => api.post(path || '/', data, config)
export const put = (path = '', data, config) => api.put(path || '/', data, config)
export const patch = (path = '', data, config) => api.patch(path || '/', data, config)
export const del = (path = '', config) => api.delete(path || '/', config)
export const deleteMethod = (path = '', data, config) => api.delete(path || '/', { ...config, data })

// Convenience examples for quick checks
export const health = () => get('/health')


