import jwt from "jsonwebtoken";
export default function genertedRefreshToken(userId) {
  return jwt.sign(
    { _id: String(userId) },
    process.env.SECRET_KEY_REFRESH_TOKEN,
    { expiresIn: "7d" }
  );
}
