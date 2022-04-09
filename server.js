import express from 'express'
import { userAuth, verifyJWT } from './authentication/userAuth.js'
import { discordAuth } from './authentication/discordAuth.js'
import { settings } from './settings.js'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
dotenv.config()

const app = express()
const publicResources = './public'

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(userAuth, settings, discordAuth)

app.get('/', (req, res) => {
  res.sendFile('frontpage.html', { root: publicResources })
})

app.get('/register', (req, res) => {
  res.sendFile('register.html', { root: publicResources })
})

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: publicResources })
})

app.get('/settings', verifyJWT, (req, res) => {
  res.sendFile('settings.html', { root: publicResources })
})

app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/assets', express.static('public/assets'));

app.listen(process.env.PORT, () => {
  console.log(`The server has started on port ${process.env.PORT}`)
})
