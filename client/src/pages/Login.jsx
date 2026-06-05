import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      alert(err.message || 'Login failed')
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <br />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <br />
        <button type="submit">Login</button>
      </form>
      <p><Link to="/forgot-password">Forgot password?</Link></p>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  )
}
