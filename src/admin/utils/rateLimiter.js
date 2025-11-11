/**
 * Rate Limiter - Bảo vệ chống brute force attacks
 * Sử dụng localStorage để lưu trữ attempts (client-side)
 * Lưu ý: Đây chỉ là lớp bảo vệ cơ bản, backend cũng cần có rate limiting
 */

const MAX_ATTEMPTS = 5 // Số lần thử tối đa
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 phút
const ATTEMPT_WINDOW = 5 * 60 * 1000 // 5 phút để reset attempts

const STORAGE_KEY = 'fastcart:login_attempts'
const LOCKOUT_KEY = 'fastcart:login_lockout'

/**
 * Lấy thông tin login attempts
 * @returns {object} - { attempts: number, firstAttempt: number, lockedUntil: number | null }
 */
const getAttemptInfo = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const lockout = window.localStorage.getItem(LOCKOUT_KEY)
    
    if (!stored) {
      return { attempts: 0, firstAttempt: null, lockedUntil: null }
    }

    const data = JSON.parse(stored)
    const lockedUntil = lockout ? parseInt(lockout, 10) : null
    
    // Kiểm tra nếu đã hết thời gian lockout
    if (lockedUntil && Date.now() >= lockedUntil) {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(LOCKOUT_KEY)
      return { attempts: 0, firstAttempt: null, lockedUntil: null }
    }

    // Kiểm tra nếu đã hết thời gian window (reset attempts)
    if (data.firstAttempt && Date.now() - data.firstAttempt >= ATTEMPT_WINDOW) {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(LOCKOUT_KEY)
      return { attempts: 0, firstAttempt: null, lockedUntil: null }
    }

    return {
      attempts: data.attempts || 0,
      firstAttempt: data.firstAttempt || null,
      lockedUntil
    }
  } catch (error) {
    console.error('[RateLimiter] Error reading attempts:', error)
    return { attempts: 0, firstAttempt: null, lockedUntil: null }
  }
}

/**
 * Ghi lại một lần thử đăng nhập thất bại
 */
export const recordFailedAttempt = () => {
  try {
    const info = getAttemptInfo()
    
    // Nếu đang bị lockout, không tăng attempts
    if (info.lockedUntil && Date.now() < info.lockedUntil) {
      return
    }

    const newAttempts = info.attempts + 1
    const firstAttempt = info.firstAttempt || Date.now()

    // Nếu đạt max attempts, lock account
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION
      window.localStorage.setItem(LOCKOUT_KEY, lockedUntil.toString())
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        attempts: newAttempts,
        firstAttempt
      }))
      return
    }

    // Lưu attempts
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      attempts: newAttempts,
      firstAttempt
    }))
  } catch (error) {
    console.error('[RateLimiter] Error recording attempt:', error)
  }
}

/**
 * Xóa attempts khi đăng nhập thành công
 */
export const clearAttempts = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(LOCKOUT_KEY)
  } catch (error) {
    console.error('[RateLimiter] Error clearing attempts:', error)
  }
}

/**
 * Kiểm tra xem có bị lockout không
 * @returns {object} - { isLocked: boolean, remainingTime: number | null, attempts: number }
 */
export const checkRateLimit = () => {
  const info = getAttemptInfo()
  
  if (info.lockedUntil && Date.now() < info.lockedUntil) {
    const remainingTime = info.lockedUntil - Date.now()
    const remainingMinutes = Math.ceil(remainingTime / (60 * 1000))
    return {
      isLocked: true,
      remainingTime,
      remainingMinutes,
      attempts: info.attempts
    }
  }

  return {
    isLocked: false,
    remainingTime: null,
    remainingMinutes: null,
    attempts: info.attempts,
    remainingAttempts: MAX_ATTEMPTS - info.attempts
  }
}

/**
 * Lấy thông báo lỗi rate limit
 * @returns {string | null}
 */
export const getRateLimitMessage = () => {
  const check = checkRateLimit()
  
  if (check.isLocked) {
    return `Tài khoản đã bị khóa tạm thời do quá nhiều lần đăng nhập sai. Vui lòng thử lại sau ${check.remainingMinutes} phút.`
  }

  if (check.attempts > 0) {
    return `Còn ${check.remainingAttempts} lần thử. Sau ${MAX_ATTEMPTS} lần thử sai, tài khoản sẽ bị khóa trong 15 phút.`
  }

  return null
}










