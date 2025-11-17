# Routes Configuration Guide

## Tổng quan

Khi sử dụng Next.js với `output: 'export'` (static export), tất cả các routes phải được khai báo trong `generateStaticParams()`. Nếu không, bạn sẽ gặp lỗi build:

```
Page "/[[...slug]]/page" is missing param "/[[...slug]]" in "generateStaticParams()"
```

## Cách thêm route mới

### Bước 1: Thêm route vào `app/routes.ts`

Mở file `app/routes.ts` và thêm route vào section phù hợp:

- **STOREFRONT_ROUTES**: Routes công khai của storefront (shop, cart, checkout, etc.)
- **ERROR_ROUTES**: Error pages (400, 401, 403, 404, 500, 502, 503)
- **ADMIN_PUBLIC_ROUTES**: Admin routes không cần auth (login, signup, etc.)
- **ADMIN_PROTECTED_ROUTES**: Admin routes cần auth (dashboard, orders, products, etc.)

### Bước 2: Format route

Format route phải là: `{ slug: string[] }`

**Ví dụ:**
```typescript
// Root path (home page)
{ slug: [] }

// Single segment
{ slug: ['shop'] }

// Multiple segments
{ slug: ['admin', 'orders'] }
{ slug: ['admin', 'products', 'new'] }
```

### Bước 3: Rebuild app

Sau khi thêm route, rebuild app để generate static HTML file:

```bash
npm run build
```

## Checklist khi thêm route mới

- [ ] Route đã được thêm vào `app/routes.ts` trong section phù hợp
- [ ] Format route đúng: `{ slug: string[] }`
- [ ] Route đã được test trong development
- [ ] Build thành công không có lỗi `generateStaticParams()`
- [ ] Static HTML file đã được generate trong `out/` folder

## Lưu ý quan trọng

1. **Dynamic routes** (có `:id`, `:orderId`, etc.) KHÔNG cần thêm vào `generateStaticParams()` vì chúng được handle bởi React Router trên client-side.

2. **Error pages** (400, 401, 403, 404, 500, 502, 503) PHẢI được thêm vào `ERROR_ROUTES` để tránh lỗi build.

3. Nếu bạn thấy lỗi build về missing param, kiểm tra:
   - Route đã được thêm vào `app/routes.ts` chưa?
   - Format route có đúng không?
   - Route có nằm trong section đúng không?

## Ví dụ

### Thêm route mới: `/blog`

1. Thêm vào `STOREFRONT_ROUTES` trong `app/routes.ts`:
```typescript
export const STOREFRONT_ROUTES = [
  // ... existing routes
  { slug: ['blog'] },
] as const;
```

2. Route sẽ tự động được include trong `generateStaticParams()`

3. Rebuild app

### Thêm error page mới: `/504`

1. Thêm vào `ERROR_ROUTES` trong `app/routes.ts`:
```typescript
export const ERROR_ROUTES = [
  // ... existing routes
  { slug: ['504'] }, // Gateway Timeout
] as const;
```

2. Rebuild app

## Troubleshooting

### Lỗi: "Page is missing param in generateStaticParams()"

**Nguyên nhân:** Route chưa được thêm vào `app/routes.ts`

**Giải pháp:** 
1. Tìm route bị thiếu trong error message
2. Thêm route vào `app/routes.ts`
3. Rebuild app

### Lỗi: "Route format incorrect"

**Nguyên nhân:** Format route không đúng

**Giải pháp:**
- Đảm bảo format là `{ slug: string[] }`
- Root path: `{ slug: [] }`
- Single segment: `{ slug: ['segment'] }`
- Multiple segments: `{ slug: ['segment1', 'segment2'] }`


