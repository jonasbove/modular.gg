import express from 'express'
import compile from './compiler/compileJSON.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import verifyToken from '../shared/authentication/verifyJWTToken.js'
import { botManager } from './botManager.js'

dotenv.config({ path: '../.env' })
const app = express()

app.use(express.json())
app.use(cookieParser())

let botMan = new botManager()

app.post('/addJSON', async (req, res) => {
  console.log("Got json request")
  const userData = await verifyToken(req)
  const botToken = userData.discordBotToken

  compile(`./clients/${botToken}`, req.body)
  let bot = await botMan.addBot(botToken)
  bot.start()

  console.log("Json added")

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
