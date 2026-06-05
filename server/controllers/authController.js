const { supabaseAdmin } = require('../config/supabase')
const fetch = global.fetch
const { createResetToken, verifyResetToken } = require('../services/tokenService')
const { sendResetEmail } = require('../services/emailService')
const { SUPABASE_URL } = require('../config/supabase')

const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'

async function signup(req, res, next) {
  try {
    const { email, password } = req.body
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })
    if (error) return res.status(400).json({ error: error.message })
    res.json({ user: data.user })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const params = new URLSearchParams()
    params.append('grant_type', 'password')
    params.append('email', email)
    params.append('password', password)

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: params.toString()
    })
    const json = await resp.json()
    if (!resp.ok) return res.status(resp.status).json(json)
    // set tokens as httpOnly cookies
    const maxAge = (json.expires_in || 3600) * 1000
    res.cookie('access_token', json.access_token, { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax', maxAge })
    if (json.refresh_token) {
      // refresh token longer expiry (30 days)
      res.cookie('refresh_token', json.refresh_token, { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })
    }

    // fetch user from access token and return minimal user info
    const { data: userData } = await supabaseAdmin.auth.getUser(json.access_token)
    res.json({ user: userData.user })
  } catch (err) {
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
