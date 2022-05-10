import verifyToken from '../../../shared/authentication/verifyJWTToken.js'
import db from '../db/db.js'

// verify the user is logged in
async function verifyUserLoggedIn(req, res, next) {
  return verifyToken(req)
    .then(result => {
      req.userData = result
    })
    .then(() => next())
    .catch(err => res.redirect('./login'))
}

// if the user is logged in then redirect
async function redirectIfLoggedIn(req, res, next) {
  verifyToken(req)
    .then(() => res.redirect('./settings'))
    .catch(() => next())
}

async function getBotToken(email) {
  const userFound = await db.findOne('users', {email: email})

  return userFound.discordBotToken
}

export { verifyUserLoggedIn, redirectIfLoggedIn, getBotToken }