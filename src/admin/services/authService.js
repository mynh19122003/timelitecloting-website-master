import api from '../api/client'

const AUTH_LOGIN = '/auth/login'
const AUTH_ME = '/auth/me'
const AUTH_PROFILE = '/auth/profile'

const normalizeAdmin = (raw = {}, fallbackEmail = '') => ({
  id: raw.id ?? raw.admin_id ?? raw.user_id ?? null,
  name: raw.name ?? raw.admin_name ?? raw.fullName ?? raw.username ?? 'User',
  email: raw.email ?? raw.admin_email ?? fallbackEmail,
  role: raw.role ?? raw.admin_role ?? 'admin',
  status: raw.status ?? raw.admin_status ?? raw.state ?? 'active',
  created_at: raw.created_at ?? raw.createdAt ?? undefined,
  updated_at: raw.updated_at ?? raw.updatedAt ?? undefined
})

// Real API sign in
export const signIn = async (email, password) => {
  const res = await api.post(AUTH_LOGIN, { email, password }).catch((err) => {
    const message = err?.response?.data?.message || err?.message || 'Unable to sign in.'
    throw new Error(message)
  })

  const payload = res?.data ?? {}
  const data = payload?.data ?? payload ?? {}

  const token = data?.token ?? payload?.token
  if (token) window.localStorage.setItem('fastcart:token', token)

  // Dev-only: log nơi lưu token sau đăng nhập (JWT cho người dùng/admin)
  if (import.meta?.env?.DEV) {
    try {
      const saved = window.localStorage.getItem('fastcart:token')
      const masked = typeof saved === 'string' && saved.length > 12
        ? `${saved.slice(0, 6)}…${saved.slice(-6)}`
        : saved
      // eslint-disable-next-line no-console
      console.info('[DEBUG] Saved login token to localStorage key fastcart:token:', masked || '(empty)')
    } catch (_) {
      // ignore
    }
  }

  const rawUser = data?.user ?? data?.admin ?? data ?? {}
  const user = normalizeAdmin(rawUser, email)

  return user
}

export const fetchMe = async () => {
  const res = await api.get(AUTH_ME).catch((err) => {
    const message = err?.response?.data?.message || err?.message || 'Unable to fetch current user.'
    throw new Error(message)
  })

  const payload = res?.data ?? {}
  const data = payload?.data ?? payload ?? {}
  const rawUser = data?.user ?? data?.admin ?? data ?? {}
  return normalizeAdmin(rawUser)
}

export const getProfile = async () => {
  // Align GET profile with backend: use /auth/me
  const res = await api.get(AUTH_ME).catch((err) => {
    const message = err?.response?.data?.message || err?.message || 'Unable to fetch profile.'
    throw new Error(message)
  })

  const payload = res?.data ?? {}
  const data = payload?.data ?? payload ?? {}
  const rawUser = data?.user ?? data?.admin ?? data ?? {}
  return normalizeAdmin(rawUser)
}

export const updateProfile = async ({ name }) => {
  const res = await api.put(AUTH_PROFILE, { name }).catch((err) => {
    const message = err?.response?.data?.message || err?.message || 'Unable to update profile.'
    throw new Error(message)
  })

  const payload = res?.data ?? {}
  const data = payload?.data ?? payload ?? {}
  const rawUser = data?.user ?? data?.admin ?? data ?? {}
  return normalizeAdmin(rawUser)
}

export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await api
    .put('/auth/password', { currentPassword, newPassword })
    .catch((err) => {
      const message = err?.response?.data?.message || err?.message || 'Unable to change password.'
      throw new Error(message)
    })

  return res?.data ?? { success: true }
}

export const clearSession = () => {
  try {
    window.localStorage.removeItem('fastcart:token')
    window.localStorage.removeItem('fastcart:user')
  } catch (_) {
    // no-op
  }
}
