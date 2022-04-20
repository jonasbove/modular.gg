import db from '../db/db.js'

export default async function updateSettings(req, res) {
  const token = req.body.token
  
  if (!token) req.status(406).json({ message: "Token is not valid" })
  
  await db.updateOne('users', { email: req.userData.email }, { $set: {discordBotToken: token} })

  console.log('nice')

  return res.status(200).json( {message: "Discord Bot Token inserted into DB"} )
}