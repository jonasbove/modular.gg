import db from "../db/db.js"
import hashPassword from '../encryption/hashing.js'

export default async function registerUser(req, res) {
  const formData = req.body

  if (!formData.name) {
    return res.status(406).json({ message: 'Invalid name.' })
  }
  
  if (await db.findOne('users', { email: formData.email })) {
    return res.status(409).json({ message: 'User already existing.' })
  }

  if (formData.password !== formData.confirmPassword) {
    return res.status(422).json({ message: 'Passwords are not matching!' })
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const hash = hashPassword(formData.password, salt)

  const confirmedData = {
    name: formData.name,
    email: formData.email,
    hash: hash,
    salt: salt,
  }

  try {
    const user = await db.insertOne('users', confirmedData)

    return authenticateUser(res, user)
      .then(res => res.json({ message: 'Succesfully created an account' }))
  } catch (err) {
    res.sendStatus(403)

    return res
      .status(500)
      .json({ message: 'Something very bad happenend. Errorcode: 20394' })
  }
}