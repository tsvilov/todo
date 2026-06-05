const { supabaseAdmin, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = require('../config/supabase')
const fetch = global.fetch
const { createResetToken, verifyResetToken } = require('../services/tokenService')
const { sendResetEmail } = require('../services/emailService')

const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'

async function fetchSupabaseToken(email, password) {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ email, password })
  })
  const json = await resp.json()
  if (!resp.ok) {
    const error = json.error || json.msg || json.message || 'Invalid login credentials'
    const status = resp.status || 400
    const err = new Error(error)
    err.status = status
    err.body = json
    throw err
  }
  return json
}

function setAuthCookies(res, json) {
  const maxAge = (json.expires_in || 3600) * 1000
  res.cookie('access_token', json.access_token, { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax', maxAge })
  if (json.refresh_token) {
    res.cookie('refresh_token', json.refresh_token, { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })
  }
}

async function signup(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase configuration is missing' })
    }

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ email, password, email_confirm: true })
    })

    const json = await resp.json()
    if (!resp.ok) {
      console.error('Supabase admin createUser failed:', resp.status, json)
      return res.status(resp.status).json({ error: json.error || json.msg || json.message || 'Unable to create user' })
    }

    const tokenJson = await fetchSupabaseToken(email, password)
    setAuthCookies(res, tokenJson)
    const { data: userData } = await supabaseAdmin.auth.getUser(tokenJson.access_token)
    res.json({ user: userData.user })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, details: err.body })
    }
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase configuration is missing' })
    }

    const json = await fetchSupabaseToken(email, password)
    setAuthCookies(res, json)

    const { data: userData } = await supabaseAdmin.auth.getUser(json.access_token)
    res.json({ user: userData.user })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, details: err.body })
    }
    next(err)
  }
}

async function me(req, res, next) {
  try {
    // read access token from cookie
    const token = req.cookies?.access_token
    if (!token) return res.json({ user: null })
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error) return res.status(401).json({ user: null })
    return res.json({ user: data.user })
  } catch (err) {
    next(err)
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    const token = createResetToken(email)
    await sendResetEmail(email, token)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body
    const email = verifyResetToken(token)
    if (!email) return res.status(400).json({ error: 'Invalid or expired token' })

    // find user by email using admin.listUsers
    const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
    if (listErr) return res.status(500).json({ error: listErr.message })
    const user = listData.users.find(u => u.email === email)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { signup, login, me, forgotPassword, resetPassword }
