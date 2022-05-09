const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  gameVersionPokedex: {
    type: String,
    required: [true, 'gameVersionPokedex is required']
  },
  gameVersionName: {
    type: String,
    required: [true, 'gameVersionName is required']
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
  },
  title: {
    type: String,
    required: [true, 'title is required']
  },
  description: {
    type: String,
    required: false
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

