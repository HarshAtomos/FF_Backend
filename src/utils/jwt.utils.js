import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role.shortName, time: new Date() },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );
};
