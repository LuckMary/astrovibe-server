const Koa = require('koa')
const cors = require('@koa/cors')
const helmet = require('koa-helmet')
const { koaBody } = require('koa-body')
const path = require('path')

const router = require('./routes')
const error = require('./middlewares/error')
const { query } = require('./db')
const {
  server: { port },
  db,
  files: { maxSize },
  env: { isDevelopment }
} = require('./constants/config')

const app = new Koa()

app.proxy = true
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors())
app.use(error)
app.use(
  koaBody({
    multipart: true,
    formidable: { maxFileSize: maxSize * 1024 * 1024 }
  })
)

if (isDevelopment) {
  app.use(
    require('koa-mount')(
      '/files',
      require('koa-static')(path.join(__dirname, '../uploads'))
    )
  )
}

app.use(router.routes()).use(router.allowedMethods())

app.use(ctx => {
  ctx.body = { meow: 'Мяу! Мяу! Мяу! Mурмяу!!!' }
})

query('SELECT 1 as val')
  .then(() => {
    console.log(
      `✓ DB connected to ${db.host}:${db.port}, database: ${db.database}`
    )

    app.listen(port, () =>
      console.log(`✓ Started API server at http://localhost:${port}`)
    )
  })
  .catch(console.log)
