import { db } from '../db/db.js'
import authenticateUser from './authenticate.js'
import { hashPassword } from '../encryption/hashing.js'

export default async function loginUser(req, res) {
  let invalidPassword = false
  const formData = req.body

  const userFound = await db.findOne('users', { email: formData.email })

  // hasing the password we've got from the website using the salt
  const formPasswordHashed = hashPassword(formData.password, userFound?.salt)

  // comparing the now hashed password we've got from the website with the hash in the databse
  if (formPasswordHashed !== userFound?.hash) invalidPassword = true

  if (!userFound || invalidPassword) {
    return res.status(401).json({ message: 'Username or password are wrong.' })
  }

  // Yes, user is authenticated with correct email and password

  return authenticateUser(res, userFound)
    .then(res => res.json({ message: 'Succesfully logged into your account' }))
}