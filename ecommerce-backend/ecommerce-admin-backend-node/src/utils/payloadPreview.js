const truncateString = (value, limit = 200) => {
  if (typeof value !== 'string') return value
  if (value.length <= limit) return value
  const remaining = value.length - limit
  return `${value.slice(0, limit)}...(+${remaining} chars)`
}

const formatValue = (value, options = {}, nested = false) => {
  if (value === null || typeof value === 'undefined') return value
  if (typeof value === 'string') return truncateString(value, options.stringLimit || 200)
  if (Array.isArray(value)) return previewArray(value, options, nested)
  if (typeof value === 'object') return previewObject(value, options, true)
  return value
}

const previewArray = (arr, options = {}, nested = false) => {
  const limit = nested ? (options.nestedArrayItemLimit || 3) : (options.arrayItemLimit || 5)
  const preview = arr.slice(0, limit).map((item) => formatValue(item, options, true))
  if (arr.length > limit) preview.push(`...(+${arr.length - limit} more)`)
  return preview
}

const previewObject = (obj, options = {}, nested = false) => {
  if (!obj || typeof obj !== 'object') return obj
  const limit = nested ? (options.nestedKeyLimit || 8) : (options.keyLimit || 24)
  const entries = Object.entries(obj)
  const preview = {}
  entries.slice(0, limit).forEach(([key, value]) => {
    preview[key] = formatValue(value, options, true)
  })
  if (entries.length > limit) preview.__truncatedKeys = entries.length - limit
  return preview
}

const buildPayloadPreview = (payload, options = {}) => {
  if (payload === null || typeof payload === 'undefined') return payload
  if (typeof payload === 'string') return truncateString(payload, options.stringLimit || 200)
  if (Array.isArray(payload)) return previewArray(payload, options, false)
  if (typeof payload === 'object') return previewObject(payload, options, false)
  return payload
}

module.exports = {
  buildPayloadPreview
}


