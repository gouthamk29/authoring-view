import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import cors from "cors";
import connectDB from "./utils/db";
const PORT = process.env.PORT || 8000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5173;

const app = express();

app.use(express.json());

try {
  connectDB();
} catch (error) {
  console.error(error);
}

app.use(cors());

app.use("/api/profile", userRoute);

app.use("/api/auth", authRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`application is running on port ${PORT}`);
});
