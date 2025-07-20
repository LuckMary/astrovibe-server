const Validator = require('fastest-validator')
const _ = require('lodash')

const { UserError } = require('../utils/userError')

const validate = schema => async (ctx, next) => {
  const body = { ...ctx.request.body }
  const v = new Validator({
    haltOnFirstError: true
  })
  const check = v.compile(schema)

  // check all fields
  const fields = []

  Object.keys(schema).forEach(key => {
    const item = schema[key]

    if (item.nullable) return

    if (
      (['string', 'email', 'password', 'equal', 'enum'].includes(item.type) &&
        body[key].replace(/ /g, '') === '') ||
      (item.type === 'number' && body[key] === null)
    ) {
      fields.push(key)
    }
  })

  if (fields.length) {
    throw new UserError('ALL_MUST_BE_FILLED', 'validator_001', fields)
  }

  const res = check(body)

  if (res !== true) {
    const [err] = res

    throw new UserError(
      _.snakeCase(err.type).toUpperCase(),
      'validator_002',
      [err.field],
      _.pick(err, ['expected', 'actual'])
    )
  }

  ctx.request.body = body

  await next()
}

module.exports = validate
