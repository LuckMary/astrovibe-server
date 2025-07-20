const Router = require('@koa/router')

const { query } = require('../db')
const { permissions, AccessError } = require('../middlewares/permissions')

const route = new Router({ prefix: '/me' })

route.use(permissions('user'))

// get me
route.get('/', async ctx => {
  const [me] = await query('SELECT * FROM users WHERE id=?', [
    ctx.state.user.id
  ])

  if (!me) {
    throw new AccessError()
  }

  ctx.body = {
    me: {
      ...me,
      providers: undefined
    }
  }
})

module.exports = route
