const { supabaseAdmin } = require('../config/supabase')

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.access_token
    if (!token) return res.status(401).json({ error: 'Missing access token cookie' })
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' })
    req.user = data.user
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = authMiddleware
