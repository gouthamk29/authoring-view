import express from "express";
import type { Response, NextFunction } from "express";
import User from "../models/User";
import { protect, type AuthRequest } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user?.id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/",
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, profileUrl } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
        {
          ...(name !== undefined && { name }),
          ...(profileUrl !== undefined && { profileUrl }),
        },
        {
          new: true,
          runValidators: true,
        },
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
