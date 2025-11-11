import api from './client'

export const ping = () => api.get('/health')

export const info = () => api.get('/health/info')


