# 📋 Kế Hoạch: Quản Lý Variant và Navigation Items

## 🎯 Mục Tiêu

1. **Cho phép cập nhật variant của sản phẩm trên web admin**
2. **Cho phép quản lý (thêm/sửa/xóa) variants trong navigation items từ admin panel**
3. **Lưu trữ nav items và variants vào database để có thể cập nhật linh hoạt**

---

## 📊 Phân Tích Hiện Trạng

### ✅ Đã Có Sẵn

1. **Database Schema:**
   - Table `products` đã có field `variant VARCHAR(128)`
   - Backend API đã hỗ trợ update variant (dòng 273 trong `productsService.js`)

2. **Admin Panel:**
   - Form `AddProduct.jsx` để tạo/sửa sản phẩm
   - Service `productsService.js` để gọi API
   - Backend endpoint `PATCH /admin/products/:id` đã hỗ trợ variant

3. **Navigation Structure:**
   - File `shop.data.ts` định nghĩa `ShopNavItem[]` với cấu trúc:
     - `columns`: Array of `{ heading: string, links: string[] }`
     - `quickLinks`: Array of strings
   - Navbar sử dụng `navLinkParamMap` để map links → query params

### ❌ Chưa Có

1. **Form field variant** trong `AddProduct.jsx`
2. **Database table** để lưu nav items và variants
3. **API endpoints** để CRUD nav items
4. **Admin page** để quản lý nav items
5. **Dynamic loading** nav items từ database

---

## 🏗️ Kiến Trúc Giải Pháp

### 1. Database Schema

