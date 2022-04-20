const express = require('express')
const app = express()
const compile = require('./compiler/compileJSON.js')

app.use(express.json())

app.post('/addJSON', (req, res) => {
  console.log('addjson get method')
  res.status(200)

  compile('test', req.body)

  res.json({ result: 'JSON added!' })
})

app.get('/startBot', (req, res) => {
  console.log('startbot get method')
  const botFunctions = require('./results/test.js')

  

  botFunctions.forEach((func) => {
    func()
  })

  res.status(200).json({ result: "Bot started" })
})

try {
  app.listen(process.env.BACKEND_PORT)
  console.log(`Server has started on port ${process.env.BACKEND_PORT}`)
} catch (err) {
  console.log(`There was an error ${err}`)
}
