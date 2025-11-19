/**
 * Routes Configuration
 * 
 * This file contains all static routes that need to be generated
 * for Next.js static export (output: 'export').
 * 
 * IMPORTANT: When adding a new route to the app:
 * 1. Add the route path here in the appropriate section
 * 2. The route will be automatically included in generateStaticParams()
 * 
 * Format: { slug: string[] }
 * - Root path: { slug: [] }
 * - Single segment: { slug: ['shop'] }
 * - Multiple segments: { slug: ['admin', 'orders'] }
 */

// Public storefront routes
export const STOREFRONT_ROUTES = [
  { slug: [] }, // Home page - root path
  { slug: ['shop'] },
  { slug: ['about'] },
  { slug: ['contact'] },
  { slug: ['cart'] },
  { slug: ['checkout'] },
  { slug: ['profile'] },
  { slug: ['orders'] },
  { slug: ['login'] },
  { slug: ['register'] },
  { slug: ['forgot-password'] },
  { slug: ['reset-password'] },
  { slug: ['verify-email'] },
] as const;

// Error pages - required for static export
// Note: 500.html is handled by public/500.html file, not as a route
export const ERROR_ROUTES = [
  { slug: ['400'] }, // Bad Request
  { slug: ['401'] }, // Unauthorized
  { slug: ['403'] }, // Forbidden
  { slug: ['404'] }, // Not Found
  // { slug: ['500'] }, // Internal Server Error - handled by public/500.html
  { slug: ['502'] }, // Bad Gateway
  { slug: ['503'] }, // Service Unavailable
] as const;

// Admin public routes (no auth required)
export const ADMIN_PUBLIC_ROUTES = [
  { slug: ['admin', 'login'] },
  { slug: ['admin', 'signup'] },
  { slug: ['admin', 'reset-password'] },
  { slug: ['admin', 'confirm-email'] },
  { slug: ['admin', 'check-email'] },
] as const;

// Admin protected routes (require auth)
// Note: Dynamic routes like /admin/orders/:orderId are handled by React Router on client-side
export const ADMIN_PROTECTED_ROUTES = [
  { slug: ['admin'] }, // Dashboard
  { slug: ['admin', 'orders'] },
  { slug: ['admin', 'products'] },
  { slug: ['admin', 'products', 'new'] },
  { slug: ['admin', 'customers'] },
  { slug: ['admin', 'customers', 'new'] },
  { slug: ['admin', 'reports'] },
  { slug: ['admin', 'coupons'] },
  { slug: ['admin', 'coupons', 'new'] },
  { slug: ['admin', 'settings'] },
] as const;

// Combine all routes for generateStaticParams
export const ALL_STATIC_ROUTES = [
  ...STOREFRONT_ROUTES,
  ...ERROR_ROUTES,
  ...ADMIN_PUBLIC_ROUTES,
  ...ADMIN_PROTECTED_ROUTES,
] as const;

// Type for route params
export type RouteParams = { slug: string[] };


