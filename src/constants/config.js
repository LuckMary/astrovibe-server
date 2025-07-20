const dotenv = require('dotenv')

dotenv.config({})

module.exports = {
  // server
  server: {
    port: process.env.PORT,
    colors: [
      'magenta',
      'red',
      'volcano',
      'orange',
      'lime',
      'gold',
      'green',
      'cyan',
      'blue',
      'geekblue',
      'purple',
      'pink'
    ]
  },

  // env
  env: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  },

  // db
  db: {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },

  // jwt
  jwt: {
    secret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    expiresIn: `${365 * 5 * 10}d`
  },

  // files
  files: {
    destination: process.env.UPLOADS_DESTINATION,
    route: process.env.UPLOADS_ROUTE
  },

  // posts
  posts: {
    limit: 10
  }
}
