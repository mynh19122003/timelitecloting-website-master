# Product Data Refresh Plan

## 1. Scope
- Thay thế toàn bộ 4 bản ghi hiện tại (`PID00001` → `PID00004`) bằng dataset mới theo thư mục ảnh trong `push-api/`.
- Giai đoạn 1 tập trung vào `push-api/anh_ao_dai` (50 ảnh). Các thư mục còn lại đã được cấu hình preset nhưng chưa kích hoạt.

## 2. Chuẩn bị
1. **Sao lưu dữ liệu hiện tại**
   ```bash
   curl http://localhost:3002/api/products > backups/products-before.json
   ```
2. **Chụp schema/structure**: `mysqldump --no-data ecommerce_db products > backups/products-schema.sql`
3. **Đảm bảo env**: sử dụng biến trong `ecommerce-backend/.env` (DB_HOST, DB_USER, DB_PASSWORD,...).

## 3. Xoá dữ liệu cũ
> Chỉ thực hiện khi dataset mới đã sẵn sàng import.

```sql
USE ecommerce_db;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE products;
SET FOREIGN_KEY_CHECKS = 1;
```

Nếu cần giữ lại `id` auto increment nhỏ, chạy thêm `ALTER TABLE products AUTO_INCREMENT = 1;`.

## 4. Sinh manifest từ ảnh
1. Cập nhật preset trong `push-api/config/folder-presets.json`.
2. Chạy script:
   ```bash
   node ./scripts/generate-product-manifest.mjs anh_ao_dai
   ```
3. Kết quả: `push-api/manifests/anh_ao_dai.manifest.json`.

File manifest chứa đủ thông tin để import (`products_id`, `slug`, metadata, đường dẫn ảnh nguồn → đích).

## 5. Chuẩn bị asset
1. Tạo thư mục đích cho từng sản phẩm: `storage/products/<products_id>/`.
2. Chuyển đổi ảnh:
   - Chuẩn hóa sang `.webp` theo giá trị `asset_plan.main_name`.
   - Lưu ý kích thước tối đa 2000px, nén lossless nhẹ.
3. Cập nhật `planned_output` trong manifest nếu cần tuỳ biến đường dẫn.

## 6. Import dữ liệu mới
### 6.1. Tạo script insert (đề xuất)
- Viết Node script đọc manifest rồi chạy batch insert:
  ```bash
  node ./scripts/import-products-from-manifest.mjs push-api/manifests/anh_ao_dai.manifest.json
  ```
- Script sẽ:
  1. Sinh câu `INSERT INTO products (...) VALUES ...`.
  2. Đảm bảo các trường JSON (`colors`, `sizes`, `gallery`, `tags`) được stringify (`JSON.stringify`).
  3. Đặt `created_at = NOW()`.

### 6.2. Lệnh SQL mẫu
```sql
INSERT INTO products (
  products_id, slug, name, category, variant,
  short_description, description, price, original_price,
  stock, colors, sizes, image_url, gallery, rating,
  reviews, tags, is_featured, is_new
)
VALUES
  -- dữ liệu map từ manifest
  ('PID10001', 'ao-dai-studio-001', 'Ao Dai Studio 001', 'Ao Dai', 'Studio Collection',
   'Limited edition ...', 'Each Ao Dai Studio ...', 3200000, 3800000,
   25, '["Ivory","Crimson","Emerald","Onyx"]', '["XS","S","M","L","XL"]',
   'PID10001/main.webp', '[]', 4.8, 12, '["ao-dai","studio","limited"]', 0, 1
  ),
  (...);
```

## 7. Kiểm thử
1. `curl http://localhost:3002/api/products?limit=5`
2. Kiểm tra `slug`, `image_url`, `colors/sizes` trả về đúng.
3. Load trang Shop/Detail để đảm bảo frontend parse JSON arrays bình thường.

## 8. Tiếp nối
- Khi hoàn tất `anh_ao_dai`, bật preset các thư mục khác (`enabled: true`) rồi chạy lại script.
- Chuẩn bị automation import + upload để có pipeline thống nhất.

