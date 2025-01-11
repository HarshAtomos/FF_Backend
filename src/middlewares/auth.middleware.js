import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";

export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "Forbidden", error: error.message });
  }
};
