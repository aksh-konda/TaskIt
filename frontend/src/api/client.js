import axios from 'axios'
import { tokenStore } from '../utils/tokenStore'

const client = axios.create({
  baseURL: '/api/v1',
})

client.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401 || error.config._retry) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      tokenStore.clear()
      return Promise.reject(error)
    }

    try {
      error.config._retry = true
      const refresh = await axios.post('/api/v1/auth/refresh', { refreshToken })
      tokenStore.setSession(refresh.data)
      error.config.headers.Authorization = `Bearer ${refresh.data.accessToken}`
      return client.request(error.config)
    } catch (refreshError) {
      tokenStore.clear()
      return Promise.reject(refreshError)
    }
  },
)

export default client
