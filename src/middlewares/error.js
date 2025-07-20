const { errorResponse, UserError } = require('../utils/userError')

const error = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof UserError) {
      ctx.status = 200
      ctx.body = errorResponse(err)
      return
    }

    console.error(err)
    // ctx.status = err.statusCode || err.status || 500
    ctx.status = 500
    ctx.body = { error: { message: 'Internal Server Error' } }
  }
}

module.exports = error
