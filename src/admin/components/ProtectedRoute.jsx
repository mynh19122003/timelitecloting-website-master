import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute - Component để bảo vệ các routes yêu cầu authentication
 * 
 * Nếu user chưa đăng nhập, redirect về trang login
 * Nếu user đã đăng nhập nhưng token không hợp lệ, sẽ được AuthContext xử lý
 */
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Hiển thị loading state trong khi đang kiểm tra authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Đang xác thực...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Nếu chưa đăng nhập, redirect về login và lưu location hiện tại để redirect lại sau khi login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Nếu đã đăng nhập, render children
  return children
}

export default ProtectedRoute










