const mariadb = require('mariadb')

const config = require('./constants/config')

const pool = mariadb.createPool(config.db)

const query = async (...arg) => {
  let conn
  try {
    conn = await pool.getConnection()

    return await conn.query(...arg)
    // eslint-disable-next-line no-useless-catch
  } catch (error) {
    throw error
  } finally {
    conn.release()
  }
}

module.exports = Object.freeze({
  pool,
  query
})
