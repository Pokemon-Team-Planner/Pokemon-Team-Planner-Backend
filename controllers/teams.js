const teamsRouter = require('express').Router()
const Team = require('../models/team')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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

  // Using findById and save to update instead of findByIdAndUpdate
  // to have proper status codes for failed updates
  const teamToUpdate = await Team.findById(request.params.id)
  if (!teamToUpdate) {
    response.status(404).end()
  }
  teamToUpdate.team = body.team
  const updatedTeam = await teamToUpdate.save()

  if (updatedTeam) {
    response.json(updatedTeam)
  } else {
    response.status(404).end()
  }
})

teamsRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const team = new Team({
    gameVersionPokedex: body.gameVersionPokedex,
    date: new Date(),
    team: body.team,
    user: user._id
  })

  const savedTeam = await team.save()
  user.teams = user.teams.concat(savedTeam._id)
  await user.save()
  
  response.status(201).json(savedTeam)
})

module.exports = teamsRouter