const teamsRouter = require('express').Router()
const Team = require('../models/team')

teamsRouter.get('/', async (request, response) => {
  const teams = await Team.find({})
  response.json(teams)
})

teamsRouter.get('/:id', async (request, response, next) => {
  try {
    const team = await Team.findById(request.params.id)
    if (team) {
      response.json(team)
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})

teamsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Team.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch(exception) {
    next(exception)
  }
})

teamsRouter.put('/:id', (request, response, next) => {
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

teamsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const team = new Team({
    gameVersionPokedex: body.gameVersionPokedex,
    date: new Date(),
    team: body.team
  })

  try {
    const savedTeam = await team.save()
    response.status(201).json(savedTeam)
  } catch(exception) {
    next(exception)
  }
})

module.exports = teamsRouter