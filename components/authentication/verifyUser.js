import jwt from 'jsonwebtoken'

export default function verifyUser(req, res, next) {
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