const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB', error.message)
  })

const teamSchema = new mongoose.Schema({
  gameVersionPokedex: {
    type: String,
    required: [true, "gameVersionPokedex is required"]
  },
  date: {
    type: Date,
    required: true
  },
  team: {
    type: [
            {
              pokemonID: { type: Number, required: [true, "pokemonID is required"] }
            }
          ],
    validate: [
                { validator: (arr) => arr.length >= 1, msg: 'One object is minimum' },
                { validator: (arr) => arr.length <= 6, msg: 'Six objects is maximum' }
              ],
    required: [true, "team is required"]
  }
})

teamSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Team', teamSchema)

