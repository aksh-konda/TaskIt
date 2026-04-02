import { createContext, useContext, useMemo, useState } from 'react'
import client from '../api/client'
import { tokenStore } from '../utils/tokenStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(tokenStore.getUser())

  const isAuthenticated = Boolean(user && tokenStore.getAccessToken())

  const login = async ({ email, password }) => {
    const { data } = await client.post('/auth/login', { email, password })
    tokenStore.setSession(data)
    setUser(data.user)
  }

  const signup = async ({ displayName, email, password, timezone }) => {
    const { data } = await client.post('/auth/signup', { displayName, email, password, timezone })
    tokenStore.setSession(data)
    setUser(data.user)
  }

  const logout = async () => {
    const refreshToken = tokenStore.getRefreshToken()
    try {
      await client.post('/auth/logout', { refreshToken })
    } finally {
      tokenStore.clear()
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({ user, setUser, isAuthenticated, login, signup, logout }),
    [user, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
