# 📋 Code Review & Feature Roadmap

**Ngày review:** $(date)  
**Trạng thái hiện tại:** E-commerce platform đã có các chức năng core cơ bản

---

## ✅ CÁC CHỨC NĂNG ĐÃ CÓ

### 1. **User Management** ✅
- ✅ Đăng ký (Register)
- ✅ Đăng nhập (Login) với JWT
- ✅ Đăng xuất (Logout)
- ✅ Quản lý Profile (View/Edit)
  - Name, Email, Phone, Address
  - Phone input với country selector
- ✅ Đổi mật khẩu (Change Password)
- ✅ Quên mật khẩu (Forgot Password)
- ✅ Reset mật khẩu (Reset Password)
- ✅ Xác thực Email (Verify Email) - UI có, backend có token nhưng chưa có email service thực tế
- ✅ Resend Verification Email

### 2. **Product Management** ✅
- ✅ Hiển thị danh sách sản phẩm (Shop Page)
- ✅ Chi tiết sản phẩm (Product Detail)
- ✅ Lọc sản phẩm theo:
  - Category (ao-dai, wedding, vest, evening)
  - Color
  - Price range
  - Sort (featured, price asc/desc)
- ✅ Product Gallery (multiple images)
- ✅ Product variants (colors, sizes)
- ✅ Rating & Reviews (hiển thị, chưa có submit)
- ✅ Featured products
- ✅ New products badge
- ✅ Product images từ Admin media server

### 3. **Shopping Cart** ✅
- ✅ Add to cart
- ✅ Remove from cart
- ✅ Update quantity
- ✅ Clear cart
- ✅ Cart drawer (sidebar)
- ✅ Cart page
- ✅ Cart persistence (localStorage)
- ✅ Support products từ API và local data

### 4. **Checkout & Orders** ✅
- ✅ Checkout form
- ✅ Shipping address form
- ✅ Payment method selection (Bank Transfer, COD)
- ✅ Order creation
- ✅ Order history
- ✅ Order details view
- ✅ Order status tracking (pending, processing, shipped, delivered, cancelled)
- ✅ Order filtering (by status)
- ✅ Order sorting (newest/oldest)

### 5. **Pages & Navigation** ✅
- ✅ Homepage với hero section
- ✅ Shop page với filters
- ✅ Product detail page
- ✅ Cart page
- ✅ Checkout page
- ✅ Profile page (2 tabs: Profile, Order History)
- ✅ Login page
- ✅ Register page
- ✅ About page
- ✅ Contact page
- ✅ Forgot password page
- ✅ Reset password page
- ✅ Verify email page
- ✅ Responsive navigation (Navbar)
- ✅ Footer

### 6. **Backend APIs** ✅
- ✅ User APIs (Node.js + PHP)
  - Register, Login, Profile, Change Password
  - Forgot Password, Reset Password
  - Verify Email, Resend Verification
- ✅ Product APIs (PHP)
  - GET products (với pagination, search, filter)
  - GET product by ID/slug
- ✅ Order APIs (Node.js + PHP)
  - Create order
  - Get order history
  - Get order by ID
- ✅ Authentication (JWT)
- ✅ Database (MySQL)

### 7. **UI/UX Features** ✅
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Responsive design
- ✅ Modern UI với Tailwind CSS
- ✅ Chat widget (UI có, chưa có backend)

---

## ❌ CÁC CHỨC NĂNG CÒN THIẾU

### 🔴 **Priority 1: Critical Features**

#### 1. **Wishlist/Favorites** ❌
**Status:** UI có button nhưng chưa có chức năng
- ❌ Backend API để lưu wishlist
- ❌ Database table cho wishlist
- ❌ Add/Remove wishlist functionality
- ❌ Wishlist page để xem saved items
- ❌ Wishlist persistence across sessions

