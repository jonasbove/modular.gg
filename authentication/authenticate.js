import jwt from 'jsonwebtoken'

export default function authenticateUser(res, user) {
  jwt.sign(user, process.env.JWT_PRIVATE_KEY, (err, token) => {
    if (err) {
      return res.sendStatus(403)
    }

    res.cookie('authorization', token)

    return res.status(200).redirect('/settings')
      //.json({ message: 'You are authenticated', token: `Bearer ${token}` })
  })
}