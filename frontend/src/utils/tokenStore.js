const ACCESS_KEY = 'taskit.accessToken'
const REFRESH_KEY = 'taskit.refreshToken'
const USER_KEY = 'taskit.user'

export const tokenStore = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY)
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },
  setSession({ accessToken, refreshToken, user }) {
    localStorage.setItem(ACCESS_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
