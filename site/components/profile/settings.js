import db from "../db/db.js";

export default async function updateSettings(req, res) {
  const token = req.body.token;
  const client_id = req.body.client_id;
  const client_secret = req.body.client_secret;
  const guild_id = req.body.guild_id;

  if (!token) return res.status(406).json({ message: "Token is not valid" });

  await db.updateOne(
    "users",
    { email: req.userData.email },
    {
      $set: {
        token: token,
        client_id: client_id,
        client_secret: client_secret,
        guild_id: guild_id,
      },
    }
  );

  return res
    .status(200)
    .json({ message: "Discord Bot Token inserted into DB" });
}
