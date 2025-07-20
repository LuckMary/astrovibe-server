const Router = require('@koa/router')
const sanitizeHtml = require('sanitize-html')

const { query, pool } = require('../db')
const { permissions, AccessError } = require('../middlewares/permissions')
const validate = require('../middlewares/validate')
const { dotToNested } = require('../utils/dotToNested')
const {
  posts: { limit }
} = require('../constants/config')

const route = new Router({ prefix: '/posts' })

// get posts
route.get('/', async ctx => {
  const page = +ctx.query?.page || 1

  const posts = await query(
    `SELECT
      p.id, p.title, p.body, p.uri, p.likes, p.created_at, p.updated_at,
      u.id AS 'user.id', u.name AS 'user.name'
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT ?
      OFFSET ?`,
    [limit, (page - 1) * limit]
  )

  const [{ count }] = await query(
    "SELECT COUNT(*) as count FROM posts WHERE status = 'published'"
  )

  ctx.body = {
    posts: posts.map(post => ({
      ...dotToNested(post),
      body: post.body.b
    })),
    page,
    limit,
    count: Number(count)
  }
})

// get post
route.get('/:uri', async ctx => {
  const { uri } = ctx.params

  if (!uri) {
    throw new Error('String is empty!')
  }

  const [post] = await query(
    `SELECT
      p.id, p.title, p.body, p.uri, p.likes, p.created_at, p.updated_at,
      u.id AS 'user.id', u.name AS 'user.name'
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published' AND p.uri=?`,
    [uri]
  )

  if (!post) {
    ctx.status = 404
    ctx.body = 'Not found'
  } else {
    ctx.body = {
      post: {
        ...dotToNested(post),
        body: post.body.b
      }
    }
  }
})

// add post
route.post(
  '/',
  permissions('user'),
  validate({
    title: { type: 'string', min: 4, max: 64, trim: true },
    body: {
      type: 'array',
      items: {
        type: 'object',
        props: {
          id: { type: 'string', empty: false },
          type: { type: 'enum', values: ['text', 'image', 'cut'] },
          body: {
            type: 'multi',
            optional: true,
            rules: [
              { type: 'string', trim: true },
              {
                type: 'object',
                props: {
                  id: { type: 'number' },
                  path: { type: 'string', empty: false }
                }
              }
            ]
          }
        }
      },
      empty: false,
      max: 10
    },
    status: { type: 'enum', values: ['published', 'draft'] },
    tags: { type: 'array', items: 'number', empty: false, max: 10 }
  }),
  async ctx => {
    let { title, body, status = 'draft', tags } = ctx.request.body
    // remove spaces
    title = title.replace(/ +(?= )/g, '')
    body = body.map(item => {
      if (item.type === 'text') {
        return {
          ...item,
          body: sanitizeHtml(item.body, {
            allowedTags: ['b', 'i', 'a', 'h1'],
            allowedAttributes: { a: ['href'] }
          })
        }
      }

      return item
    })

    const imageIds = body
      .filter(item => item.type === 'image')
      .map(item => item.body.id)

    // check uri
    const _uri = title
      .toLowerCase()
      .replace(/[^a-zа-яё\d\s]+/gi, '')
      .replace(/ +(?= )/g, '')
      .trim()
      .replaceAll(' ', '-')

    let uri = _uri

    let uriRes
    let i = 0
    do {
      if (i > 0) {
        uri = `${_uri}-${i}`
      }

      i += 1
      ;[uriRes] = await query(`SELECT * FROM posts WHERE uri=?`, [uri])
    } while (uriRes)

    const conn = await pool.getConnection()

    // start transaction
    await conn.beginTransaction()

    let res
    try {
      // posts
      res = await conn.query(
        'INSERT INTO posts (title, body, status, uri, user_id) VALUES (?,?,?,?,?)',
        [title, { b: body }, status, uri, ctx.state.user.id]
      )

      // images
      if (imageIds.length) {
        await conn.batch(
          'INSERT INTO post_uploads (post_id, upload_id) VALUES(?, ?)',
          imageIds.map(id => [Number(res.insertId), id])
        )
      }

      // tags
      if (tags.length) {
        await conn.batch(
          'INSERT INTO post_tags (post_id, tag_id) VALUES(?, ?)',
          tags.map(id => [Number(res.insertId), id])
        )
      }

      // commit changes
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }

    const [post] = await query(
      `SELECT
      p.id, p.title, p.body, p.uri, p.created_at, p.updated_at,
      u.id AS 'user.id', u.name AS 'user.name'
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id=?`,
      [Number(res.insertId)]
    )

    const tagsRes = await query(
      `SELECT
      t.id, t.name
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id=?`,
      [Number(res.insertId)]
    )

    // const uploadRes = await query(
    //   `SELECT
    //   u.id, u.name
    //   FROM uploads u
    //   JOIN post_uploads pu ON u.id = pu.upload_id
    //   WHERE pu.post_id=?`,
    //   [Number(res.insertId)]
    // )

    ctx.body = {
      ...dotToNested(post),
      body: post.body.b,
      tags: tagsRes
      // uploads: uploadRes
    }
  }
)

module.exports = route
