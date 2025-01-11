import prisma from "../db/prisma.js";

/*
 @desc Activity Logs
 @route GET /api/v1/profile/activity-logs/
 @access authenticated users
*/
export const activityLogs = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) {
      return res.status(401).json({ message: "User not available" });
    }

    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        dateTime: "desc",
      },
    });

    return res.status(200).json({
      message: "Activity Logs loaded successfully",
      data: activityLogs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't load Activity Logs" });
  }
};
