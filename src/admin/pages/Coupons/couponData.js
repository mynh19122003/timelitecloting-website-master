import { FiGift, FiPercent, FiTag, FiTruck } from 'react-icons/fi'

export const initialCoupons = [
  {
    id: 'CPN-2045',
    name: 'Summer discount 15%',
    code: 'SUMMER2025',
    usage: 57,
    status: 'Active',
    startDate: 'Jun 01, 2025',
    endDate: 'Jun 15, 2025',
    type: 'Percentage Discount'
  },
  {
    id: 'CPN-2044',
    name: 'Free shipping on all items',
    code: 'SHIPFREE15',
    usage: 42,
    status: 'Active',
    startDate: 'Jun 01, 2025',
    endDate: 'Jun 30, 2025',
    type: 'Free Shipping'
  },
  {
    id: 'CPN-2043',
    name: 'New subscriber $10 off',
    code: 'WELCOME10',
    usage: 18,
    status: 'Scheduled',
    startDate: 'Jul 01, 2025',
    endDate: 'Jul 15, 2025',
    type: 'Fixed Discount'
  },
  {
    id: 'CPN-2042',
    name: 'Bundle up save $25',
    code: 'BUNDLE25',
    usage: 33,
    status: 'Active',
    startDate: 'May 10, 2025',
    endDate: 'Jun 10, 2025',
    type: 'Price Discount'
  },
  {
    id: 'CPN-2041',
    name: 'VIP early access',
    code: 'VIPACCESS',
    usage: 12,
    status: 'Expired',
    startDate: 'Apr 12, 2025',
    endDate: 'May 01, 2025',
    type: 'Percentage Discount'
  },
  {
    id: 'CPN-2040',
    name: 'Free shipping weekend',
    code: 'SHIPWEEKEND',
    usage: 28,
    status: 'Expired',
    startDate: 'Apr 05, 2025',
    endDate: 'Apr 07, 2025',
    type: 'Free Shipping'
  }
]

export const statusToneMap = {
  active: 'success',
  scheduled: 'primary',
  expired: 'muted'
}

export const couponTypes = [
  { value: 'fixed', label: 'Fixed Discount', icon: FiTag },
  { value: 'percentage', label: 'Percentage Discount', icon: FiPercent },
  { value: 'shipping', label: 'Free Shipping', icon: FiTruck },
  { value: 'price', label: 'Price Discount', icon: FiGift }
]
