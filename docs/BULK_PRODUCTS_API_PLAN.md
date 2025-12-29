# Kế hoạch Build API Bulk Create Products

## 📋 Tổng quan
Xây dựng API endpoint để tạo nhiều sản phẩm cùng lúc từ UI "Add multiple products" trong admin panel.

---

## 🎯 Mục tiêu
1. Tạo endpoint `/admin/products/bulk` để nhận mảng sản phẩm và tạo hàng loạt
2. Xử lý upload ảnh (base64) cho từng sản phẩm
3. Validate dữ liệu trước khi insert vào database
4. Trả về kết quả chi tiết (thành công/thất bại) cho từng sản phẩm
5. Xử lý transaction để đảm bảo tính toàn vẹn dữ liệu

---

## 📦 Cấu trúc Payload từ Frontend

### Request Body Structure
```json
{
  "products": [
    {
      "name": "Summer T-Shirt",
      "description": "Describe the product experience",
      "color": "Crimson",
      "category": "Ao Dai",
      "variant": "Áo Dài Cách Tân",
      "inventory": 100,
      "price": 29.99,
      "status": "published",
      "rating": 4.5,
      "sizes": ["XS", "S", "M", "L", "XL"],
      "tags": ["summer", "casual"],
      "hasVariations": false,
      "optionName": "",
      "optionValues": "",
      "imagePreview": "data:image/png;base64,iVBORw0KG...",  // Base64 của ảnh chính
      "mediaUploads": [
        {
          "id": "image-123",
          "name": "product-image.png",
          "dataUrl": "data:image/png;base64,iVBORw0KG..."  // Base64 của gallery images
        }
      ]
    }
  ]
}
```

### Mapping Frontend → Backend
- `name` → `name`
- `description` → `description`
- `color` → `colors` (array: `["Crimson"]`)
- `category` → `category`
- `variant` → `variant`
- `inventory` → `stock`
- `price` → `price`
- `rating` → `rating`
- `sizes` → `sizes` (JSON array)
- `tags` → `tags` (JSON array)
- `imagePreview` → `image_url` (save as file, return path)
- `mediaUploads` → `gallery` (array of base64, save as files, return paths)

---

## 🔧 Backend Implementation Plan

### 1. **Validation Schema** (`ecommerce-backend/ecommerce-admin-backend-node/src/middleware/validation.js`)
```javascript
const bulkProductCreateSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().max(255).required(),
        description: Joi.string().allow('', null).optional(),
        color: Joi.string().max(128).optional(),
        category: Joi.string().max(64).allow('', null).optional(),
        variant: Joi.string().max(128).allow('', null).optional(),
        inventory: Joi.number().integer().min(0).required(),
        price: Joi.number().required(),
        status: Joi.string().valid('published', 'draft', 'archived').optional(),
        rating: Joi.number().allow(null).optional(),
        sizes: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
        tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
        imagePreview: Joi.string().allow('', null).optional(), // base64
        mediaUploads: Joi.array().items(
          Joi.object({
            id: Joi.string().optional(),
            name: Joi.string().optional(),
            dataUrl: Joi.string().required() // base64
          })
        ).optional()
      })
    )
    .min(1)
    .max(100) // Giới hạn tối đa 100 sản phẩm mỗi lần
    .required()
});
```

### 2. **Route** (`ecommerce-backend/ecommerce-admin-backend-node/src/routes/productsRoutes.js`)
```javascript
// Bulk create products
router.post('/bulk', validate(bulkProductCreateSchema), productsController.bulkCreate);
```

### 3. **Controller** (`ecommerce-backend/ecommerce-admin-backend-node/src/controllers/productsController.js`)
```javascript
async bulkCreate(req, res) {
  try {
    const { products } = req.body || {};
    const result = await productsService.bulkCreateProducts(products);
    return res.status(201).json({
      success: true,
      message: `Created ${result.successCount} product(s), ${result.failedCount} failed`,
      data: result
    });
  } catch (err) {
    console.error('bulk create products failed:', err);
    return res.status(500).json({
      error: 'ERR_BULK_CREATE_PRODUCTS_FAILED',
      message: 'Failed to bulk create products'
    });
  }
}
```

