const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'meow@lilyfamily.ru',
    pass: '59hKANvjubuGkc8xqLrM'
  },
  tls: {
    rejectUnauthorized: false
  }
})

const sendemail = (to, subject, text) => {
  const mailOptions = {
    from: 'Lily Family <meow@lilyfamily.ru>',
    to,
    subject,
    text
  }
  // transporter.sendMail(mailOptions)
}

module.exports = sendemail
