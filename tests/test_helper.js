const Team = require('../models/team')
const User = require('../models/user')

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

const initialUsers = [
  {
    username: 'testing',
    name: 'Testing',
    password: 'salainen_on123'
  },
  {
    username: 'anothertesting',
    name: 'Another testing user',
    password: 'salainen_on456'
  }
]

const nonExistingId = async () => {
  const team = new Team({ 
    gameVersionPokedex: 'pokedex-firered.json',
    date: new Date(),
    team: [{ pokemonID: 1 }]
  })
  await team.save()
  await team.remove()

  return team._id.toString()
}

const teamsInDb = async () => {
  const teams = await Team.find({})
  return teams.map(team => team.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialTeams, initialUsers, nonExistingId, teamsInDb, usersInDb
}