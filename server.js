import express from 'express'
import { userAuth, verifyJWT } from './userAuth.js'

const app = express()

app.use(userAuth)
app.use(express.static("public"));

app.listen(3000, () => {
  console.log('UserAuth started')
})