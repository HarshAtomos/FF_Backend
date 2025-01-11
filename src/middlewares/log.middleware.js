import prisma from "../db/prisma.js";
import axios from "axios";

export const logActivity = async (req, user, status) => {
  try {
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const { data } = await axios.get(`http://ip-api.com/json/${ipAddress}`);
    const dateTime = new Date();
    const date = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, "0")}-${String(dateTime.getDate()).padStart(2, "0")}`;
    const time = `${String(dateTime.getHours()).padStart(2, "0")}:${String(dateTime.getMinutes()).padStart(2, "0")}:${String(dateTime.getSeconds()).padStart(2, "0")}`;
    const isp = data?.isp || "Unknown";
    const org = data?.org || "Unknown";
    const city = data?.city || "Unknown";
    const state = data?.regionName + " " + data?.region || "Unknown";
    const country = data?.country + " " + data?.countryCode || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dateTime,
        date,
        time,
        status,
        ipAddress,
        isp,
        org,
        city,
        state,
        country,
        userAgent,
      },
    });
  } catch (err) {
    console.error(err);
    throw new Error("Failed to log activity");
  }
};
