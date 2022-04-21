import express from 'express'
import compile from './compiler/compileJSON.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import verifyToken from '../shared/authentication/verifyJWTToken.js'

dotenv.config({ path: '../.env' })
const app = express()

app.use(express.json())
app.use(cookieParser())

app.post('/addJSON', (req, res) => {
  const userData = await verifyToken(req)
  const botToken = userData.discordBotToken

  res.status(200)

  compile(`./clients/${botToken}`, req.body.name ?? 'test', req.body.nodes)

  res.status(200).json({ result: 'JSON added!' })
})

app.get('/startBot', async (req, res) => {
  const userData = await verifyToken(req)
  const botToken = userData.discordBotToken  

  /*const botFunctions = require('./results/test.js')

  botFunctions.forEach((func) => {
    func()
  })

  res.status(200).json({ result: "Bot started" })*/
})

try {
  app.listen(process.env.BACKEND_PORT)
  console.log(`Backend started on port ${process.env.BACKEND_PORT}.`)
} catch (err) {
  console.log(`There was an error ${err}`)
}
