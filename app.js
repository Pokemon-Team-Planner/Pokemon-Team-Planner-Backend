const express = require('express')
const morgan = require('morgan')
const app = express()
const logger = require('./utils/logger')
const Team = require('./models/team')

const cors = require('cors')
app.use(cors())
app.use(express.json())

morgan.token('body', request => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('build'))
app.use(express.static('public'))

app.get('/api/teams', (request, response) => {
  Team.find({}).then(teams => {
    response.json(teams)
  })
})

app.get('/api/teams/:id', (request, response, next) => {
  Team.findById(request.params.id)
    .then(team => {
      if (team) {
        response.json(team)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/teams/:id', (request, response, next) => {
  Team.findByIdAndDelete(request.params.id)
    .then( () => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/teams/:id', (request, response, next) => {
  const body = request.body

  const team = {
    team: body.team
  }

  Team.findByIdAndUpdate(request.params.id, team, { new: true, runValidators: true, context: 'query' })
    .then(updateTeam => {
      if (updateTeam) {
        response.json(updateTeam)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/teams', (request, response, next) => {
  const body = request.body

  const team = new Team({
    gameVersionPokedex: body.gameVersionPokedex,
    date: new Date(),
    team: body.team
  })

  team.save()
    .then(savedTeam => {
      response.json(savedTeam)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

module.exports = app