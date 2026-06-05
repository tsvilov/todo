const { supabaseAdmin } = require('../config/supabase')

async function createTodo(req, res, next) {
  try {
    const { title, content } = req.body
    const owner = req.user.id
    const { data, error } = await supabaseAdmin.from('todos').insert([{ title, content, owner }]).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function listTodos(req, res, next) {
  try {
    const user = req.user
    // admins get all
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
    let query = supabaseAdmin.from('todos').select('*')
    if (profile?.role !== 'admin') query = query.eq('owner', user.id)
    const { data, error } = await query
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function getTodo(req, res, next) {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin.from('todos').select('*').eq('id', id).single()
    if (error) return res.status(404).json({ error: error.message })
    // ensure owner or admin
    const owner = data.owner
    if (owner !== req.user.id) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', req.user.id).single()
      if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function updateTodo(req, res, next) {
  try {
    const { id } = req.params
    const updates = req.body
    // ensure owner
    const { data: existing, error: exErr } = await supabaseAdmin.from('todos').select('owner').eq('id', id).single()
    if (exErr) return res.status(404).json({ error: exErr.message })
    if (existing.owner !== req.user.id) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', req.user.id).single()
      if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    }
    const { data, error } = await supabaseAdmin.from('todos').update(updates).eq('id', id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function deleteTodo(req, res, next) {
  try {
    const { id } = req.params
    const { data: existing, error: exErr } = await supabaseAdmin.from('todos').select('owner').eq('id', id).single()
    if (exErr) return res.status(404).json({ error: exErr.message })
    if (existing.owner !== req.user.id) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', req.user.id).single()
      if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    }
    const { error } = await supabaseAdmin.from('todos').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { createTodo, listTodos, getTodo, updateTodo, deleteTodo }
