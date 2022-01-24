const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))
app.use(express.static('public'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
