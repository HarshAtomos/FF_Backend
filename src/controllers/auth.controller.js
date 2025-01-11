import prisma from "../db/prisma.js";
import { logActivity } from "../middlewares/log.middleware.js";
import { hashPassword, verifyPassword } from "../utils/bcrypt.utils.js";
import { generateAccessToken } from "../utils/jwt.utils.js";
import { validateRoleCreation } from "../utils/validation.utils.js";

/*
 @desc Login user
 @route POST /api/v1/auth/login/
 @access anyone
*/
export const login = async (req, res) => {
  try {
    const { username, password, roleId } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const correctPassword = await verifyPassword(password, user.password);
    if (!correctPassword || !(roleId === user.roleId)) {
      await logActivity(req, user, "Login Failed");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await logActivity(req, user, "Login Success");

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    const accessToken = generateAccessToken(user);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
      },
    });

    res
      .status(200)
      .json({ message: "Logged in successfully", data: accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to Login" });
  }
};

/*
 @desc Create user
 @route POST /api/v1/auth/create/
 @access everyone except players
*/
export const create = async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      firstName,
      lastName,
      timeZone,
      roleName,
      exposure,
      commission,
    } = req.body;
    const parentId = req.user.userId;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!username || !password || !roleName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parentUser = await prisma.user.findUnique({
      where: { id: parentId },
    });
    if (!parentUser) {
      return res.status(404).json({ error: "Parent user not found" });
    }

    const allowedRoles = {
      1: ["SUPER_ADMIN", "ADMIN"],
      2: ["MASTER"],
      3: ["AGENT"],
      4: ["PLAYER"],
    };

    if (!allowedRoles[parentUser.roleId]?.includes(roleName)) {
      return res
        .status(403)
        .json({ error: "You do not have permission to create this role" });
    }

    const roleValidation = validateRoleCreation(roleName, {
      exposure,
      commission,
    });
    if (!roleValidation.isValid) {
      return res.status(400).json({ error: roleValidation.error });
    }

    const hashedPassword = await hashPassword(password);

    const role = await prisma.role.findFirst({ where: { roleName } });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        timeZone,
        roleId: role.id,
        parentId,
        exposure: roleName === "player" ? exposure : null,
        commission: roleName === "player" ? commission : null,
      },
    });

    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

/*
 @desc Logout User
 @route DELETE /api/v1/auth/logout/
 @access authenticated users
*/
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    await prisma.session.delete({
      where: { token },
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

/*
 @desc Create Roles
 @route POST /api/v1/auth/create-roles/
 @access only SUPER_ADMIN
*/
export const createRoles = async (req, res) => {
  try {
    const { roleName, shortName } = req.body;

    if (req.user.roleId !== 1) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    if (!roleName || !shortName) {
      return res
        .status(400)
        .json({ message: "Name and Short Name are required" });
    }

    const existingRole = await prisma.role.findFirst({
      where: { OR: [{ roleName }, { shortName }] },
    });

    if (existingRole) {
      return res
        .status(400)
        .json({ message: "Role with this name already exists" });
    }

    const role = await prisma.role.create({
      data: {
        roleName,
        shortName,
      },
    });

    res.status(201).json({ message: "Role created successfully", data: role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create role" });
  }
};
