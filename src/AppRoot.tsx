"use client";

import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Layout } from "./components/layout/Layout";
import { ToastContainer } from "./components/ui/Toast";
import { HomePage } from "./views/HomePage";
import { ShopPage } from "./views/ShopPage";
import { ProductDetailPage } from "./views/ProductDetailPage";
import { CartPage } from "./views/CartPage";
import { CheckoutPage } from "./views/CheckoutPage";
import { ContactPage } from "./views/ContactPage";
import { AboutPage } from "./views/AboutPage";
import { LoginPage } from "./views/LoginPage";
import { RegisterPage } from "./views/RegisterPage";
import { ProfilePage } from "./views/ProfilePage";
import { ForgotPasswordPage } from "./views/ForgotPasswordPage";
import { ResetPasswordPage } from "./views/ResetPasswordPage";
import { VerifyEmailPage } from "./views/VerifyEmailPage";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import "./utils/demo"; // Import demo utilities for testing
import AdminApp from "./admin/AdminApp";

export default function AppRoot() {
  // Site shell that renders public pages with storefront header/footer
  const SiteLayout = () => (
    <Layout>
      <Outlet />
    </Layout>
  );

  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <ToastContainer />
            <Routes>
              {/* Public storefront wrapped by site layout */}
              <Route element={<SiteLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Route>

              {/* Admin dashboard - NO storefront layout */}
              <Route path="/admin/*" element={<AdminApp />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
