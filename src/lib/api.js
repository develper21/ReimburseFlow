// Resilient API base URL resolver (supports relative proxy, Render URL with/without /api, trailing slashes)
const formatApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim()
  if (!envUrl) return '/api'
  const trimmed = envUrl.replace(/\/+$/, '')
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const API_BASE_URL = formatApiBaseUrl()

export const getToken = () => localStorage.getItem('reimburseflow_token')
export const setToken = (token) => localStorage.setItem('reimburseflow_token', token)
export const removeToken = () => localStorage.removeItem('reimburseflow_token')

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken()
  const headers = {
    ...options.headers
  }

  // Set Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Set JSON Content-Type if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    const contentType = response.headers.get('content-type')
    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === 'object' && data.message
          ? data.message
          : `Request failed with status ${response.status}`
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error.message)
    throw error
  }
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options
    }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options
    }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: 'DELETE', ...options })
}
