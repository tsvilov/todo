const express = require('express')
const router = express.Router()
const { signup, login, me, forgotPassword, resetPassword } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgot', forgotPassword)
router.post('/reset', resetPassword)
router.get('/me', me)

router.post('/logout', (req, res) => {
	// clear cookies
	res.clearCookie('access_token')
	res.clearCookie('refresh_token')
	res.json({ ok: true })
})

module.exports = router
