import express from 'express'
import { db } from '../db/db.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import authenticateUser from './authenticate.js'

const userAuth = express.Router()

userAuth.post('/login', async function (req, res) {
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

  authenticateUser(res, userFound)
})

userAuth.post('/register', async function (req, res) {
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

    authenticateUser(res, user)

    return res.status(201).json({ message: 'Succesfully created an account' })
  } catch (err) {
    res.sendStatus(403)

    return res
      .status(500)
      .json({ message: 'Something very bad happenend. Errorcode: 20394' })
  }
})

function hashPassword(password, salt) {
  if (!password || !salt) return
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
}

function verifyJWT(req, res, next) {
  const token = req.cookies['authorization']

  if (token) {
    jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
      if (err) {
        res.sendStatus(401)
      } else {
        req.jwtData = authData
      }
    })

    next()
  } else {
    res.sendStatus(401)
  }
}

export { userAuth, verifyJWT }
