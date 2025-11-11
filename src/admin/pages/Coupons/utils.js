import { FiTag } from 'react-icons/fi'
import { couponTypes, statusToneMap } from './couponData'

export const ensureTypeLabel = (value, fallback = 'Fixed Discount') => {
  if (!value) return fallback
  const match = couponTypes.find(
    (item) => item.value === value || item.label.toLowerCase() === value.toLowerCase()
  )
  return match?.label || value
}

export const statusTone = (status) => statusToneMap[status?.toLowerCase()] || 'muted'

export const getTypeMeta = (type) => {
  const label = ensureTypeLabel(type)
  const match = couponTypes.find((item) => item.label === label || item.value === label)
  return { label, Icon: match?.icon || FiTag }
}

export const parseDateValue = (value, fallback = 0) => {
  if (!value) return fallback
  if (value === 'No end date') return Number.POSITIVE_INFINITY
  if (value === 'Immediate') return Date.now()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const normalizeCoupon = (incoming, existing) => {
  const base = existing ?? {}
  const id = incoming.id || base.id || `CPN-${Date.now().toString().slice(-4)}`
  const { label } = getTypeMeta(incoming.type || base.type)

  return {
    id,
    name: incoming.name || base.name || 'Untitled coupon',
    code: (incoming.code || base.code || 'NEWCODE').toUpperCase(),
    usage: Number(incoming.usage ?? base.usage ?? 0),
    status: incoming.status || base.status || 'Active',
    startDate: incoming.startDate || base.startDate || 'Immediate',
    endDate: incoming.endDate || base.endDate || 'No end date',
    type: label,
    discountValue: incoming.discountValue ?? base.discountValue ?? '0',
    appliesTo: incoming.appliesTo || base.appliesTo || 'All products',
    usageLimit: incoming.usageLimit || base.usageLimit || 'Unlimited',
    description: incoming.description ?? base.description ?? ''
  }
}
