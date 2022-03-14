const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
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