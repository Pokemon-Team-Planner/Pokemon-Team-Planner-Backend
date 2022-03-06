const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Team = require('../models/team')

beforeEach(async () => {
  await Team.deleteMany({})
  let teamObject = new Team(helper.initialTeams[0])
  await teamObject.save()
  teamObject = new Team(helper.initialTeams[1])
  await teamObject.save()
})

test('teams are returned as json', async () => {
  await api
    .get('/api/teams')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all teams are returned', async () => {
  const response = await api.get('/api/teams')

  expect(response.body).toHaveLength(helper.initialTeams.length)
})

test('a specific team is within the returned teams', async () => {
  const response = await api.get('/api/teams')

  const contents = response.body.map(item => item.team)

  expect(contents).toContainEqual(
    helper.initialTeams[0].team
  )
})

test('a valid team can be added ', async () => {
  const newTeam = {
    gameVersionPokedex: 'pokedex-firered.json',
    date: new Date(),
    team: [
      { pokemonID: 1 },
      { pokemonID: 2 },
      { pokemonID: 3 },
      { pokemonID: 4 },
      { pokemonID: 5 },
      { pokemonID: 6 }
    ]
  }

  await api
    .post('/api/teams')
    .send(newTeam)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const teamsAtEnd = await helper.teamsInDb()

  const teams = teamsAtEnd.map(item => item.team)

  expect(teamsAtEnd).toHaveLength(helper.initialTeams.length + 1)
  expect(teams).toContainEqual(
    newTeam.team
  )
})

test('team without pokemon is not added', async () => {
  const newTeam = {
    gameVersionPokedex: 'pokedex-firered.json',
    date: new Date(),
    team: []
  }

  await api
    .post('/api/teams')
    .send(newTeam)
    .expect(400)

  const response = await api.get('/api/teams')

  expect(response.body).toHaveLength(helper.initialTeams.length)
})

test('team with more than 6 pokemon is not added', async () => {
  const newTeam = {
    gameVersionPokedex: 'pokedex-firered.json',
    date: new Date(),
    team: [
      { pokemonID: 1 },
      { pokemonID: 2 },
      { pokemonID: 3 },
      { pokemonID: 4 },
      { pokemonID: 5 },
      { pokemonID: 6 },
      { pokemonID: 7 }
    ]
  }

  await api
    .post('/api/teams')
    .send(newTeam)
    .expect(400)

  const response = await api.get('/api/teams')

  expect(response.body).toHaveLength(helper.initialTeams.length)
})

test('a specific team can be viewed', async () => {
  const teamsAtStart = await helper.teamsInDb()

  const teamToView = teamsAtStart[0]

  const resultTeam = await api
    .get(`/api/teams/${teamToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const processedTeamToView = JSON.parse(JSON.stringify(teamToView)) //tranforms date-object to string

  expect(resultTeam.body).toEqual(processedTeamToView)
})

test('a team can be deleted', async () => {
  const teamsAtStart = await helper.teamsInDb()
  const teamToDelete = teamsAtStart[0]

  await api
    .delete(`/api/teams/${teamToDelete.id}`)
    .expect(204)

  const teamsAtEnd = await helper.teamsInDb()

  expect(teamsAtEnd).toHaveLength(
    helper.initialTeams.length - 1
  )

  const contents = teamsAtEnd.map(item => item.team)

  expect(contents).not.toContainEqual(teamToDelete.team)
})

afterAll(() => {
  mongoose.connection.close()
})