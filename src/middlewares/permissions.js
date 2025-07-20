const jwt = require('jsonwebtoken')

const {
  jwt: { secret, issuer }
} = require('../constants/config')
const { query } = require('../db')

class AccessError extends Error {
  constructor(...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AccessError)
    }
  }
}

const roles = {
  user: ['user'],
  moderator: ['user', 'moderator'],
  admin: ['user', 'moderator', 'admin']
}

// eslint-disable-next-line no-unused-vars
const permissions =
  (role, config = {}) =>
  async (ctx, next) => {
    ctx.state.user = null

    try {
      const { authorization } = ctx.header

      if (!authorization) {
        if (config.optional) {
          return await next()
        }

        throw new AccessError()
      }

      const [, token] = authorization.split(' ')

      if (!token) {
        if (config.optional) {
          return await next()
        }

        throw new AccessError()
      }

      let user
      try {
        ;({ user } = jwt.verify(token, secret, { issuer }))
      } catch (_) {
        if (config.optional) {
          return await next()
        }

        throw new AccessError()
      }

      // тут реализуем проверку ролей
      const [me] = await query('SELECT * FROM users WHERE id=?', [user.id])

      if (!me) {
        throw new AccessError()
      }

      if (!roles[me.role].includes(role)) {
        throw new AccessError()
      }

      ctx.state.user = user
      await next()
    } catch (error) {
      if (error instanceof AccessError) {
        ctx.status = 401
        ctx.body = { error: { message: 'Access denied' } }
        return
      }
      throw error
    }
  }

module.exports = { permissions, AccessError }
