const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Team = require('../models/team')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const login = async user => {
  const response = await api
    .post('/api/login')
    .send({ username: user.username, password: user.password})
  return response.body.token
}

const extractUser = token => {
  return jwt.verify(token, config.SECRET)
}

describe('when there are initially some teams and users saved', () => {
  beforeEach(async () => {
    await Team.deleteMany({})
    await Team.insertMany(helper.initialTeams)

    await User.deleteMany({})
    let hashedUsers = JSON.parse(JSON.stringify(helper.initialUsers))
    await Promise.all(
      hashedUsers.map(async user => {
        user.passwordHash = await bcrypt.hash(user.password, 10)
        delete user.password
      })
    )
    await User.insertMany(hashedUsers)
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
    let validToken
    beforeEach(async () => {
      validToken = await login(helper.initialUsers[0])
    })

    test('succeeds with valid data and token', async () => {
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
        .set('Authorization', `bearer ${validToken}`)
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
        .set('Authorization', `bearer ${validToken}`)
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
        .set('Authorization', `bearer ${validToken}`)
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
    let validToken
    let validTokenAnotherUser
    beforeEach(async () => {
      validToken = await login(helper.initialUsers[0])
      validTokenAnotherUser = await login(helper.initialUsers[1])
    })

    test('succeeds with status code 204 if valid id & token matches creator', async () => {
      const decodedToken = jwt.verify(validToken, config.SECRET)

      const newTeam = new Team({
        gameVersionPokedex: 'pokedex-firered.json',
        date: new Date(),
        team: [
          { pokemonID: 11 },
          { pokemonID: 22 },
          { pokemonID: 33 }
        ],
        user: decodedToken.id
      })
      const teamToDelete = await newTeam.save()

      await api
        .delete(`/api/teams/${teamToDelete.id}`)
        .set('Authorization', `bearer ${validToken}`)
        .expect(204)

      const teamsAtEnd = await helper.teamsInDb()
      expect(teamsAtEnd).toHaveLength(helper.initialTeams.length)
    })

    test('fails with status code 204 if id is non-existing', async () => {
      const nonExistingId = await helper.nonExistingId()
      await api
        .delete(`/api/teams/${nonExistingId}`)
        .set('Authorization', `bearer ${validToken}`)
        .expect(204)
    })

    test('fails with status code 400 if invalid id', async () => {
      const invalidId = 'abcd1234'
      await api
        .delete(`/api/teams/${invalidId}`)
        .set('Authorization', `bearer ${validToken}`)
        .expect(400)
    })

    test('fails with status code 401 if valid id but token not matching creator', async () => {
      const decodedToken = jwt.verify(validToken, config.SECRET)
      const newTeam = new Team({
        gameVersionPokedex: 'pokedex-firered.json',
        date: new Date(),
        team: [
          { pokemonID: 11 },
          { pokemonID: 22 },
          { pokemonID: 33 }
        ],
        user: decodedToken.id
      })
      const teamToDelete = await newTeam.save()

      await api
        .delete(`/api/teams/${teamToDelete.id}`)
        .set('Authorization', `bearer ${validTokenAnotherUser}`)
        .expect(401)
  
      const teamsAtEnd = await helper.teamsInDb()
  
      expect(teamsAtEnd).toHaveLength(
        helper.initialTeams.length + 1
      )
  
      const teams = teamsAtEnd.map(item => item.team)
  
      expect(teams).toContainEqual(teamToDelete.toJSON().team)
    })
  })

  describe('updating a team', () => {
    let validToken
    //let validTokenAnotherUser
    beforeEach(async () => {
      validToken = await login(helper.initialUsers[0])
      //validTokenAnotherUser = await login(helper.initialUsers[1])
    })

    test('succeeds with valid team, id & if token matches creator', async () => {
      const user = extractUser(validToken)

      const newTeam = new Team({
        gameVersionPokedex: 'pokedex-firered.json',
        date: new Date(),
        team: [
          { pokemonID: 11 },
          { pokemonID: 22 },
          { pokemonID: 33 }
        ],
        user: user.id
      })
      const teamToUpdate = await newTeam.save()

      const updatedTeam = {
        team: [
          { pokemonID: 44 },
          { pokemonID: 55 },
          { pokemonID: 66 },
        ]
      }
  
      await api
        .put(`/api/teams/${teamToUpdate.id}`)
        .set('Authorization', `bearer ${validToken}`)
        .send(updatedTeam)
        .expect(200)
  
      const teamsAtEnd = await helper.teamsInDb()
  
      expect(teamsAtEnd).toHaveLength(
        helper.initialTeams.length + 1
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
        .set('Authorization', `bearer ${validToken}`)
        .send(updatedTeam)
        .expect(400)
    })

    test('fails with status code 400 if team missing', async () => {
      const user = extractUser(validToken)

      const newTeam = new Team({
        gameVersionPokedex: 'pokedex-firered.json',
        date: new Date(),
        team: [
          { pokemonID: 11 },
          { pokemonID: 22 },
          { pokemonID: 33 }
        ],
        user: user.id
      })
      const teamToUpdate = await newTeam.save()
      const updatedTeam = {}
  
      await api
        .put(`/api/teams/${teamToUpdate.id}`)
        .set('Authorization', `bearer ${validToken}`)
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
        .set('Authorization', `bearer ${validToken}`)
        .send(updatedTeam)
        .expect(404)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})