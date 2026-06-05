import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await signup(email, password)
      navigate('/dashboard')
    } catch (err) {
      alert(err.message || 'Signup failed')
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Sign up</h2>
      <form onSubmit={submit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <br />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <br />
        <button type="submit">Create Account</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}
