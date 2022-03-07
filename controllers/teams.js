const teamsRouter = require('express').Router()
const Team = require('../models/team')

teamsRouter.get('/', async (request, response) => {
  const teams = await Team.find({})
  response.json(teams)
})

teamsRouter.get('/:id', async (request, response) => {
  const team = await Team.findById(request.params.id)
  if (team) {
    response.json(team)
  } else {
    response.status(404).end()
  }
})

teamsRouter.delete('/:id', async (request, response) => {
  await Team.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

teamsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const team = {
    team: body.team
  }

  const updatedTeam = await Team.findByIdAndUpdate(request.params.id, team, { new: true, runValidators: true, context: 'query' })
  if (updatedTeam) {
    response.json(updatedTeam)
  } else {
    response.status(404).end()
  }
})

teamsRouter.post('/', async (request, response) => {
  const body = request.body

  const team = new Team({
    gameVersionPokedex: body.gameVersionPokedex,
    date: new Date(),
    team: body.team
  })

  const savedTeam = await team.save()
  response.status(201).json(savedTeam)
})

module.exports = teamsRouter