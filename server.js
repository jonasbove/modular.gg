import express from 'express'
import { userAuth, verifyJWT } from './userAuth.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const publicResources = './public'

app.use(userAuth)

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: publicResources })
})

app.get('/register', (req, res) => {
  res.sendFile('register.html', { root: publicResources })
})

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: publicResources })
})

app.get('/protected', verifyJWT, (req, res) => {
  res.sendFile('protected.html', { root: publicResources })
})

app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/assets', express.static('public/assets'));

//app.use(express.static("public"));

app.listen(process.env.PORT, () => {
  console.log(`The server has started on port ${process.env.PORT}`)
})
