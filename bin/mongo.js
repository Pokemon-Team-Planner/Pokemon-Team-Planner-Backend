const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.jgsqd.mongodb.net/test?retryWrites=true&w=majority`
  mongoose.connect(url)

const teamSchema = new mongoose.Schema({
  gameVersionPokedex: String,
  date: Date,
  team: [{ pokemonID: Number }]
})

const Team = mongoose.model('Team', teamSchema)

const team = new Team({
  gameVersionPokedex: "pokedex-firered.json",
  date: new Date(),
  team: [
    { pokemonID: 3 },
    { pokemonID: 12 },
    { pokemonID: 33 },
    { pokemonID: 46 },
    { pokemonID: 78 },
    { pokemonID: 101 },
  ]
})

team.save().then(result => {
  console.log('team saved!')
  mongoose.connection.close()
})