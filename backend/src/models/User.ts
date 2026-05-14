import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileUrl: { type: String, required: false, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
