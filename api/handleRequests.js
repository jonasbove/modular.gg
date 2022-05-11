import express from 'express'
import compile from './compiler/compileJSON.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import verifyToken from '../shared/authentication/verifyJWTToken.js'
import { botManager } from './botManager.js'
import { getBotToken } from '../site/components/authentication/verifyUserLogin.js'

dotenv.config({ path: '../.env' })
const app = express()

app.use(cors({ credentials: true, origin: ['http://localhost:3000', 'https://modular.gg'] }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

let botMan = new botManager()

app.post('/addJSON', async (req, res) => {
  try {
    console.log("Got json request")
    const userData = await verifyToken(req)
    const botToken = await getBotToken(userData.email)

    if (!botToken) {
      return res.status(401).json({ result: 'Please insert the bot token first' })
    }

    compile(`./clients/${botToken}`, req.body)

    console.log("Json added")

    await botMan.bots[botToken].loadCommands()
    await botMan.bots[botToken].deployCommands()

    res.status(200).json({ result: 'JSON added!' })
  }
  catch {
    console.log("json (probably) NOT added")
  }
})

app.get('/startbot', async (req, res) => {
  try {
    const userData = await verifyToken(req)
    const botToken = await getBotToken(userData.email)

    if (!botToken) {
      return res.status(401).json({ result: 'Please insert the bot token first' })
    }

    await botMan.addBot(botToken)
    res.status(200).json({ result: 'Bot has been started' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ result: "error... error message is in console" })
  }
})


app.get('/stopbot', async (req, res) => {
  try {
    const userData = await verifyToken(req)
    const botToken = await getBotToken(userData.email)

    if (!botToken) {
      return res.status(401).json({ result: 'Please insert the bot token first' })
    }

    await botMan.stopBot(botToken)

    res.status(200).json({ result: 'Bot has been stopped' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ result: "error... error message is in console" })
  }
})

app.get('/enableCommand', async (req, res) => {
  try {
    const userData = await verifyToken(req)
    const botToken = await getBotToken(userData.email)

    if (!botToken) {
      return res.status(401).json({ result: 'Please insert the bot token first' })
    }

    botMan.bots[botToken].enableCommandByName(req.body.commandName)

    res.status(200).json({ result: `Enabled command: ${req.body.commandName}` })
  } catch (err) {
    console.log(err)
    res.status(500).json({ result: "error... error message is in console" })
  }
})

app.get('/disableCommand', async (req, res) => {
  try {
    const userData = await verifyToken(req)

    const botToken = await getBotToken(userData.email)

    if (!botToken) {
      return res.status(401).json({ result: 'Please insert the bot token first' })
    }


    botMan.bots[botToken].disableCommandByName(req.body.commandName)


    res.status(200).json({ result: `Disabled command: ${req.body.commandName}` })
  } catch (err) {
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
