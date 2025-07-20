const Router = require('@koa/router')

const pythagoras = require('./pythagoras')
const auth = require('./auth')
const me = require('./me')
const tags = require('./tags')
const upload = require('./upload')
const posts = require('./posts')

const router = new Router({ prefix: '/v1' })

router.use(pythagoras.routes()).use(pythagoras.allowedMethods())
router.use(auth.routes()).use(auth.allowedMethods())
router.use(me.routes()).use(me.allowedMethods())
router.use(tags.routes()).use(tags.allowedMethods())
router.use(upload.routes()).use(upload.allowedMethods())
router.use(posts.routes()).use(posts.allowedMethods())

module.exports = router
