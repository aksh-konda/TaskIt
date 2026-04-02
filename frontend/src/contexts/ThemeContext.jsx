import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'taskit.theme'

const themes = {
  'graphite-cyan': {
    '--bg': '#0a1118',
    '--surface': '#111b24',
    '--surface-2': '#162431',
    '--text': '#e7eef5',
    '--muted': '#8ea1b3',
    '--accent': '#14b8c8',
    '--accent-soft': '#0d8f9b',
    '--danger': '#fb7185',
    '--success': '#22c55e',
    '--warning': '#f59e0b',
  },
  'charcoal-emerald': {
    '--bg': '#0e1210',
    '--surface': '#151d19',
    '--surface-2': '#1d2923',
    '--text': '#edf6f0',
    '--muted': '#96ab9f',
    '--accent': '#10b981',
    '--accent-soft': '#0f8f65',
    '--danger': '#f87171',
    '--success': '#34d399',
    '--warning': '#fbbf24',
  },
  'midnight-amber': {
    '--bg': '#13131a',
    '--surface': '#1b1d28',
    '--surface-2': '#25283a',
    '--text': '#f2f2f5',
    '--muted': '#a2a5b5',
    '--accent': '#f59e0b',
    '--accent-soft': '#d97706',
    '--danger': '#f43f5e',
    '--success': '#22c55e',
    '--warning': '#fbbf24',
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(localStorage.getItem(THEME_KEY) || 'graphite-cyan')

  useEffect(() => {
    const vars = themes[themeId] || themes['graphite-cyan']
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v)
    })
    localStorage.setItem(THEME_KEY, themeId)
  }, [themeId])

  const value = useMemo(() => ({ themeId, setThemeId, themes: Object.keys(themes) }), [themeId])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
