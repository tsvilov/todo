import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div style={{padding:20}}>
      <h2>Dashboard</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
