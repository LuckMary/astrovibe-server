const Router = require('@koa/router')

const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')

const { UserError } = require('../utils/userError')
const { interpretation } = require('../constants/pythagoras')

dayjs.extend(customParseFormat)

const route = new Router({ prefix: '/pythagoras' })

route.get('/', async ctx => {
  const { date } = ctx.request.query

  const dateString = dayjs(date, 'DD/MM/YYYY').format('DMYYYY')

  if (dateString === 'Invalid Date') {
    console.log(date)
    throw new UserError('Невалидная дата', 'pif_001')
  }

  const dateArr = dateString.split('').map(item => +item)

  const firstNum = dateArr.reduce((acc, item) => acc + item, 0)
  const secondNum = firstNum
    .toString()
    .split('')
    .reduce((acc, item) => acc + +item, 0)
  const thirdNum = Math.abs(firstNum - dateArr[0] * 2)
  const fourthNum = thirdNum
    .toString()
    .split('')
    .reduce((acc, item) => acc + +item, 0)

  const arr = [...dateArr, firstNum, secondNum, thirdNum, fourthNum]
    .join('')
    .split('')

  const result = interpretation.map((item, index) => {
    return {
      number: item.number,
      name: item.name,
      text:
        item.text[arr.filter(n => n == index + 1).length] ||
        item.text[Object.keys(item.text).length - 1]
    }
  })

  ctx.body = { matrix: arr, date: dateString, result: result }
})

module.exports = route
