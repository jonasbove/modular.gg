import jwt from 'jsonwebtoken'

export default async function verifyToken(req) {
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