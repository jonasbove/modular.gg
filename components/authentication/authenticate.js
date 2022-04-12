import jwt from 'jsonwebtoken'

export default function authenticateUserWithCookie(res, user, next) {
  return new Promise((resolve, reject) => {
    jwt.sign(user, process.env.JWT_PRIVATE_KEY, (err, token) => {
      if (err) {
        return res.sendStatus(403)
      }

      res.cookie('authorization', token)

      resolve(res)
    })
  })
}