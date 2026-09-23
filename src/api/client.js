const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
).replace(/\/+$/, '')

const TOKEN_KEY = 'towme_admin_token'
const USER_KEY = 'towme_admin_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const storeSession = (user) => {
  localStorage.setItem(TOKEN_KEY, user.accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export class ApiError extends Error {
  constructor(message, status, retryAfterSeconds = 0) {
    super(message)
    this.status = status
    /** Seconds until a rate-limited endpoint accepts requests again. */
    this.retryAfterSeconds = retryAfterSeconds
  }
}

/** Fired when the server rejects our token so the app can bounce to login. */
const onUnauthorized = new Set()
export const subscribeUnauthorized = (handler) => {
  onUnauthorized.add(handler)
  return () => onUnauthorized.delete(handler)
}

async function request(path, { method = 'GET', body, query } = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  const token = getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0)
  }

  if (response.status === 401 || response.status === 403) {
    // A 403 on an admin-only route means the session is no longer valid.
    if (getToken()) onUnauthorized.forEach((handler) => handler())
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // Some errors come back without a JSON body.
  }

  if (!response.ok || payload?.success === false) {
    const headerRetry = Number(response.headers.get('Retry-After'))
    const retryAfter =
      payload?.retryAfterSeconds ??
      (Number.isFinite(headerRetry) ? headerRetry : 0)
    throw new ApiError(
      payload?.message || `Request failed (${response.status})`,
      response.status,
      Number(retryAfter) || 0,
    )
  }

  return payload
}

export const api = {
  login: (email, password) =>
    request('/auth/admin/login', { method: 'POST', body: { email, password } }),

  dashboard: () => request('/analytics/dashboard'),
  financials: (query) => request('/analytics/financials', { query }),

  drivers: (query) => request('/drivers', { query }),
  driver: (id) => request(`/drivers/${id}`),
  setDriverApproval: (id, approved, reason) =>
    request(`/drivers/${id}/approval`, {
      method: 'PATCH',
      body: { approved, reason },
    }),
  toggleDriverBlock: (id) =>
    request(`/drivers/${id}/toggle-block`, { method: 'PATCH' }),

  trips: (query) => request('/trips', { query }),
  trip: (id) => request(`/trips/${id}`),
  adminCancelTrip: (id, reason) =>
    request(`/trips/${id}/admin-cancel`, { method: 'POST', body: { reason } }),
  assignDriver: (id, driverId) =>
    request(`/trips/${id}/assign-driver`, {
      method: 'POST',
      body: { driverId },
    }),

  customers: (query) => request('/customers', { query }),
  toggleCustomerBlock: (id) =>
    request(`/customers/${id}/toggle-block`, { method: 'PATCH' }),
  toggleCustomerVip: (id) =>
    request(`/customers/${id}/toggle-vip`, { method: 'PATCH' }),

  tickets: (query) => request('/support', { query }),
  ticket: (id) => request(`/support/${id}`),
  replyToTicket: (id, content) =>
    request(`/support/${id}/reply`, { method: 'POST', body: { content } }),
  setTicketStatus: (id, status) =>
    request(`/support/${id}/status`, { method: 'PATCH', body: { status } }),

  setDriverPayment: (driverId, status) =>
    request(`/analytics/financials/driver/${driverId}/payment`, {
      method: 'PATCH',
      body: { status },
    }),
}

export { BASE_URL }
