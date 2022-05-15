import jwt from "jsonwebtoken";

export default async function verifyToken(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies["authorization"];
    if (token) {
      jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, userData) => {
        if (err) {
          console.log("Rejected 001!");
          reject();
        } else {
          resolve(userData);
        }
      });
    } else {
      // console.log("The user is not logged in!")
      reject();
    }
  });
}
