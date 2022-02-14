require('dotenv').config()
const express = require('express')
const app = express()
const Team = require('./models/team')

const cors = require('cors')
app.use(cors())
app.use(express.json())

app.use(express.static('build'))
app.use(express.static('public'))

app.get('/api/teams', (request, response) => {
  Team.find({}).then(teams => {
    response.json(teams)
  })
})

app.get('/api/teams/:id', (request, response, next) => {
  Team.findById(request.params.id).then(team => {
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

  Team.findByIdAndUpdate(request.params.id, team, {new: true})
    .then(updateTeam => {
      if (updateTeam) {
        response.json(updateTeam)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/teams', (request, response) => {
  const body = request.body
  console.log(request)

  if (body.gameVersionPokedex === undefined) {
    return response.status(400).json({ error: 'gameVersionPokedex missing' })
  }
  if (body.team === undefined) {
    return response.status(400).json({ error: 'team missing' })
  }

  const team = new Team({
    gameVersionPokedex: body.gameVersionPokedex,
    date: new Date(),
    team: body.team
  })

  team.save().then(savedTeam => {
    response.json(savedTeam)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})