**Files cần sửa:**
- `src/components/ui/ProductCard/ProductCard.tsx` (line 72-74)
- Tạo `src/context/WishlistContext.tsx`
- Tạo `src/pages/WishlistPage/`
- Backend API: `POST /api/wishlist/add`, `DELETE /api/wishlist/remove`, `GET /api/wishlist`

#### 2. **Product Reviews & Ratings** ❌
**Status:** Hiển thị rating nhưng chưa có chức năng submit
- ❌ Backend API để submit reviews
- ❌ Database table cho reviews
- ❌ Review form trên product detail page
- ❌ Display reviews list
- ❌ Review moderation (admin)

**Files cần sửa:**
- `src/pages/ProductDetailPage/ProductDetailPage.tsx` (thêm review section)
- Backend API: `POST /api/products/:id/reviews`, `GET /api/products/:id/reviews`

#### 3. **Search Functionality** ⚠️
**Status:** Có search trong Navbar nhưng chỉ search local products
- ⚠️ Search chỉ hoạt động với local products array
- ❌ Backend search API integration
- ❌ Search results page
- ❌ Advanced search filters
- ❌ Search suggestions/autocomplete
- ❌ Search history

**Files cần sửa:**
- `src/components/layout/Navbar/Navbar.tsx` (line 114-144)
- Tạo `src/pages/SearchResultsPage/`
- Backend API: `GET /api/products?search=query` (đã có nhưng chưa integrate đầy đủ)

#### 4. **Email Service** ❌
**Status:** Token được log ra console, chưa có email service thực tế
- ❌ Email service integration (Nodemailer/SendGrid)
- ❌ Email templates
- ❌ Welcome email sau registration
- ❌ Order confirmation email
- ❌ Password reset email
- ❌ Email verification email
- ❌ Order status update emails

**Files cần sửa:**
- Backend: `ecommerce-backend/backend-node/src/services/emailService.js`
- Backend: `ecommerce-backend/backend-php/src/Services/EmailService.php`

#### 5. **Admin Panel** ❌
**Status:** Hoàn toàn chưa có
- ❌ Admin authentication
- ❌ Admin dashboard
- ❌ Product management (CRUD)
- ❌ Order management
- ❌ User management
- ❌ Analytics & reports
- ❌ Inventory management
- ❌ Review moderation

**Files cần tạo:**
- `src/pages/Admin/AdminDashboard/`
- `src/pages/Admin/ProductManagement/`
- `src/pages/Admin/OrderManagement/`
- `src/pages/Admin/UserManagement/`
- Backend: Admin authentication middleware
- Backend: Admin APIs

---

### 🟡 **Priority 2: Important Features**

#### 6. **Order Management Enhancements** ⚠️
**Status:** Có basic order creation nhưng thiếu nhiều features
- ❌ Cancel order (user)
- ❌ Update order status (admin)
- ❌ Order tracking với tracking number
- ❌ Order notes/comments
- ❌ Order attachments (receipts, images)
- ❌ Return/Refund requests

**Files cần sửa:**
- `src/pages/ProfilePage/ProfilePage.tsx` (thêm cancel button)
- `src/pages/OrderDetailPage/` (tạo mới)
- Backend API: `PUT /api/orders/:id/cancel`, `PUT /api/orders/:id/status`

#### 7. **Payment Integration** ❌
**Status:** Chỉ có payment method selection, chưa có integration thực tế
- ❌ Stripe integration
- ❌ PayPal integration
- ❌ Bank transfer instructions
- ❌ Payment confirmation
- ❌ Refund handling
- ❌ Payment history

**Files cần sửa:**
- `src/pages/CheckoutPage/CheckoutPage.tsx` (thêm payment gateway)
- Backend: Payment webhook handlers

#### 8. **Inventory Management** ⚠️
**Status:** Database có stock field nhưng chưa có UI/features đầy đủ
- ⚠️ Stock checking khi add to cart
- ❌ Out of stock notifications
- ❌ Back in stock alerts
- ❌ Low stock alerts (admin)
- ❌ Inventory history