### 4. **Service** (`ecommerce-backend/ecommerce-admin-backend-node/src/services/productsService.js`)
```javascript
async bulkCreateProducts(productsArray) {
  const results = {
    success: [],
    failed: [],
    successCount: 0,
    failedCount: 0
  };

  // Sử dụng transaction để đảm bảo tính toàn vẹn
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    for (let i = 0; i < productsArray.length; i++) {
      const productData = productsArray[i];
      try {
        // 1. Generate product ID
        const productId = await this.resolveProductId(null);

        // 2. Process main image
        let imagePath = null;
        if (productData.imagePreview) {
          imagePath = await this.saveImageForProduct(productId, productData.imagePreview, 'main');
        }

        // 3. Process gallery images
        let galleryJson = null;
        if (productData.mediaUploads && productData.mediaUploads.length > 0) {
          const saved = [];
          for (let idx = 0; idx < productData.mediaUploads.length; idx++) {
            const b64 = productData.mediaUploads[idx].dataUrl;
            const rel = await this.saveImageForProduct(productId, b64, `main_${idx + 2}`);
            if (rel) saved.push(rel);
          }
          galleryJson = JSON.stringify(saved);
        }

        // 4. Normalize data
        const slug = this.generateSlug(productData.name);
        const colors = productData.color ? [productData.color] : [];
        const sizes = this.parseMaybeJson(productData.sizes);
        const tags = this.parseMaybeJson(productData.tags);

        // 5. Insert into database
        const sql = `INSERT INTO products
          (products_id, slug, name, category, variant, short_description, description, price, original_price,
           stock, colors, sizes, image_url, gallery, rating, reviews, tags, is_featured, is_new)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const params = [
          productId,
          slug || null,
          productData.name || null,
          productData.category || null,
          productData.variant || null,
          null, // short_description
          productData.description || null,
          productData.price ?? null,
          null, // original_price
          productData.inventory ?? 0,
          colors ? JSON.stringify(colors) : null,
          sizes ? JSON.stringify(sizes) : null,
          imagePath,
          galleryJson,
          productData.rating ?? null,
          null, // reviews
          tags ? JSON.stringify(tags) : null,
          0, // is_featured
          0  // is_new
        ];

        await connection.execute(sql, params);

        // 6. Fetch created product
        const created = await this.getByIdOrCode(productId);
        results.success.push({
          index: i,
          productId,
          data: created
        });
        results.successCount++;
      } catch (err) {
        console.error(`[BulkCreate] Failed to create product #${i + 1}:`, err);
        results.failed.push({
          index: i,
          productName: productData.name || 'Unknown',
          error: err.message
        });
        results.failedCount++;
        // Tiếp tục xử lý sản phẩm tiếp theo, không rollback toàn bộ
      }
    }

    // Commit transaction nếu có ít nhất 1 sản phẩm thành công
    if (results.successCount > 0) {
      await connection.commit();
    } else {
      await connection.rollback();
    }

    return results;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
