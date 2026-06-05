const tokens = new Map()

function createResetToken(email) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const expires = Date.now() + 1000 * 60 * 60 // 1 hour
  tokens.set(token, { email, expires })
  return token
}

function verifyResetToken(token) {
  const data = tokens.get(token)
  if (!data) return null
  if (Date.now() > data.expires) {
    tokens.delete(token)
    return null
  }
  // once used, delete
  tokens.delete(token)
  return data.email
}

module.exports = { createResetToken, verifyResetToken }
