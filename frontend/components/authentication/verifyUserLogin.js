import jwt from 'jsonwebtoken'

// verify the user is logged in
async function verifyUserLoggedIn(req, res, next) {
  return verifyToken(req)
    .then(result => req.userData = result)
    .then(() => next())
    .catch(err => res.redirect('./login'))
}

// if the user is logged in then redirect
async function redirectIfLoggedIn(req, res, next) {
  verifyToken(req)
    .then(() => res.redirect('./settings'))
    .catch(() => next())
}

async function verifyToken(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies['authorization']
  
    if (token) {
      jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, userData) => {
        if (err) {
          reject()
        } else {
          resolve(userData)
        }
      })
    } else {
      reject()
    }
  })
}

export { verifyUserLoggedIn, redirectIfLoggedIn }