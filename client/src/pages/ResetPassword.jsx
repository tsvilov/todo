import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [params] = useSearchParams()
  const token = params.get('token')
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!token) return alert('Missing token')
    try {
      await resetPassword(token, password)
      navigate('/login')
    } catch (err) {
      alert(err.message || 'Reset failed')
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input placeholder="new password" value={password} onChange={e=>setPassword(e.target.value)} />
        <br />
        <button type="submit">Reset</button>
      </form>
    </div>
  )
}
