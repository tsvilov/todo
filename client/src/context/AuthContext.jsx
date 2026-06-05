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
    // server sets httpOnly cookies; client doesn't store tokens
    await api.post('/api/auth/login', { email, password })
    const res = await api.get('/api/auth/me')
    setUser(res.data.user || null)
    return res.data
  }

  const signup = async (email, password) => {
    await api.post('/api/auth/signup', { email, password })
    // after signup, optionally log the user in
    const res = await api.post('/api/auth/login', { email, password })
    const me = await api.get('/api/auth/me')
    setUser(me.data.user || null)
    return me.data
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    setUser(null)
  }

  const forgotPassword = async (email) => {
    await api.post('/api/auth/forgot', { email })
  }

  const resetPassword = async (token, password) => {
    await api.post('/api/auth/reset', { token, password })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}
