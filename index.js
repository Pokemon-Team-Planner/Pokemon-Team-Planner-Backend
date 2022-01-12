const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.use(express.static('public'))

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
