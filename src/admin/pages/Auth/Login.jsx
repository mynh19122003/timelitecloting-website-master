import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import styles from './AuthLayout.module.css'
import { signIn } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { checkRateLimit, recordFailedAttempt, clearAttempts, getRateLimitMessage } from '../../utils/rateLimiter'

const Login = () => {
  const navigate = useNavigate()
  const { setUser, user } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [rateLimitInfo, setRateLimitInfo] = useState(checkRateLimit())

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true })
    }
  }, [user, navigate])

  // Kiểm tra rate limit định kỳ
  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimitInfo(checkRateLimit())
    }, 1000) // Kiểm tra mỗi giây để cập nhật countdown

    return () => clearInterval(interval)
  }, [])

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) return

    // Kiểm tra rate limit trước khi submit
    const rateLimit = checkRateLimit()
    if (rateLimit.isLocked) {
      setFeedback({
        type: 'error',
        message: `Tài khoản đã bị khóa tạm thời do quá nhiều lần đăng nhập sai. Vui lòng thử lại sau ${rateLimit.remainingMinutes} phút.`
      })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    signIn(form.email, form.password)
      .then((user) => {
        // Xóa attempts khi đăng nhập thành công
        clearAttempts()
        
        if (form.remember) {
          window.localStorage.setItem('fastcart:user', JSON.stringify(user))
        }
        setUser(user)
        setFeedback({ type: 'success', message: `Signed in as ${user.name}` })
        
        // Redirect về trang trước đó hoặc dashboard
        const returnUrl = window.localStorage.getItem('fastcart:return_url')
        if (returnUrl) {
          window.localStorage.removeItem('fastcart:return_url')
          window.setTimeout(() => navigate(returnUrl), 600)
        } else {
          // Sử dụng location.state.from nếu có (từ ProtectedRoute)
          const locationState = window.history?.state?.usr || {}
          const from = locationState.from?.pathname
          window.setTimeout(() => navigate(from || '/admin', { replace: true }), 600)
        }
      })
      .catch((error) => {
        // Ghi lại lần thử thất bại
        recordFailedAttempt()
        setRateLimitInfo(checkRateLimit())
        
        const rateLimitMsg = getRateLimitMessage()
        const errorMsg = error.message || 'Unable to sign in.'
        
        setFeedback({
          type: 'error',
          message: rateLimitMsg ? `${errorMsg} ${rateLimitMsg}` : errorMsg
        })
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <AuthLayout
      title='Sign In'
      subtitle='Manage orders, catalogue, and reports from a single dashboard.'
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor='login-email'>Email</label>
          <input
            id='login-email'
            type='email'
            name='email'
            placeholder='you@company.com'
            value={form.email}
            onChange={handleChange}
            autoComplete='email'
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor='login-password'>Password</label>
          <input
            id='login-password'
            type='password'
            name='password'
            placeholder='Enter your password'
            value={form.password}
            onChange={handleChange}
            autoComplete='current-password'
            required
          />
        </div>
        <div className={styles.actions}>
          <label>
            <input type='checkbox' name='remember' checked={form.remember} onChange={handleChange} />
            Remember me
          </label>
          <Link className={styles.link} to='reset-password'>
            Forgot password?
          </Link>
        </div>
        <button 
          type='submit' 
          className={styles.buttonPrimary} 
          disabled={isSubmitting || rateLimitInfo.isLocked}
        >
          {isSubmitting ? 'Signing in…' : rateLimitInfo.isLocked ? `Locked (${rateLimitInfo.remainingMinutes}m)` : 'Sign in'}
        </button>
      </form>

      {rateLimitInfo.attempts > 0 && !rateLimitInfo.isLocked && (
        <div className={styles.statusMessage} style={{ marginTop: '12px', fontSize: '13px', color: '#f59e0b' }}>
          Cảnh báo: Còn {rateLimitInfo.remainingAttempts} lần thử. Sau {rateLimitInfo.attempts + rateLimitInfo.remainingAttempts} lần thử sai, tài khoản sẽ bị khóa trong 15 phút.
        </div>
      )}

      {feedback && (
        <div
          className={`${styles.statusMessage} ${
            feedback.type === 'success' ? styles.statusSuccess : styles.statusError
          }`}
          role='alert'
          aria-live='assertive'
        >
          {feedback.message}
        </div>
      )}
    </AuthLayout>
  )
}

export default Login
