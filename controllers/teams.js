const teamsRouter = require('express').Router()
const Team = require('../models/team')

teamsRouter.get('/', (request, response) => {
  Team.find({}).then(teams => {
    response.json(teams)
  })
})

teamsRouter.get('/:id', (request, response, next) => {
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

teamsRouter.delete('/:id', (request, response, next) => {
  Team.findByIdAndDelete(request.params.id)
    .then( () => {
      response.status(204).end()
    })
    .catch(error => next(error))
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

teamsRouter.post('/', (request, response, next) => {
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

module.exports = teamsRouter