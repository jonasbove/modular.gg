import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import verifyJWT from './components/authentication/verifyUser.js'
import updateSettings from './components/profile/settings.js'
import registerUser from './components/authentication/register.js'
import loginUser from './components/authentication/login.js'
import { askDiscordPermissions, authenticateDiscord } from './components/authentication/discordAuth.js'

dotenv.config()

const app = express()
const publicResources = './public'

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(publicResources))

app.get('/', (req, res) => res.sendFile('frontpage.html', { root: publicResources }))

app.get('/register', (req, res) => res.sendFile('register.html', { root: publicResources }))
app.post('/register', registerUser)

app.get('/login', (req, res) => res.sendFile('login.html', { root: publicResources }))
app.post('/login', loginUser)

app.get('/settings', verifyJWT, (req, res) => res.sendFile('settings.html', { root: publicResources }))
app.post('/settings', verifyJWT, updateSettings)

app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/assets', express.static('public/assets'));

app.get('/ask-discord-permissions', askDiscordPermissions)
app.get('/authenticate-discord', authenticateDiscord)

app.get('*', (req, res) => res.sendFile('404.html', { root: publicResources }))

app.listen(process.env.PORT, () => {
  console.log(`The server has started on port ${process.env.PORT}`)
})
