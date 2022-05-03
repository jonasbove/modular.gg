export default function userData(req, res) {
  // We do not return req.userData because it contains the password hashed and other info.
  return res.json({
    email: req.userData.email,
    name: req.userData.name
  })
}