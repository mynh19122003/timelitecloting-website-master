import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Orders from './pages/Orders/Orders'
import OrderDetail from './pages/Orders/OrderDetail'
import Products from './pages/Products/Products'
import AddProduct from './pages/Products/AddProduct'
import Customers from './pages/Customers/Customers'
import AddCustomer from './pages/Customers/AddCustomer'
import EditCustomer from './pages/Customers/EditCustomer'
import Reports from './pages/Reports'
import Coupons from './pages/Coupons/Coupons'
import AddCoupon from './pages/Coupons/AddCoupon'
import CouponDetail from './pages/Coupons/CouponDetail'
import Settings from './pages/Settings'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import ResetPassword from './pages/Auth/ResetPassword'
import ConfirmEmail from './pages/Auth/ConfirmEmail'
import CheckEmail from './pages/Auth/CheckEmail'

const AdminApp = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes - không cần authentication */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="confirm-email" element={<ConfirmEmail />} />
        <Route path="check-email" element={<CheckEmail />} />

        {/* Protected routes - yêu cầu authentication */}
        <Route
          path=""
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/:id/edit" element={<AddProduct />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<AddCustomer />} />
          <Route path="customers/:id/edit" element={<EditCustomer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="coupons/new" element={<AddCoupon />} />
          <Route path="coupons/:couponId" element={<CouponDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default AdminApp

