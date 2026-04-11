import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'
import {
  clearStoredSession,
  parseSessionUser,
  readStoredSession,
  subscribeToSession,
  writeStoredSession,
} from '../lib/authStorage'
import { AuthContext } from './auth-context'

const normalizeAuthResponse = (data) => ({
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  tokenType: data.tokenType ?? 'Bearer',
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())

  useEffect(() => subscribeToSession(setSession), [])

  const persistSession = (data) => {
    const nextSession = normalizeAuthResponse(data)
    writeStoredSession(nextSession)
    return nextSession
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials, {
        skipAuth: true,
        skipAuthRefresh: true,
      })

      return persistSession(response.data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to sign in'))
    }
  }

  const register = async (details) => {
    try {
      const response = await api.post('/auth/register', details, {
        skipAuth: true,
        skipAuthRefresh: true,
      })

      return persistSession(response.data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to create account'))
    }
  }

  const logout = async () => {
    const currentSession = readStoredSession()

    try {
      if (currentSession?.refreshToken) {
        await api.post(
          '/auth/logout',
          { refreshToken: currentSession.refreshToken },
          {
            skipAuthRefresh: true,
          },
        )
      }
    } catch {
      // Best-effort logout; local session must still be cleared.
    } finally {
      clearStoredSession()
    }
  }

  const value = {
    currentUser: parseSessionUser(session),
    isAuthenticated: Boolean(session?.accessToken),
    login,
    logout,
    register,
    session,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
