import { db } from '../db/db.js'

export default async function updateSettings(req, res) {
  const token = req.body.token
  console.log(req.jwtData)
  
  if (!token) req.status(406).json({ message: "Token is not valid" })
  
  await db.updateOne('users', { email: req.jwtData.email }, { $set: {discordBotToken: token} })

  return res.status(200).json( {message: "Discord Bot Token inserted into DB"} )
}