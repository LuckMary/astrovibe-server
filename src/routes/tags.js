const Router = require('@koa/router')

const { query } = require('../db')
const { permissions } = require('../middlewares/permissions')
const { removeSpecialChars } = require('../utils/regex')
const validate = require('../middlewares/validate')

const route = new Router({ prefix: '/tags' })

// route.use(permissions('user'))

// find popular tags
route.get('/', async ctx => {
  const popularTags = await query('SELECT * FROM tags LIMIT 10')

  ctx.body = {
    popularTags
  }
})

// find list
route.get('/find/:string', async ctx => {
  const { string } = ctx.params

  const tags = await query('SELECT * FROM tags WHERE name LIKE ? LIMIT 10', [
    `${removeSpecialChars(string.toLowerCase())}%`
  ])

  ctx.body = {
    tags: tags.map(tag => tag.name)
  }
})

// add tags
route.post(
  '/',
  permissions('user'),
  validate({
    tags: { type: 'array', items: 'string', empty: false }
  }),
  async ctx => {
    const tags = ctx.request.body.tags.slice(0, 10)

    const resTags = await query(
      'SELECT * FROM tags WHERE name IN (?) LIMIT 10',
      [tags.map(item => removeSpecialChars(item.toLowerCase()))]
    )

    const tagsFromDb = resTags.map(tag => tag.name)
    const tagsToDb = tags.filter(val => !tagsFromDb.includes(val))

    const queries = []

    if (tagsToDb.length) {
      tagsToDb.forEach(tag => {
        queries.push(
          query('INSERT INTO tags (`name`, user_id) VALUES (?, ?)', [
            removeSpecialChars(tag.toLowerCase()),
            ctx.state.user.id
          ])
        )
      })
    }

    const res = await Promise.all(queries)

    const insertIds = res.map(item => Number(item.insertId))

    ctx.body = {
      ids: [...resTags.map(item => item.id), ...insertIds]
    }
  }
)

module.exports = route
