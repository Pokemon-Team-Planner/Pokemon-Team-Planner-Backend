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

app.get('/api/teams/:id', (request, response) => {
  Team.findById(request.params.id).then(team => {
    response.json(team)
  })
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

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})