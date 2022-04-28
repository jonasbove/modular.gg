import express from 'express'
import compile from './compiler/compileJSON.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import verifyToken from '../shared/authentication/verifyJWTToken.js'
import { botManager } from './botManager.js'
import { getBotToken } from '../frontend/components/authentication/verifyUserLogin.js'

dotenv.config({ path: '../.env' })
const app = express()

app.use(cors({credentials: true,  origin: ['http://localhost:3000', 'https://modular.gg']}))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

let botMan = new botManager()

app.post('/addJSON', async (req, res) => {
  console.log("Got json request")
  const userData = await verifyToken(req)
  console.log(userData)
  const botToken = userData.discordBotToken

  //return console.log(botToken)

  compile(`./clients/${botToken}`, req.body)
  //let bot = await botMan.addBot(botToken)
  //bot.start()

  console.log("Json added")

  res.status(200).json({ result: 'JSON added!' })
})

app.get(['/startbot', '/stopbot', '/restartbot'], async (req, res) => {
  try {
    const userData = await verifyToken(req)
    const botToken = await getBotToken(userData.email)

    let bot = await botMan.addBot(botToken) // just for testing

    switch (req.path) {
      case '/startbot':
        await botMan.startBot(botToken)
        break
      case '/stopbot':
        await botMan.stopBot(botToken)
        break
      case '/restartbot':
        await botMan.restartBot(botToken)
        break;
    }

    res.status(200).json({ result: "Success" })
  } catch(err) {
    console.log(err)
    res.status(500).json({ result: "error... error message is in console" })
  }
})

try {
  app.listen(process.env.BACKEND_PORT)
  console.log(`Backend started on port ${process.env.BACKEND_PORT}.`)
} catch (err) {
  console.log(`There was an error ${err}`)
}
