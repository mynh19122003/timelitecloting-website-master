# TimeLite Clothing - Modern E-Commerce Platform

A robust, full-featured e-commerce solution built with **Next.js 15 (App Router)** and **Node.js Express**. Designed for high performance, scalability, and a seamless user experience.

---

## ⚡ Key Features

### 🛍️ Customer Experience

- **Smart Product Catalog**: Advanced filtering by category, color, size, and price.
- **Dynamic Search**: Real-time product search with instant results.
- **Shopping Cart**: Persistent cart state with easy quantity management.
- **Secure Checkout**: Integrated **Poynt Payment Gateway** (Direct Card Charge) for secure credit/debit card processing.
- **User Accounts**: Profile management, order history, and address book.
- **Guest Checkout**: Seamless purchasing without mandatory registration.
- **Responsive Design**: Fully optimized for Mobile, Tablet, and Desktop.

### 🛡️ Admin Dashboard

- **Dashboard Overview**: Real-time sales analytics and key performance indicators.
- **Order Management**: Track status, view details, and manage shipping.
- **Product Management**: Create, update, and manage inventory with image uploads.
- **User Management**: View and manage customer accounts.
- **Security**: Role-based access control (RBAC).

### 🔧 Technical Highlights

- **Server-Side Rendering (SSR)**: Optimized SEO and fast initial load times.
- **Authentication**: Secure JWT-based auth with `bcrypt` password hashing.
- **Database**: efficient MySQL relational database schema.
- **Containerization**: Full Docker support for ensuring consistent environments.
- **Email Notifications**: Automated transactional emails via `nodemailer`.
- **Internationalization**: Support for global address and phone formats.

---

## 🛠️ Technology Stack

### Frontend

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F05032?style=flat-square&logo=lucide&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-18-43853D?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## 🚀 Getting Started

### 1. Requirements

- Node.js 18+
- Docker Desktop
- Git

### 2. Installation

**Clone the repository:**

```bash
git clone https://github.com/mynh19122003/timelitecloting-website-master.git
cd timelitecloting-website-master
```

**Setup Backend (Docker):**

```bash
cd ecommerce-backend
docker-compose up -d --build
```

**Setup Frontend:**

```bash
# Return to root directory
cd ..
npm install --legacy-peer-deps
npm run dev
```

### 3. Verification

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **Admin API**: http://localhost:3001

---

## 💳 Payment Integration (Poynt)

This project uses a custom **Direct Card Charge** implementation for Poynt:

- **Strategy**: Server-to-Server HTTPS transaction.
- **Security**: Card data is transmitted securely via backend proxy, bypassing client-side tokenization issues.
- **Validation**: Strict validation for Card Number (Luhn algorithm) and Expiry.

---

## 📄 License

This project is licensed under the MIT License.
