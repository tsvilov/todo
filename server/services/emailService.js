const nodemailer = require('nodemailer')

async function sendResetEmail(toEmail, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`

  // If SMTP is configured, send real email, otherwise log the reset URL
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: toEmail,
      subject: 'Password reset',
      text: `Reset your password: ${resetUrl}`,
      html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
    })
  } else {
    console.log(`Password reset for ${toEmail}: ${resetUrl}`)
  }
}

module.exports = { sendResetEmail }
