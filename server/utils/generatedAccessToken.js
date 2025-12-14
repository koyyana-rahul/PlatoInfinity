import jwt from "jsonwebtoken";
export default function generatedAccessToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "2h",
  });
}
