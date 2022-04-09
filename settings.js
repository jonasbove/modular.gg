import express from 'express'
import { verifyJWT } from './authentication/userAuth.js'
import { db } from './db/db.js'

const settings = express.Router()

settings.post('/settings', verifyJWT, async function (req, res) {
  const token = req.body.token
  console.log(req.jwtData)
  
  if (!token) req.status(406).json({ message: "Token is not valid" })
  
  const insertedToken = await db.updateOne('users', { email: req.jwtData.email }, { $set: {discordToken: token} })

  return res.status(200).json( {message: "Token inserted in DB"} )
})

export { settings }
