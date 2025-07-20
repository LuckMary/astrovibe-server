const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const validate = require('../middlewares/validate')

const { UserError } = require('../utils/userError')
const { query } = require('../db')
const {
  jwt: { secret, issuer, expiresIn },
  server
} = require('../constants/config')
const mailer = require('../utils/mailer')

const route = new Router({ prefix: '/auth' })

// register
route.put(
  '/local',
  validate({
    email: { type: 'email', normalize: true, mode: 'precise' },
    name: { type: 'string', min: 4, max: 32, trim: true },
    password: { type: 'string', min: 5 },
    passwordConfirm: { type: 'equal', field: 'password' }
  }),
  async ctx => {
    const { email: _email, name, password } = ctx.request.body
    const email = `${_email}`.toLowerCase().trim()

    // find email
    let [user] = await query(`SELECT * FROM users WHERE email=?`, [email])

    if (user) {
      throw new UserError('EMAIL_IS_USE', 'auth_001', ['email'])
    }

    // find name
    ;[user] = await query(`SELECT * FROM users WHERE name=?`, [name])

    if (user) {
      throw new UserError('NAME_IS_USE', 'auth_002', ['name'])
    }

    const resUser = await query(
      'INSERT INTO users (email, name, providers, color) VALUES (?,?,?,?)',
      [
        email,
        name,
        {
          local: {
            hash: bcrypt.hashSync(password, 8)
          }
        },
        server.colors[Math.floor(Math.random() * server.colors.length)]
      ]
    )

    // get me
    const [me] = await query('SELECT * FROM users WHERE id=?', [
      Number(resUser.insertId)
    ])

    ctx.body = {
      me: {
        ...me,
        providers: undefined
      },
      token: jwt.sign(
        {
          user: { id: me.id }
        },
        secret,
        {
          expiresIn,
          issuer
        }
      )
    }
  }
)

// login
route.post(
  '/local',
  validate({
    email: { type: 'email', normalize: true },
    password: { type: 'string' }
  }),
  async ctx => {
    const { email, password } = ctx.request.body

    // find me
    const [me] = await query(
      'SELECT id, name, email, role, status, gender, birthday, karma, color, providers, created_at, updated_at FROM users WHERE email=?',
      [email]
    )

    // const avatars = await query(
    //   `SELECT u.id, u.path, u.name, u.type FROM user_avatars ua
    //       JOIN uploads u ON u.id=ua.upload_id
    //       WHERE ua.user_id=?
    //       ORDER BY u.created_at DESC`,
    //   [me.id]
    // )

    if (!me) {
      throw new UserError('INVALID_EMAIL_OR_PASSWORD', 'auth_101', [
        'email',
        'password'
      ])
    }

    if (!bcrypt.compareSync(password, me.providers.local.hash)) {
      throw new UserError('INVALID_EMAIL_OR_PASSWORD', 'auth_101', [
        'email',
        'password'
      ])
    }

    ctx.body = {
      me: {
        ...me,
        providers: undefined
        // avatars: avatars.map(avatar => ({
        //   id: avatar.id,
        //   pathThumb: `${avatar.path}/${avatar.name}_thumb.${avatar.type}`
        // }))
      },
      token: jwt.sign(
        {
          user: { id: me.id }
        },
        secret,
        {
          expiresIn,
          issuer
        }
      )
    }
  }
)

// reset password
route.patch(
  '/local',
  validate({
    email: { type: 'email', normalize: true, mode: 'precise' }
  }),
  async ctx => {
    const { email } = ctx.request.body

    // find me
    const [me] = await query('SELECT * FROM users WHERE email=?', [email])

    if (!me) {
      throw new UserError('AUTH_INVALID_EMAIL', 'auth_200', ['email'])
    }

    const password = _.sampleSize(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%',
      7
    ).join('')

    mailer(email, 'New password', password)

    // await query(
    //   `UPDATE users SET providers=JSON_MERGE_PATCH(providers, '{"local":{"hash":"${bcrypt.hashSync(
    //     password,
    //     8
    //   )}"}') WHERE id=${me.id}`
    // )

    ctx.body = { ok: true }
  }
)

module.exports = route
