const express = require('express')
const app = express()

app.use(express.json())

app.post('/addJSON', (req, res) => {
  console.log(req.body)

  res.status(200)
  res.json({ pretty: 'yes' })
})

try {
  app.listen(3000)
  console.log('Server has started')
} catch (err) {
  console.log(`There was an error ${err}`)
}
