const teamsRouter = require('express').Router()
const Team = require('../models/team')
const { userExtractor } = require('../utils/middleware')

teamsRouter.get('/', async (request, response) => {
  const teams = await Team.find({}).populate('user', { username: 1, name: 1})
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

teamsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const teamToBeDeleted = await Team.findById(request.params.id)

  if (!teamToBeDeleted) {
    response.status(204).end()
  }

  if (teamToBeDeleted.user.toString() !== user._id.toString()) {
    response.status(401).end().json({ error: 'unauthorized operation' })
  }

  await teamToBeDeleted.remove()
  user.teams = user.teams.filter(team => team._id.toString() !== request.params.id)
  await user.save()
  response.status(204).end()
})

teamsRouter.put('/:id', userExtractor, async (request, response) => {
  const user = request.user

  // Using findById and save to update instead of findByIdAndUpdate
  // to have proper status codes for failed updates
  const teamToUpdate = await Team.findById(request.params.id)
  if (!teamToUpdate) {
    response.status(404).end()
  }

  if (teamToUpdate.user.toString() !== user._id.toString()) {
    response.status(401).end().json({ error: 'unauthorized operation' })
  }

  teamToUpdate.team = request.body.team
  teamToUpdate.title = request.body.title
  teamToUpdate.description = request.body.description
  const updatedTeam = await teamToUpdate.save()

  if (updatedTeam) {
    response.json(updatedTeam)
  } else {
    response.status(404).end()
  }
})

teamsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const team = new Team({
    gameVersionPokedex: body.gameVersionPokedex,
    gameVersionName: body.gameVersionName,
    date: new Date(),
    team: body.team,
    user: user._id,
    title: body.title,
    description: body.description
  })

  const savedTeam = await team.save()
  user.teams = user.teams.concat(savedTeam._id)
  await user.save()
  
  response.status(201).json(savedTeam)
})

module.exports = teamsRouter