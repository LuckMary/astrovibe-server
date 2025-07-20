const removeSpecialChars = str =>
  str.replace(/[\s~`!@#$%^&*()_+\-={[}\]|\\:;"'<,>.?№/]+/g, '')

module.exports = { removeSpecialChars }
