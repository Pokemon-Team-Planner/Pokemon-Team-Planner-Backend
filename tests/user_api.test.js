const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

describe('when there are initially some users saved', () => {
  beforeEach(async () => {
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

  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async () => {
    const response = await api.get('/api/users')

    expect(response.body).toHaveLength(helper.initialUsers.length)
  })

  test('a specific user is within the returned users', async () => {
    const response = await api.get('/api/users')

    const usernames = response.body.map(item => item.username)

    expect(usernames).toContain('root')
  })

  describe('creation succeeds if', () => {
    test('username is fresh and unique', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'alestan',
        name: 'AnttiA',
        password: 'salainenon',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('username contains valid characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: '_Antti.123_',
        name: 'AnttiA',
        password: 'salainenon',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })
  })

  describe('creation fails with proper statuscode and message if', () => {
    test('username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainenon',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('username must be unique')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('username is shorter than 6 characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'admin',
        name: 'Admin',
        password: 'salainenon',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('username must be 6 characters at minimum')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('username is longer than 20 characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'adminadminadminadmin1',
        name: 'Admin',
        password: 'salainenon',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('username must be 20 characters at maximum')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('username contains invalid characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: '!?/&%¤#"!#¤/)=',
        name: 'Admin',
        password: 'salainenon',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('username must contain only letters, numbers, _ and .')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('password is shorter than 10 characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'admin1',
        name: 'Admin',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('password must be 10 characters at minimum')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})