**Files cần sửa:**
- `src/context/CartContext.tsx` (check stock before add)
- `src/pages/ProductDetailPage/ProductDetailPage.tsx` (show stock status)

#### 9. **Address Management** ⚠️
**Status:** Chỉ có 1 address trong profile
- ❌ Multiple shipping addresses
- ❌ Address book management
- ❌ Default address selection
- ❌ Address validation

**Files cần sửa:**
- `src/pages/ProfilePage/ProfilePage.tsx` (thêm address management)
- Backend API: `GET /api/users/addresses`, `POST /api/users/addresses`, `PUT /api/users/addresses/:id`

#### 10. **Coupons & Discounts** ❌
**Status:** Hoàn toàn chưa có
- ❌ Coupon code system
- ❌ Discount codes
- ❌ Promotional codes
- ❌ Percentage discounts
- ❌ Fixed amount discounts
- ❌ Free shipping codes
- ❌ Admin coupon management

**Files cần tạo:**
- `src/pages/CheckoutPage/CheckoutPage.tsx` (thêm coupon input)
- Backend API: `POST /api/coupons/validate`, `GET /api/coupons`

---

### 🟢 **Priority 3: Nice to Have Features**

#### 11. **Product Comparison** ❌
- ❌ Compare products side-by-side
- ❌ Compare page
- ❌ Add to comparison

#### 12. **Product Recommendations** ❌
- ❌ "You may also like" section
- ❌ Related products
- ❌ Recently viewed products
- ❌ Personalized recommendations

#### 13. **Social Login** ❌
- ❌ Google login
- ❌ Facebook login
- ❌ Apple login

#### 14. **Social Sharing** ❌
- ❌ Share product on social media
- ❌ Share order on social media
- ❌ Referral program

#### 15. **Shipping Calculator** ❌
- ❌ Calculate shipping cost before checkout
- ❌ Multiple shipping options
- ❌ Shipping zones

#### 16. **Newsletter & Notifications** ❌
- ❌ Newsletter subscription
- ❌ Email notifications cho order updates
- ❌ SMS notifications
- ❌ Push notifications

#### 17. **Product Tags & Advanced Filters** ⚠️
**Status:** Database có tags nhưng chưa sử dụng đầy đủ
- ⚠️ Tags hiển thị nhưng chưa filter được
- ❌ Filter by tags
- ❌ Filter by multiple criteria
- ❌ Saved filters

#### 18. **Product Variants Enhancement** ⚠️
**Status:** Có colors và sizes nhưng chưa có variant management đầy đủ
- ⚠️ Colors và sizes basic
- ❌ Variant images (different image for each color)
- ❌ Variant pricing (different price for different sizes)
- ❌ Variant stock tracking

#### 19. **Multi-language Support** ❌
- ❌ i18n implementation
- ❌ Language switcher
- ❌ Translated content

#### 20. **SEO Enhancements** ❌
- ❌ Meta tags management
- ❌ Open Graph tags
- ❌ Structured data (JSON-LD)
- ❌ Sitemap generation
- ❌ robots.txt

---

## 📊 TỔNG KẾT THEO CATEGORY

### Authentication & User Management
- ✅ **Hoàn thành:** 80%
- ❌ **Thiếu:** Email service thực tế, Social login, Email verification flow đầy đủ

### Product Management
- ✅ **Hoàn thành:** 70%
- ❌ **Thiếu:** Product reviews submission, Product comparison, Recommendations, Advanced filters

### Shopping Experience
- ✅ **Hoàn thành:** 75%
- ❌ **Thiếu:** Wishlist functionality, Search API integration, Product recommendations

### Order Management
- ✅ **Hoàn thành:** 60%
- ❌ **Thiếu:** Order cancellation, Order tracking, Multiple addresses, Return/Refund

### Payment & Checkout
- ✅ **Hoàn thành:** 40%
- ❌ **Thiếu:** Payment gateway integration, Coupons, Shipping calculator

