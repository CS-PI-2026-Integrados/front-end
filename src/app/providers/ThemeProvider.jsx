import { useState, useLayoutEffect } from 'react'
import { ThemeContext } from '@/shared/theme/themeContext'

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false

    const savedTheme = localStorage.getItem('theme')

    return savedTheme === 'dark'
  })

  useLayoutEffect(() => {
    const htmlElement = document.documentElement
    htmlElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newState = !prev
      localStorage.setItem('theme', newState ? 'dark' : 'light')
      return newState
    })
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
  )
}
