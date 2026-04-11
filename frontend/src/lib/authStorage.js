const AUTH_STORAGE_KEY = 'taskit.auth.session'
const AUTH_STORAGE_EVENT = 'taskit:auth-session-changed'

const isBrowser = typeof window !== 'undefined'

const emitSessionChange = (session) => {
  if (!isBrowser) return

  window.dispatchEvent(
    new CustomEvent(AUTH_STORAGE_EVENT, {
      detail: session,
    }),
  )
}

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  const decoded = atob(normalized + padding)

  return decodeURIComponent(
    Array.from(decoded)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

export const readStoredSession = () => {
  if (!isBrowser) return null

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const writeStoredSession = (session) => {
  if (!isBrowser) return

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  emitSessionChange(session)
}

export const clearStoredSession = () => {
  if (!isBrowser) return

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  emitSessionChange(null)
}

export const parseSessionUser = (session) => {
  if (!session?.accessToken) return null

  try {
    const [, payload] = session.accessToken.split('.')
    const parsed = JSON.parse(decodeBase64Url(payload))

    return {
      id: parsed.sub ?? null,
      email: parsed.email ?? '',
    }
  } catch {
    return null
  }
}

export const subscribeToSession = (listener) => {
  if (!isBrowser) return () => {}

  const handleCustomEvent = (event) => {
    listener(event.detail ?? null)
  }

  const handleStorage = (event) => {
    if (event.key !== AUTH_STORAGE_KEY) return
    listener(readStoredSession())
  }

  window.addEventListener(AUTH_STORAGE_EVENT, handleCustomEvent)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(AUTH_STORAGE_EVENT, handleCustomEvent)
    window.removeEventListener('storage', handleStorage)
  }
}
