import React, { createContext, useEffect, useState } from 'react'
import api from '../api/axios'

export const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // restore session by calling /auth/me which reads http-only cookie
    const init = async () => {
      try {
        const res = await api.get('/api/auth/me')
        setUser(res.data.user || null)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email, password) => {
    try {
      await api.post('/api/auth/login', { email, password })
      const res = await api.get('/api/auth/me')
      setUser(res.data.user || null)
      return res.data
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed'
      throw new Error(message)
    }
  }

  const signup = async (email, password) => {
    try {
      await api.post('/api/auth/signup', { email, password })
      const me = await api.get('/api/auth/me')
      setUser(me.data.user || null)
      return me.data
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Signup failed'
      throw new Error(message)
    }
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    setUser(null)
  }

  const forgotPassword = async (email) => {
    try {
      await api.post('/api/auth/forgot', { email })
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Forgot password request failed'
      throw new Error(message)
    }
  }

  const resetPassword = async (token, password) => {
    try {
      await api.post('/api/auth/reset', { token, password })
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Reset password request failed'
      throw new Error(message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}
