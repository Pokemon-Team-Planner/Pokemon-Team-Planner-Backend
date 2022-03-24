const logger = require('./utils/logger')
const config = require('./utils/config')
const mongoose = require('mongoose')
const express = require('express')
require('express-async-errors') // eliminates the need for try-catch and next(exception) in controllers
const app = express()
const cors = require('cors')
const loginRouter = require('./controllers/login')
const teamsRouter = require('./controllers/teams')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(express.static('public'))
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/login', loginRouter)
app.use('/api/teams', teamsRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app