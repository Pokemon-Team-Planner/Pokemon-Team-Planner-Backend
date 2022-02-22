const express = require('express')
const app = express()
//const logger = require('./utils/logger')
const teamsRouter = require('./controllers/teams')
const cors = require('cors')
const middleware = require('./utils/middleware')
app.use(cors())
app.use(express.json())

app.use(express.static('build'))
app.use(express.static('public'))
app.use(middleware.requestLogger)

app.use('/api/teams', teamsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app