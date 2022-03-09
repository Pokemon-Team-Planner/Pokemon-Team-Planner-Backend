const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Team = require('../models/team')

describe('when there are initially some teams saved', () => {
  beforeEach(async () => {
    await Team.deleteMany({})
    await Team.insertMany(helper.initialTeams)
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

  describe('adding a new team', () => {
    test('succeeds with valid data ', async () => {
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
  
    test('fails with status code 400 if no pokemon in team', async () => {
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
  
    test('fails with status code 400 if more than 6 pokemon in team', async () => {
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
  })

  describe('viewing a team', () => {
    test('succeeds with valid id', async () => {
      const teamsAtStart = await helper.teamsInDb()
  
      const teamToView = teamsAtStart[0]
  
      const resultTeam = await api
        .get(`/api/teams/${teamToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const processedTeamToView = JSON.parse(JSON.stringify(teamToView)) //tranforms date-object to string
  
      expect(resultTeam.body).toEqual(processedTeamToView)
    })

    test('fails with status code 404 if id is non-existing', async () => {
      const nonExistingId = await helper.nonExistingId()
      await api
        .get(`/api/teams/${nonExistingId}`)
        .expect(404)
    })

    test('fails with status code 400 if invalid id', async () => {
      const invalidId = 'abcd1234'
      await api
        .get(`/api/teams/${invalidId}`)
        .expect(400)
    })
  })
  
  describe('deleting a team', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const teamsAtStart = await helper.teamsInDb()
      const teamToDelete = teamsAtStart[0]
  
      await api
        .delete(`/api/teams/${teamToDelete.id}`)
        .expect(204)
  
      const teamsAtEnd = await helper.teamsInDb()
  
      expect(teamsAtEnd).toHaveLength(
        helper.initialTeams.length - 1
      )
  
      const teams = teamsAtEnd.map(item => item.team)
  
      expect(teams).not.toContainEqual(teamToDelete.team)
    })

    test('fails with status code 204 if id is non-existing', async () => {
      const nonExistingId = await helper.nonExistingId()
      await api
        .delete(`/api/teams/${nonExistingId}`)
        .expect(204)
    })

    test('fails with status code 400 if invalid id', async () => {
      const invalidId = 'abcd1234'
      await api
        .delete(`/api/teams/${invalidId}`)
        .expect(400)
    })
  })

  describe('updating a team', () => {
    test('succeeds with valid team and id', async () => {
      const teamsAtStart = await helper.teamsInDb()
      const teamToUpdate = teamsAtStart[0]
      const updatedTeam = {
        team: [
          { pokemonID: 9 },
          { pokemonID: 9 },
          { pokemonID: 9 },
          { pokemonID: 9 },
          { pokemonID: 9 },
          { pokemonID: 9 }
        ]
      }
  
      await api
        .put(`/api/teams/${teamToUpdate.id}`)
        .send(updatedTeam)
        .expect(200)
  
      const teamsAtEnd = await helper.teamsInDb()
  
      expect(teamsAtEnd).toHaveLength(
        helper.initialTeams.length
      )
  
      const teams = teamsAtEnd.map(item => item.team)
  
      expect(teams).toContainEqual(updatedTeam.team)
    })

    test('fails with status code 400 if invalid id', async () => {
      const invalidId = '32423fdsf34424'
      const updatedTeam = {
        team: [
          { pokemonID: 9 }
        ]
      }
  
      await api
        .put(`/api/teams/${invalidId}`)
        .send(updatedTeam)
        .expect(400)
    })

    test('fails with status code 400 if team missing', async () => {
      const teamsAtStart = await helper.teamsInDb()
      const teamToUpdate = teamsAtStart[0]
      const updatedTeam = {}
  
      await api
        .put(`/api/teams/${teamToUpdate.id}`)
        .send(updatedTeam)
        .expect(400)
    })

    test('fails with status code 404 if id is non-existing', async () => {
      const nonExistingId = await helper.nonExistingId()
      const updatedTeam = {
        team: [
          { pokemonID: 9 }
        ]
      }
      await api
        .put(`/api/teams/${nonExistingId}`)
        .send(updatedTeam)
        .expect(404)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})