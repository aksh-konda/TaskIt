import axios from 'axios'
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from './authStorage'

export const api = axios.create({
  headers: {
    Accept: 'application/json',
  },
})

let refreshPromise = null

const refreshAccessToken = async () => {
  const session = readStoredSession()

  if (!session?.refreshToken) {
    clearStoredSession()
    throw new Error('Session expired')
  }

  if (!refreshPromise) {
    refreshPromise = api
      .post(
        '/auth/refresh',
        { refreshToken: session.refreshToken },
        {
          skipAuth: true,
          skipAuthRefresh: true,
        },
      )
      .then((response) => {
        const nextSession = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          tokenType: response.data.tokenType ?? 'Bearer',
        }

        writeStoredSession(nextSession)
        return nextSession
      })
      .catch((error) => {
        clearStoredSession()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config
  }

  const session = readStoredSession()

  if (session?.accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      !originalRequest ||
      originalRequest.skipAuthRefresh ||
      originalRequest._retry ||
      error.response?.status !== 401
    ) {
      throw error
    }

    originalRequest._retry = true

    const session = await refreshAccessToken()
    originalRequest.headers = originalRequest.headers ?? {}
    originalRequest.headers.Authorization = `Bearer ${session.accessToken}`
    return api(originalRequest)
  },
)

export const getApiErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  (error?.request && !error?.response
    ? 'Cannot reach the backend. Start the Docker dev stack with make dev and try again.'
    : error?.message || fallbackMessage)