### Admin Features
- ✅ **Hoàn thành:** 0%
- ❌ **Thiếu:** Toàn bộ admin panel

### Advanced Features
- ✅ **Hoàn thành:** 20%
- ❌ **Thiếu:** Email notifications, SMS notifications, Social sharing, Multi-language

---

## 🎯 KẾ HOẠCH BỔ SUNG (ROADMAP)

### **Phase 1: Essential Features (2-3 tuần)**
1. ✅ **Wishlist System**
   - Backend API + Database
   - Frontend integration
   - Wishlist page

2. ✅ **Product Reviews**
   - Review submission
   - Review display
   - Review moderation

3. ✅ **Search Enhancement**
   - Integrate với backend search API
   - Search results page
   - Search suggestions

4. ✅ **Order Cancellation**
   - Cancel order functionality
   - Order status updates

### **Phase 2: Admin Panel (3-4 tuần)**
1. ✅ **Admin Authentication**
   - Admin login
   - Admin middleware

2. ✅ **Admin Dashboard**
   - Overview stats
   - Recent orders
   - Top products

3. ✅ **Product Management**
   - CRUD operations
   - Image upload
   - Inventory management

4. ✅ **Order Management**
   - View all orders
   - Update order status
   - Order details

5. ✅ **User Management**
   - View users
   - User details
   - User actions

### **Phase 3: Payment & Email (2-3 tuần)**
1. ✅ **Payment Integration**
   - Stripe setup
   - Payment processing
   - Webhook handling

2. ✅ **Email Service**
   - Nodemailer/SendGrid setup
   - Email templates
   - Transactional emails

### **Phase 4: Enhanced Features (3-4 tuần)**
1. ✅ **Address Management**
   - Multiple addresses
   - Address book

2. ✅ **Coupons & Discounts**
   - Coupon system
   - Admin coupon management

3. ✅ **Order Tracking**
   - Tracking numbers
   - Tracking page

4. ✅ **Inventory Alerts**
   - Out of stock handling
   - Low stock alerts

### **Phase 5: Advanced Features (Ongoing)**
1. ✅ **Product Recommendations**
2. ✅ **Social Login**
3. ✅ **Social Sharing**
4. ✅ **Newsletter**
5. ✅ **Multi-language**

---

## 📝 NOTES

### Technical Debt
- ⚠️ Search chỉ hoạt động với local products, cần integrate với API
- ⚠️ Wishlist button có UI nhưng không có functionality
- ⚠️ Email verification có UI nhưng token chỉ log ra console
- ⚠️ Chat widget có UI nhưng chưa có backend
- ⚠️ Rating hiển thị nhưng không có review submission

### Database Schema Gaps
- ❌ `wishlist` table
- ❌ `reviews` table
- ❌ `addresses` table
- ❌ `coupons` table
- ❌ `admin_users` table
- ❌ `order_tracking` table

### API Endpoints Missing
- ❌ Wishlist endpoints
- ❌ Review endpoints
- ❌ Admin endpoints
- ❌ Coupon endpoints
- ❌ Address management endpoints
- ❌ Order cancellation endpoints
- ❌ Payment webhook endpoints

---

## 🚀 RECOMMENDATIONS

### Immediate Actions (Tuần này)
1. Implement Wishlist functionality (UI đã có, chỉ cần backend)
2. Integrate search với backend API
3. Add order cancellation feature

### Short-term (1-2 tháng)
1. Build Admin Panel
2. Implement Product Reviews
3. Setup Email Service

### Medium-term (3-6 tháng)
1. Payment Integration
2. Address Management
3. Coupons System

### Long-term (6+ tháng)
1. Advanced features (recommendations, social login)
2. Multi-language support
3. Performance optimizations

---

**Tổng kết:** Web hiện tại đã có các chức năng core cơ bản cho một e-commerce platform. Để hoàn thiện và production-ready, cần bổ sung các chức năng trong Priority 1 và Priority 2, đặc biệt là Admin Panel và Payment Integration.

