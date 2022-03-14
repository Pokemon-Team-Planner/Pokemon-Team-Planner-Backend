const mongoose = require('mongoose')

const isUserNameValid = (username) => {
  /* 
    Usernames can only have: 
    - Uppercase Letters (A-Z) 
    - Lowercase Letters (a-z) 
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
  */
  const result = /^[A-Za-z0-9_.]+$/.exec(username)
  const valid = !!result //!! converts array object to boolean (true if it exists)
  return valid
}

const userSchema = mongoose.Schema({
  username: {
    type: String,
    validate: [
      { validator: (username) => isUserNameValid(username), msg: 'username must contain only letters, numbers, _ and .' },
      { validator: (username) => username.length <= 20, msg: 'username must be 20 characters at maximum'}
    ]
  },
  name: String,
  passwordHash: String,
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User