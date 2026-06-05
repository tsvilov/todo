import React from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

function AdminPanel() {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <div>Access denied</div>
  return <div style={{padding:20}}>Admin area — manage users and roles here.</div>
}

export default function Admin() {
  return (
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  )
}
