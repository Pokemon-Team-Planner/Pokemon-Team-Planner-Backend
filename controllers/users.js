const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('teams', { gameVersionPokedex: 1, gameVersionName: 1, date: 1, team: 1, title: 1, description: 1 })
  response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User
    .findById(request.params.id).populate('teams', { gameVersionPokedex: 1, gameVersionName: 1, date: 1, team: 1, title: 1, description: 1 })

  if (!user) {
    return response.status(404).end()
  }
  
  response.json(user)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  //restrict short usernames only at api level to reserve short ones for devs
  if (username.length < 6) {
    return response.status(400).json({
      error: 'username must be 6 characters at minimum'
    })
  }

  if (password.length < 10) {
    return response.status(400).json({
      error: 'password must be 10 characters at minimum'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter