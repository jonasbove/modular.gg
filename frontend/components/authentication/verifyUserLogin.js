import verifyToken from '../../../shared/authentication/verifyJWTToken.js'

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

export { verifyUserLoggedIn, redirectIfLoggedIn }