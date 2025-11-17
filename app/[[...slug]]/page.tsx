import ClientApp from "./ClientApp";
import { ALL_STATIC_ROUTES } from "../routes";

/**
 * Disable dynamic params generation - only use params from generateStaticParams()
 * This is required for static export (output: 'export')
 */
export const dynamicParams = false;

/**
 * Generate static params for all possible routes
 * 
 * This ensures Next.js generates static HTML files for all routes at build time.
 * Dynamic routes (with :id, :orderId, etc.) will be handled by React Router on client-side.
 * 
 * IMPORTANT: When adding a new route to your app:
 * 1. Add the route to the appropriate section in app/routes.ts
 * 2. The route will be automatically included here via ALL_STATIC_ROUTES
 * 3. Rebuild the app to generate the static HTML file
 * 
 * If you see an error like "Page is missing param in generateStaticParams()",
 * it means you forgot to add the route to app/routes.ts
 */
export async function generateStaticParams(): Promise<Array<{ slug: string[] }>> {
  // Return all routes from centralized routes configuration
  // This includes:
  // - Storefront routes (home, shop, cart, checkout, etc.)
  // - Error pages (400, 401, 403, 404, 500, 502, 503)
  // - Admin public routes (login, signup, etc.)
  // - Admin protected routes (dashboard, orders, products, etc.)
  return ALL_STATIC_ROUTES as Array<{ slug: string[] }>;
}

// Server Component wrapper
// ClientApp is a Client Component that handles dynamic import with ssr: false
// In Next.js 15, params is a Promise and must be awaited
export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  // Await params to satisfy Next.js 15 requirements
  // Even though we don't use it (routing is handled by React Router on client)
  await params;
  return <ClientApp />;
}
