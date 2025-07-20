function setValue(object, path, value) {
  const keys = path.split('.')
  const last = keys.pop()

  keys.reduce((o, k) => (o[k] = o[k] || {}), object)[last] = value

  return object
}

const dotToNested = source =>
  Object.entries(source).reduce((o, [k, v]) => setValue(o, k, v), {})

module.exports = { dotToNested }
