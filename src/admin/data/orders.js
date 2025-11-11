export const initialOrders = [
  {
    id: '#FC-1142',
    date: 'Jun 20, 2025',
    customerName: 'Taylor Morris',
    customerLocation: 'Austin, TX',
    status: 'Shipped',
    total: 248.9
  },
  {
    id: '#FC-1141',
    date: 'Jun 20, 2025',
    customerName: 'Bianca Patel',
    customerLocation: 'Nashville, TN',
    status: 'Processing',
    total: 138.4
  },
  {
    id: '#FC-1140',
    date: 'Jun 19, 2025',
    customerName: 'Carlos Rivera',
    customerLocation: 'Phoenix, AZ',
    status: 'Pending',
    total: 412.75
  },
  {
    id: '#FC-1139',
    date: 'Jun 19, 2025',
    customerName: 'Nina Kravitz',
    customerLocation: 'Seattle, WA',
    status: 'Delivered',
    total: 84.99
  },
  {
    id: '#FC-1138',
    date: 'Jun 18, 2025',
    customerName: 'John Everett',
    customerLocation: 'Denver, CO',
    status: 'Packed',
    total: 156.5
  },
  {
    id: '#FC-1137',
    date: 'Jun 18, 2025',
    customerName: 'Maya Bennett',
    customerLocation: 'Charlotte, NC',
    status: 'Processing',
    total: 312.75
  },
  {
    id: '#FC-1136',
    date: 'Jun 17, 2025',
    customerName: 'Olivia Martens',
    customerLocation: 'Chicago, IL',
    status: 'Delivered',
    total: 142.0
  },
  {
    id: '#FC-1135',
    date: 'Jun 16, 2025',
    customerName: 'Marcus Ortiz',
    customerLocation: 'Sacramento, CA',
    status: 'Cancelled',
    total: 286.2
  }
]

export const statusToneMap = {
  processing: 'primary',
  pending: 'warning',
  shipped: 'primary',
  packed: 'primary',
  delivered: 'success',
  cancelled: 'danger'
}

export const usStates = [
  'AL',
  'AZ',
  'CA',
  'CO',
  'FL',
  'GA',
  'IL',
  'MA',
  'NC',
  'NJ',
  'NY',
  'OH',
  'PA',
  'TN',
  'TX',
  'WA'
]
