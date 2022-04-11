import jwt from 'jsonwebtoken'

export default function authenticateUserWithCookie(res, user, next) {
  return new Promise((resolve, reject) => {
    jwt.sign(user, process.env.JWT_PRIVATE_KEY, (err, token) => {
      if (err) {
        return res.sendStatus(403)
      }

      console.log('hej')

      res.cookie('authorization', token, {expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), httpOnly: true}) // cookie expires in 7 days

      resolve(res)
    })
  })
}