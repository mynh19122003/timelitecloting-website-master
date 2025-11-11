export const performanceMetrics = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$120,540',
    delta: '+22.45%',
    trend: 'up',
    accent: 'primary'
  },
  {
    id: 'orders',
    label: 'New Orders',
    value: '1,056',
    delta: '+15.34%',
    trend: 'up',
    accent: 'success'
  },
  {
    id: 'visits',
    label: 'Unique Visits',
    value: '5,420',
    delta: '-10.24%',
    trend: 'down',
    accent: 'accent'
  },
  {
    id: 'customers',
    label: 'New Customers',
    value: '1,650',
    delta: '+13.54%',
    trend: 'up',
    accent: 'warning'
  }
]

export const ordersOverTime = [
  { hour: '0h', current: 12, previous: 8 },
  { hour: '3h', current: 18, previous: 12 },
  { hour: '6h', current: 24, previous: 15 },
  { hour: '9h', current: 38, previous: 21 },
  { hour: '12h', current: 48, previous: 29 },
  { hour: '15h', current: 36, previous: 24 },
  { hour: '18h', current: 42, previous: 28 },
  { hour: '21h', current: 34, previous: 25 }
]

export const salesByDay = [
  { day: 'Mon', revenue: 1840 },
  { day: 'Tue', revenue: 2205 },
  { day: 'Wed', revenue: 2430 },
  { day: 'Thu', revenue: 1990 },
  { day: 'Fri', revenue: 2525 },
  { day: 'Sat', revenue: 2840 },
  { day: 'Sun', revenue: 2080 }
]

export const recentTransactions = [
  { id: 'TRX-1001', name: 'Jagarnath S.', date: 'May 24, 2025', amount: '$124.97', status: 'Paid' },
  { id: 'TRX-1002', name: 'Anand G.', date: 'May 23, 2025', amount: '$55.42', status: 'Pending' },
  { id: 'TRX-1003', name: 'Kartik S.', date: 'May 23, 2025', amount: '$89.90', status: 'Paid' },
  { id: 'TRX-1004', name: 'Rakesh S.', date: 'May 22, 2025', amount: '$144.94', status: 'Pending' },
  { id: 'TRX-1005', name: 'Anup S.', date: 'May 22, 2025', amount: '$70.52', status: 'Paid' }
]

export const topProducts = [
  { id: 1, name: 'Men Grey Hoodie', price: '$49.90', unitsSold: 204 },
  { id: 2, name: 'Women Striped Tee', price: '$34.90', unitsSold: 155 },
  { id: 3, name: 'Women White Tee', price: '$40.90', unitsSold: 120 },
  { id: 4, name: 'Men White Tee', price: '$49.90', unitsSold: 204 },
  { id: 5, name: 'Women Red Tee', price: '$34.90', unitsSold: 155 }
]

export const ordersTable = [
  {
    id: '#FC-1024',
    customer: 'Rakesh Mishra',
    location: 'Bangalore, IN',
    date: 'May 22, 2025',
    amount: '$264.42',
    status: 'Paid'
  },
  {
    id: '#FC-1023',
    customer: 'Lakhan Singh',
    location: 'Copenhagen, DK',
    date: 'May 21, 2025',
    amount: '$109.12',
    status: 'Processing'
  },
  {
    id: '#FC-1022',
    customer: 'Dronacharya',
    location: 'New York, US',
    date: 'May 21, 2025',
    amount: '$92.18',
    status: 'Pending'
  },
  {
    id: '#FC-1021',
    customer: 'Amod Yadav',
    location: 'Tokyo, JP',
    date: 'May 21, 2025',
    amount: '$188.36',
    status: 'Cancelled'
  },
  {
    id: '#FC-1020',
    customer: 'Rakesh Singh',
    location: 'San Diego, US',
    date: 'May 20, 2025',
    amount: '$76.90',
    status: 'Paid'
  }
]

export const customersTable = [
  {
    id: 'CUS-01',
    name: 'Rakesh Mishra',
    location: 'Bangalore, India',
    orders: 8,
    spent: '$3,421',
    status: 'Active'
  },
  {
    id: 'CUS-02',
    name: 'Lakhan Singh',
    location: 'Copenhagen, Denmark',
    orders: 12,
    spent: '$4,126',
    status: 'Active'
  },
  {
    id: 'CUS-03',
    name: 'Dronacharya',
    location: 'San Francisco, USA',
    orders: 5,
    spent: '$1,326',
    status: 'Inactive'
  },
  {
    id: 'CUS-04',
    name: 'Amod Yadav',
    location: 'Tokyo, Japan',
    orders: 9,
    spent: '$2,914',
    status: 'Active'
  },
  {
    id: 'CUS-05',
    name: 'Rakesh Singh',
    location: 'Delhi, India',
    orders: 3,
    spent: '$986',
    status: 'Inactive'
  }
]