#### Table: `nav_items`
```sql
CREATE TABLE nav_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    category_slug VARCHAR(128) UNIQUE,
    accent TINYINT(1) DEFAULT 0,
    disable_dropdown TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_slug (category_slug),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: `nav_columns`
```sql
CREATE TABLE nav_columns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nav_item_id INT NOT NULL,
    heading VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nav_item_id) REFERENCES nav_items(id) ON DELETE CASCADE,
    INDEX idx_nav_item_id (nav_item_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: `nav_variants`
```sql
CREATE TABLE nav_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nav_column_id INT NOT NULL,
    label VARCHAR(255) NOT NULL,
    variant_type ENUM('variant', 'chip', 'facet') DEFAULT 'facet',
    variant_value VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nav_column_id) REFERENCES nav_columns(id) ON DELETE CASCADE,
    INDEX idx_nav_column_id (nav_column_id),
    INDEX idx_variant_type (variant_type),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: `nav_quick_links`
```sql
CREATE TABLE nav_quick_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nav_item_id INT NOT NULL,
    label VARCHAR(255) NOT NULL,
    variant_type ENUM('variant', 'chip', 'facet') DEFAULT 'facet',
    variant_value VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nav_item_id) REFERENCES nav_items(id) ON DELETE CASCADE,
    INDEX idx_nav_item_id (nav_item_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Backend API Endpoints

#### Node.js Admin Backend (`ecommerce-admin-backend-node`)

**Routes:** `src/routes/navRoutes.js`
```javascript
GET    /admin/nav-items              // List all nav items
POST   /admin/nav-items              // Create nav item
GET    /admin/nav-items/:id          // Get nav item detail
PATCH  /admin/nav-items/:id          // Update nav item
DELETE /admin/nav-items/:id          // Delete nav item

GET    /admin/nav-items/:id/columns  // Get columns for nav item
POST   /admin/nav-items/:id/columns  // Add column to nav item
PATCH  /admin/nav-items/columns/:id  // Update column
DELETE /admin/nav-items/columns/:id  // Delete column

GET    /admin/nav-items/columns/:id/variants  // Get variants for column
POST   /admin/nav-items/columns/:id/variants  // Add variant to column
PATCH  /admin/nav-items/variants/:id          // Update variant
DELETE /admin/nav-items/variants/:id          // Delete variant
```

### 3. Frontend Admin Pages

#### A. Cập Nhật AddProduct.jsx
- Thêm field `variant` vào form
- Hiển thị dropdown với các variants có sẵn từ nav items
- Cho phép nhập variant mới hoặc chọn từ danh sách

#### B. Tạo NavigationManagement Page
**File:** `src/admin/pages/Navigation/NavigationManagement.jsx`

**Features:**
- Danh sách nav items với tree view
- Thêm/sửa/xóa nav items
- Quản lý columns cho mỗi nav item
- Quản lý variants cho mỗi column
- Drag & drop để sắp xếp thứ tự
- Preview navigation structure

### 4. Frontend Service Layer

#### File: `src/admin/services/navService.js`
```javascript
export const listNavItems = async () => { ... }
export const getNavItem = async (id) => { ... }
export const createNavItem = async (data) => { ... }
export const updateNavItem = async (id, data) => { ... }
export const deleteNavItem = async (id) => { ... }
// Similar for columns and variants
```

### 5. Cập Nhật shop.data.ts

**Option 1: Load từ API (Recommended)**
```typescript
// shop.data.ts
let cachedNavItems: ShopNavItem[] | null = null;

export const loadNavItems = async (): Promise<ShopNavItem[]> => {
  if (cachedNavItems) return cachedNavItems;
  const response = await fetch('/admin/api/nav-items');
  const data = await response.json();
  cachedNavItems = transformToShopNavItems(data);
  return cachedNavItems;
};

export const shopNavMenu: ShopNavItem[] = []; // Fallback empty array
```

**Option 2: Hybrid (API + Fallback)**
- Load từ API nếu có
- Fallback về hardcoded data nếu API fail

### 6. Cập Nhật Navbar.tsx

- Load nav items từ API thay vì import từ `shop.data.ts`
- Sử dụng React Query hoặc SWR để cache
- Auto-refresh khi có thay đổi

---

## 📝 Chi Tiết Implementation

### Phase 1: Cập Nhật Variant trong Product Form

1. **AddProduct.jsx:**
   - Thêm field `variant` vào form state
   - Thêm input/dropdown cho variant
   - Load danh sách variants từ API (nếu có)
   - Gửi variant khi submit

2. **productsService.js:**
   - Đảm bảo variant được gửi trong payload
   - Map variant từ form data

### Phase 2: Database & Backend

1. **Migration Script:**
   - Tạo file migration SQL
   - Seed dữ liệu từ `shop.data.ts` hiện tại

2. **Backend Services:**
   - `navItemsService.js`: CRUD nav items
   - `navColumnsService.js`: CRUD columns
   - `navVariantsService.js`: CRUD variants

3. **Backend Controllers:**
   - `navItemsController.js`: Handle HTTP requests

4. **Backend Routes:**
   - `navRoutes.js`: Define endpoints

### Phase 3: Frontend Admin UI

1. **NavigationManagement Page:**
   - List view với expand/collapse
   - Form để thêm/sửa nav item
   - Form để thêm/sửa column
   - Form để thêm/sửa variant
   - Validation và error handling

2. **Routing:**
   - Thêm route `/admin/navigation` vào `AdminApp.tsx`
   - Thêm menu item vào Sidebar

### Phase 4: Frontend Integration

1. **Update shop.data.ts:**
   - Tạo function `loadNavItemsFromAPI()`
   - Fallback về hardcoded data

2. **Update Navbar.tsx:**
   - Sử dụng `loadNavItemsFromAPI()` trong useEffect
   - Handle loading state

---

## 🔄 Workflow

### Khi Admin Thêm Variant Mới:

1. Admin vào `/admin/navigation`
2. Chọn nav item (ví dụ: "Ao Dai")
3. Chọn column (ví dụ: "Silhouettes")
4. Click "Add Variant"
5. Nhập label: "Classic"
6. Chọn variant_type: "variant"
7. Nhập variant_value: "Classic"
8. Save → API lưu vào `nav_variants`
9. Navbar tự động load lại từ API

### Khi Admin Cập Nhật Variant của Sản Phẩm:

1. Admin vào `/admin/products/:id/edit`
2. Scroll đến field "Variant"
3. Chọn từ dropdown hoặc nhập mới
4. Save → API update `products.variant`
5. Frontend shop page filter theo variant mới

---

## 🧪 Testing Checklist

- [ ] Tạo nav item mới thành công
- [ ] Thêm column vào nav item
- [ ] Thêm variant vào column
- [ ] Sửa variant label
- [ ] Xóa variant
- [ ] Navbar hiển thị đúng variants từ API
- [ ] Click variant link → filter đúng sản phẩm
- [ ] Cập nhật variant của sản phẩm trong admin
- [ ] Sản phẩm hiển thị đúng variant sau khi update
- [ ] Fallback về hardcoded data nếu API fail

---

## 📦 Files Cần Tạo/Sửa

### Backend (Node.js)
- `ecommerce-backend/database/migrations/YYYY-MM-DD-create-nav-tables.sql`
- `ecommerce-backend/ecommerce-admin-backend-node/src/services/navItemsService.js`
- `ecommerce-backend/ecommerce-admin-backend-node/src/services/navColumnsService.js`
- `ecommerce-backend/ecommerce-admin-backend-node/src/services/navVariantsService.js`
- `ecommerce-backend/ecommerce-admin-backend-node/src/controllers/navItemsController.js`
- `ecommerce-backend/ecommerce-admin-backend-node/src/routes/navRoutes.js`
- `ecommerce-backend/ecommerce-admin-backend-node/src/middleware/validation.js` (thêm schemas)

### Frontend Admin
- `src/admin/pages/Navigation/NavigationManagement.jsx`
- `src/admin/pages/Navigation/NavigationManagement.module.css`
- `src/admin/services/navService.js`
- `src/admin/pages/Products/AddProduct.jsx` (sửa)
- `src/admin/services/productsService.js` (sửa)
- `src/admin/AdminApp.tsx` (thêm route)
- `src/admin/components/Sidebar/Sidebar.jsx` (thêm menu item)

### Frontend Public
- `src/components/Shop/shop.data.ts` (sửa để load từ API)
- `src/components/layout/Navbar/Navbar.tsx` (sửa để load từ API)

---

## 🚀 Deployment Notes

1. **Database Migration:**
   - Chạy migration script trước khi deploy
   - Seed dữ liệu từ `shop.data.ts` hiện tại

2. **Backend:**
   - Rebuild Docker image
   - Restart admin backend service

3. **Frontend:**
   - Build và deploy như bình thường
   - Clear cache nếu có

---

## 📌 Lưu Ý

1. **Backward Compatibility:**
   - Giữ hardcoded data trong `shop.data.ts` làm fallback
   - Không break existing functionality nếu API fail

2. **Performance:**
   - Cache nav items trong frontend
   - Chỉ reload khi admin update

3. **Security:**
   - Chỉ admin mới có quyền CRUD nav items
   - Validate input trên cả frontend và backend

4. **UX:**
   - Preview navigation structure trong admin
   - Drag & drop để sắp xếp
   - Confirmation dialog khi xóa

---

## ✅ Kết Luận

Plan này sẽ cho phép:
- ✅ Admin cập nhật variant của sản phẩm
- ✅ Admin quản lý nav items và variants linh hoạt
- ✅ Hệ thống mở rộng dễ dàng cho tương lai
- ✅ Không break existing functionality

Sẵn sàng để bắt đầu implementation! 🚀

