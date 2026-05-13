import express from "express";
import type { NextFunction, Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responses.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schema/AuthSchema.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

const router = express.Router();

const generateToken = (user) => {
  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user);

    res.status(200).json({ token });
  },
);

router.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const { email, password } = req.body;

    const isExistingEmail = await User.findOne({ email });
    if (isExistingEmail) {
      return errorResponse(res, 400, {
        success: false,
        message: "Email already Exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Successfully Registered",
      token: token,
    });
  },
);

export default router;
