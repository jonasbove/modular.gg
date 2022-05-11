import crypto from 'crypto'

export default function hashPassword(password, salt) {
  if (!password || !salt) return
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
}