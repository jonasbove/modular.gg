const express = require('express')
const app = express()
const compile = require('./compiler/compileJSON.js')

app.use(express.json())

app.post('/addJSON', (req, res) => {
  res.status(200)

  compile('test', req.body)

  res.json({ result: 'JSON added!' })
})

app.get('/startBot', (req, res) => {
  const botFunctions = require('./results/test.js')

  botFunctions.forEach((func) => {
    func()
  })

  res.status(200).json({ result: "Bot started" })
})

try {
  app.listen(3000)
  console.log('Server has started')
} catch (err) {
  console.log(`There was an error ${err}`)
}
