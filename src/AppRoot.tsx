"use client";

import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { I18nProvider } from "./context/I18nContext";
import { Layout } from "./components/layout/Layout";
import { ToastContainer } from "./components/ui/Toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollToTop } from "./components/layout/ScrollToTop";

const HomePage = lazy(() => import("./views/HomePage").then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import("./views/ShopPage").then(m => ({ default: m.ShopPage })));
const ProductsPage = lazy(() => import("./views/ProductsPage").then(m => ({ default: m.default })));
const ProductDetailPage = lazy(() => import("./views/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import("./views/CartPage").then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("./views/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const LoginPage = lazy(() => import("./views/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./views/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import("./views/ProfilePage").then(m => ({ default: m.ProfilePage })));
const ForgotPasswordPage = lazy(() => import("./views/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./views/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import("./views/VerifyEmailPage").then(m => ({ default: m.VerifyEmailPage })));
const NotFoundPage = lazy(() => import("./views/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const AdminApp = lazy(() => import("./admin/AdminApp").then(m => ({ default: m.default })));

// Loading component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      <p className="mt-4 text-sm text-gray-600">Đang tải...</p>
    </div>
  </div>
);

if (process.env.NODE_ENV === 'development') {
  import("./utils/demo").catch(() => {});
}

export default function AppRoot() {
  const DefaultLayout = () => (
    <Layout>
      <Outlet />
    </Layout>
  );

  const HomepageLayout = () => (
    <Layout showNavbar={false}>
      <Outlet />
    </Layout>
  );

  return (
    <ErrorBoundary>
      <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <ToastContainer />
              <Routes>
                <Route element={<HomepageLayout />}>
                  <Route path="/" element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
                </Route>

                <Route element={<DefaultLayout />}>
                  <Route path="/shop" element={<Suspense fallback={<PageLoader />}><ShopPage /></Suspense>} />
                  <Route path="/products" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
                  <Route path="/product/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
                  <Route path="/cart" element={<Suspense fallback={<PageLoader />}><CartPage /></Suspense>} />
                  <Route path="/checkout" element={<Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>} />
                  <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
                  <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
                  <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
                  <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
                  <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
                  <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>} />
                  <Route path="/404" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
                </Route>

                <Route path="/admin/*" element={<Suspense fallback={<PageLoader />}><AdminApp /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
