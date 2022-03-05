const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Team = require('../models/team')

const initialTeams = [
  {
    gameVersionPokedex: 'pokedex-firered.json',
    date: new Date(),
    team: [
      { pokemonID: 6 },
      { pokemonID: 53 },
      { pokemonID: 24 },
      { pokemonID: 87 },
      { pokemonID: 98 },
      { pokemonID: 134 }
    ]
  },
  {
    gameVersionPokedex: 'pokedex-firered.json',
    date: new Date(),
    team: [
      { pokemonID: 9 },
      { pokemonID: 33 },
      { pokemonID: 45 },
      { pokemonID: 65 },
      { pokemonID: 78 },
      { pokemonID: 120 }
    ]
  }
]

beforeEach(async () => {
  await Team.deleteMany({})
  let teamObject = new Team(initialTeams[0])
  await teamObject.save()
  teamObject = new Team(initialTeams[1])
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

  expect(response.body).toHaveLength(initialTeams.length)
})

test('a specific team is within the returned teams', async () => {
  const response = await api.get('/api/teams')

  const contents = response.body.map(r => r.team)

  expect(contents).toContainEqual(
    initialTeams[0].team
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

  const response = await api.get('/api/teams')

  const contents = response.body.map(r => r.team)

  expect(response.body).toHaveLength(initialTeams.length + 1)
  expect(contents).toContainEqual(
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

  expect(response.body).toHaveLength(initialTeams.length)
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

  expect(response.body).toHaveLength(initialTeams.length)
})

afterAll(() => {
  mongoose.connection.close()
})