# 📚 Documentation Directory

Tất cả các file documentation (.md) của project được tổ chức trong thư mục này.

## 📁 Cấu trúc thư mục

```
docs/
├── README.md                    # File này
├── frontend/                    # Frontend documentation
│   └── ROUTES_GUIDE.md         # Hướng dẫn routes configuration
├── backend/                     # Backend documentation
│   ├── README.md               # Backend overview
│   ├── PHP_BACKEND_SUMMARY.md
│   ├── SETUP_GUIDE.md
│   ├── DOCKER_SETUP_README.md
│   └── ...
├── deployment/                  # Deployment guides
│   ├── DEPLOY_GUIDE.md
│   ├── DEPLOY_GUIDE_VPS.md
│   └── README-VPS.md
├── components/                   # Component documentation
│   ├── ChatWidget_README.md
│   ├── PhoneInput_QUICK_START.md
│   └── PhoneInput_VISUAL_GUIDE.md
├── testing/                     # Testing guides
│   ├── test-scripts_README.md
│   └── POSTMAN_TEST_GUIDE.md
└── [other root docs]           # Các file docs khác ở root level
```

## 📝 Quy tắc

**QUAN TRỌNG:** Khi tạo file .md mới, mặc định đặt vào thư mục `docs/` với cấu trúc phù hợp:

- **Frontend docs** → `docs/frontend/`
- **Backend docs** → `docs/backend/`
- **Deployment docs** → `docs/deployment/`
- **Component docs** → `docs/components/`
- **Testing docs** → `docs/testing/`
- **General docs** → `docs/` (root level)

## 🔍 Tìm kiếm documentation

### Frontend
- [Routes Configuration Guide](frontend/ROUTES_GUIDE.md)

### Backend
- [Backend README](backend/README.md)
- [Setup Guide](backend/SETUP_GUIDE.md)
- [Docker Setup](backend/DOCKER_SETUP_README.md)

### Deployment
- [Deploy Guide](deployment/DEPLOY_GUIDE.md)
- [VPS Deploy Guide](deployment/DEPLOY_GUIDE_VPS.md)

### Components
- [Chat Widget](components/ChatWidget_README.md)
- [Phone Input Quick Start](components/PhoneInput_QUICK_START.md)
- [Phone Input Visual Guide](components/PhoneInput_VISUAL_GUIDE.md)

### Testing
- [Test Scripts](testing/test-scripts_README.md)
- [Postman Guide](testing/POSTMAN_TEST_GUIDE.md)

## 📌 Lưu ý

- **File `README.md` ở root của project được giữ lại** để làm entry point
- **Tất cả các file .md khác đã được di chuyển vào `docs/`** với cấu trúc phân loại rõ ràng
- **Quy tắc mặc định:** Khi tạo file .md mới, luôn đặt vào thư mục `docs/` với subdirectory phù hợp
- Cấu trúc này giúp dễ dàng tìm kiếm và quản lý documentation
- Các file trong `node_modules/` không được di chuyển (giữ nguyên)

## ✅ Đã hoàn thành

Tất cả các file .md đã được tổ chức lại vào thư mục `docs/` với cấu trúc:
- ✅ Frontend documentation → `docs/frontend/`
- ✅ Backend documentation → `docs/backend/`
- ✅ Deployment guides → `docs/deployment/`
- ✅ Component docs → `docs/components/`
- ✅ Testing guides → `docs/testing/`
- ✅ General docs → `docs/` (root level)