export const productsTable = [
  {
    id: 'PRD-1024',
    name: 'Women White Blazer',
    sku: 'SKU-4458',
    inventory: 43,
    price: '$128.00',
    status: 'Active'
  },
  {
    id: 'PRD-1023',
    name: 'Men Grey Hoodie',
    sku: 'SKU-1766',
    inventory: 26,
    price: '$89.00',
    status: 'Active'
  },
  {
    id: 'PRD-1022',
    name: 'Women Red Dress',
    sku: 'SKU-5433',
    inventory: 12,
    price: '$149.00',
    status: 'Low Stock'
  },
  {
    id: 'PRD-1021',
    name: 'Men Black Jacket',
    sku: 'SKU-2377',
    inventory: 8,
    price: '$199.00',
    status: 'Low Stock'
  },
  {
    id: 'PRD-1020',
    name: 'Women Summer Hat',
    sku: 'SKU-1128',
    inventory: 0,
    price: '$34.00',
    status: 'Out of Stock'
  }
]

export const categories = [
  { id: 'cat-01', title: 'Men Clothes', items: 24 },
  { id: 'cat-02', title: 'Women Clothes', items: 32 },
  { id: 'cat-03', title: 'Accessories', items: 18 },
  { id: 'cat-04', title: 'Wedding Clothes', items: 12 },
  { id: 'cat-05', title: 'Cotton Clothes', items: 26 },
  { id: 'cat-06', title: 'Summer Clothes', items: 20 },
  { id: 'cat-07', title: 'Spring Collection', items: 15 },
  { id: 'cat-08', title: 'Casual Clothes', items: 52 }
]

export const coupons = [
  {
    id: 'COUP-01',
    name: 'Summer discount 10% off',
    code: 'SUMMER2025',
    usage: '32 times',
    status: 'Active',
    duration: 'May 1 - May 30'
  },
  {
    id: 'COUP-02',
    name: 'Free shipping on all items',
    code: 'SHIPFREE',
    usage: '57 times',
    status: 'Active',
    duration: 'May 5 - May 20'
  },
  {
    id: 'COUP-03',
    name: 'Discount for women clothes 5%',
    code: 'WOMEN5',
    usage: '42 times',
    status: 'Expired',
    duration: 'Apr 1 - Apr 30'
  },
  {
    id: 'COUP-04',
    name: 'Summer discount 15% off',
    code: 'SUMMER15',
    usage: '18 times',
    status: 'Active',
    duration: 'Jun 1 - Jun 15'
  }
]

export const supportArticles = [
  { id: 'kb-01', title: 'Getting Started', description: 'Guides to configure your store faster.' },
  { id: 'kb-02', title: 'Personal Settings', description: 'Manage your admin profile and preferences.' },
  { id: 'kb-03', title: 'Billing', description: 'Handle invoices, payment methods, and taxes.' },
  { id: 'kb-04', title: 'Commerce', description: 'Best practices for product listings and merchandising.' }
]

export const inboxThreads = [
  {
    id: 'conv-01',
    name: 'Tom Anderson',
    lastMessage: 'Hello, I am interested in this item...',
    time: '12:24 AM',
    unread: 2,
    online: true
  },
  {
    id: 'conv-02',
    name: 'Luis Pittman',
    lastMessage: 'Hi, can I ask if there is anything new for spring?',
    time: '10:50 AM',
    unread: 5,
    online: true
  },
  {
    id: 'conv-03',
    name: 'Alisson Mack',
    lastMessage: 'I want to complain about item',
    time: 'Yesterday',
    unread: 0,
    online: false
  },
  {
    id: 'conv-04',
    name: 'Barry George',
    lastMessage: 'Is there any chance to get a refund?',
    time: '09:54 AM',
    unread: 1,
    online: false
  }
]

export const revenueBreakdown = [
  { name: 'United States', value: 35600 },
  { name: 'India', value: 22480 },
  { name: 'Germany', value: 18420 },
  { name: 'Australia', value: 13210 },
  { name: 'Brazil', value: 10840 }
]
