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

export default router;
