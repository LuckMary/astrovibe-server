class UserError extends Error {
  constructor(
    message = 'Message',
    code = '',
    fields = [],
    info = {},
    ...params
  ) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserError)
    }

    this.fields = fields
    this.code = code
    this.message = message
    this.date = new Date()
    this.info = info
  }
}

const errorResponse = error => ({
  error: {
    message: error.message,
    code: error.code || null,
    fields: error.fields,
    info: error.info
  }
})

module.exports = {
  UserError,
  errorResponse
}
