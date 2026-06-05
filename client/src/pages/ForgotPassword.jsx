import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const { forgotPassword } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await forgotPassword(email)
      alert('If that account exists, a reset email was sent.')
    } catch (err) {
      alert(err.message || 'Failed')
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <br />
        <button type="submit">Send reset email</button>
      </form>
    </div>
  )
}