```

### 5. **Frontend Service** (`src/admin/services/productsService.js`)
```javascript
export const bulkCreateProducts = async (productsArray) => {
  const payload = {
    products: productsArray.map((product) => ({
      name: product.name,
      description: product.description,
      color: product.color,
      category: product.category,
      variant: product.variant,
      inventory: Number(product.inventory) || 0,
      price: Number(product.price) || 0,
      status: product.status || 'published',
      rating: Number(product.rating) || 0,
      sizes: product.sizes || [],
      tags: product.tags || [],
      imagePreview: product.imagePreview,
      mediaUploads: product.mediaUploads || []
    }))
  };

  try {
    const res = await AdminApi.post('/products/bulk', payload);
    return res?.data?.data || res?.data || {};
  } catch (error) {
    console.error('[bulkCreateProducts] API call failed:', error);
    throw error;
  }
};
```

### 6. **Update Frontend Handler** (`src/admin/pages/Products/AddProduct.jsx`)
```javascript
const handleBulkSave = async () => {
  const normalized = validateBulkProducts();
  if (!normalized) {
    return;
  }

  // Map normalized data to API payload format
  const apiPayload = normalized.map((product) => {
    const bulkProduct = bulkProducts.find((p) => p.id === product.id);
    return {
      name: product.name,
      description: product.description,
      color: product.color,
      category: product.category,
      variant: product.variant,
      inventory: product.inventory,
      price: product.price,
      status: bulkProduct?.status || 'published',
      rating: product.rating,
      sizes: product.sizes,
      tags: product.tags,
      imagePreview: bulkProduct?.imagePreview || '',
      mediaUploads: bulkProduct?.mediaUploads || []
    };
  });

  try {
    setBulkFormError('');
    const result = await bulkCreateProducts(apiPayload);
    
    if (result.failedCount > 0) {
      const failedMessages = result.failed.map(
        (f) => `Product #${f.index + 1} (${f.productName}): ${f.error}`
      );
      setBulkFormError(
        `Created ${result.successCount} product(s). Failed:\n${failedMessages.join('\n')}`
      );
    } else {
      alert(`Successfully created ${result.successCount} product(s)!`);
      navigate('/admin/products');
    }
  } catch (error) {
    console.error('[handleBulkSave] Failed:', error);
    setBulkFormError(
      error?.response?.data?.message || 'Failed to save products. Please try again.'
    );
  }
};
```

---

## 📝 Response Structure

### Success Response (201)
```json
{
  "success": true,
  "message": "Created 5 product(s), 0 failed",
  "data": {
    "success": [
      {
        "index": 0,
        "productId": "PID0001",
        "data": { /* full product object */ }
      }
    ],
    "failed": [],
    "successCount": 5,
    "failedCount": 0
  }
}
```

### Partial Success Response (201)
```json
{
  "success": true,
  "message": "Created 3 product(s), 2 failed",
  "data": {
    "success": [ /* ... */ ],
    "failed": [
      {
        "index": 3,
        "productName": "Product Name",
        "error": "Invalid price format"
      }
    ],
    "successCount": 3,
    "failedCount": 2
  }
}
```

### Error Response (500)
```json
{
  "error": "ERR_BULK_CREATE_PRODUCTS_FAILED",
  "message": "Failed to bulk create products"
}
```

---

## ⚠️ Lưu ý và Giới hạn

1. **Giới hạn số lượng**: Tối đa 100 sản phẩm mỗi lần request (có thể config)
2. **Transaction**: Sử dụng transaction để đảm bảo tính toàn vẹn, nhưng không rollback toàn bộ nếu một số sản phẩm fail
3. **Image Processing**: Xử lý tuần tự từng ảnh để tránh quá tải server
4. **Error Handling**: Mỗi sản phẩm được xử lý độc lập, lỗi ở một sản phẩm không ảnh hưởng đến các sản phẩm khác
5. **Performance**: Với số lượng lớn, có thể cần xử lý bất đồng bộ (async queue) trong tương lai

---

## ✅ Checklist Implementation

- [ ] 1. Tạo validation schema `bulkProductCreateSchema`
- [ ] 2. Thêm route `/admin/products/bulk` (POST)
- [ ] 3. Tạo controller method `bulkCreate`
- [ ] 4. Tạo service method `bulkCreateProducts` với transaction
- [ ] 5. Xử lý upload ảnh cho từng sản phẩm
- [ ] 6. Normalize và insert dữ liệu vào database
- [ ] 7. Tạo frontend service `bulkCreateProducts`
- [ ] 8. Update `handleBulkSave` trong AddProduct.jsx
- [ ] 9. Test với 1 sản phẩm
- [ ] 10. Test với nhiều sản phẩm (5-10)
- [ ] 11. Test với sản phẩm có lỗi validation
- [ ] 12. Test với sản phẩm không có ảnh
- [ ] 13. Test với sản phẩm có nhiều ảnh gallery
- [ ] 14. Test error handling và rollback

---

## 🚀 Thứ tự thực hiện

1. **Backend trước**: Tạo API endpoint và test với Postman/curl
2. **Frontend sau**: Kết nối frontend với API
3. **Testing**: Test đầy đủ các trường hợp
4. **Optimization**: Tối ưu performance nếu cần

---

## 📌 Files cần chỉnh sửa

### Backend
- `ecommerce-backend/ecommerce-admin-backend-node/src/middleware/validation.js` - Thêm schema
- `ecommerce-backend/ecommerce-admin-backend-node/src/routes/productsRoutes.js` - Thêm route
- `ecommerce-backend/ecommerce-admin-backend-node/src/controllers/productsController.js` - Thêm controller
- `ecommerce-backend/ecommerce-admin-backend-node/src/services/productsService.js` - Thêm service method

### Frontend
- `src/admin/services/productsService.js` - Thêm `bulkCreateProducts` function
- `src/admin/pages/Products/AddProduct.jsx` - Update `handleBulkSave`

---

**Bạn có muốn tôi bắt đầu implement theo kế hoạch này không?**

