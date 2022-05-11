export default function userData(req, res) {
  // We do not return req.userData because it contains the password hashed and other info.
  return res.json({
    email: req.userData.email,
    name: req.userData.name,
    client_id: req.userData.client_id,
    client_secret: req.userData.client_secret,
    guild_id: req.userData.guild_id,
    token: req.userData.token
  })
}