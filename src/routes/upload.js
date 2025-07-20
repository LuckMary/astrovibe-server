const Router = require('@koa/router')
const sharp = require('sharp')
const mime = require('mime-types')
const fs = require('fs/promises')
const { join } = require('path')
const { mkdirp } = require('mkdirp')

const { pool } = require('../db')
const { permissions } = require('../middlewares/permissions')
const { UserError } = require('../utils/userError')
const { files } = require('../constants/config')

const route = new Router({ prefix: '/upload' })

route.use(permissions('user'))

const resizeOptions = {
  width: 1024,
  height: 768,
  fit: 'inside',
  withoutEnlargement: true
}

const resizeThumbOptions = {
  width: 150,
  height: 150,
  fit: 'cover'
}

// upload file
route.post('/', async ctx => {
  const { avatar = false } = ctx.query
  const { filepath, mimetype } = ctx.request.files.file
  const type = mime.extension(mimetype).replace('jpeg', 'jpg')
  const buffer = await fs.readFile(filepath)

  await fs.unlink(filepath)

  let imageBuffer
  let thumbBuffer

  if (!['jpg', 'png', 'webp'].includes(type)) {
    throw new UserError('INVALID_EXTENTION', 'upload_1')
  }

  // if (type === 'gif' && avatar) {
  //   throw new UserError('UPLOAD_CANT_BE_THUMB', 'upload_2')
  // }

  if (type === 'jpg') {
    imageBuffer = await sharp(buffer)
      .resize(resizeOptions)
      .jpeg({
        quality: 50
      })
      .toBuffer()

    if (avatar) {
      thumbBuffer = await sharp(buffer)
        .resize(resizeThumbOptions)
        .jpeg({
          quality: 50
        })
        .toBuffer()
    }
  }

  if (type === 'png') {
    imageBuffer = await sharp(buffer)
      .resize(resizeOptions)
      .png({ quality: 50 })
      .toBuffer()

    if (avatar) {
      thumbBuffer = await sharp(buffer)
        .resize(resizeThumbOptions)
        .png({
          quality: 50
        })
        .toBuffer()
    }
  }

  if (type === 'webp') {
    imageBuffer = await sharp(buffer)
      .resize(resizeOptions)
      .webp({ quality: 50 })
      .toBuffer()

    if (avatar) {
      thumbBuffer = await sharp(buffer)
        .resize(resizeThumbOptions)
        .webp({
          quality: 50
        })
        .toBuffer()
    }
  }

  const path = `/${Math.random().toString(36).slice(-1)}/${Math.random().toString(36).slice(-1)}`

  const directory = join(__dirname, '../..', files.destination, path)
  const name = `${(+new Date()).toString(36)}`

  // create directories if not exists
  await mkdirp(directory)

  await fs.writeFile(`${directory}/${name}.${type}`, imageBuffer)

  if (avatar) {
    await fs.writeFile(`${directory}/${name}_thumb.${type}`, thumbBuffer)
  }

  const conn = await pool.getConnection()

  // start transaction
  await conn.beginTransaction()

  let res
  try {
    res = await conn.query(
      'INSERT INTO uploads (path, name, type, user_id) VALUES (?,?,?,?)',
      [path, name, type, ctx.state.user.id]
    )

    // if (avatar) {
    //   await conn.query(
    //     'INSERT INTO user_avatars (user_id, upload_id) VALUES (?,?)',
    //     [ctx.state.user.id, Number(res.insertId)]
    //   )
    // }

    // commit changes
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  ctx.body = {
    id: Number(res.insertId),
    path: `${path}/${name}.${type}`,
    ...(avatar && { pathThumb: `${path}/${name}_thumb.${type}` })
  }
})

module.exports = route
