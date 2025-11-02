# API Integration Guide

This project is ready for API integration. Example with Next.js API routes and fetch:

## Example: Fetching Products

```js
// /app/api/products/route.js
export async function GET() {
  // Fetch from database or external API
  return Response.json([
    { id: 1, name: 'Crimson Silk Áo Dài', price: 349 },
    // ...
  ]);
}
```

## Fetching from the frontend

```js
const res = await fetch('/api/products');
const products = await res.json();
```

## Notes
- Use SWR or React Query for advanced fetching/caching.
- Secure sensitive API logic on the server side.
