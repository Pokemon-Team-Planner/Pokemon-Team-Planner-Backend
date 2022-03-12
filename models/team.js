const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  gameVersionPokedex: {
    type: String,
    required: [true, 'gameVersionPokedex is required']
  },
  date: {
    type: Date,
    required: true
  },
  team: {
    type: [
      {
        pokemonID: { type: Number, required: [true, 'pokemonID is required'] }
      }
    ],
    validate: [
      { validator: (arr) => arr.length >= 1, msg: 'One object is minimum' },
      { validator: (arr) => arr.length <= 6, msg: 'Six objects is maximum' }
    ],
    required: [true, 'team is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

teamSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v

    returnedObject.team.forEach(item => {
      delete item._id
    })
  }
})

module.exports = mongoose.model('Team', teamSchema)

