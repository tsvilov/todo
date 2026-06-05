const { supabaseAdmin } = require('../config/supabase')

async function requireRole(role) {
  return async function (req, res, next) {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Not authenticated' })
      const { data, error } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
      if (error) return res.status(403).json({ error: 'Access denied' })
      if (data.role !== role) return res.status(403).json({ error: 'Insufficient role' })
      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = { requireRole }
