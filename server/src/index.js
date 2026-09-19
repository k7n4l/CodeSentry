import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import mongoose from "mongoose";
import reviewRouter from "./routes/review.js";
import {connectDB} from "./configs/db.js"
import uploadRouter from "./routes/upload.js"
import authRouter from "./routes/auth.js"
import { CodeTooLargeError } from "./services/reviewService.js";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/review", reviewRouter);
app.use("/upload", uploadRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large (max 3MB)" });
    }

    return res.status(400).json({ error: err.message || "File upload error" });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (err instanceof mongoose.Error.ValidationError || (err && err.name === "ValidationError" && err.statusCode === 400)) {
    if (err.errors) {
      const messages = Object.values(err.errors).map((fieldError) => fieldError.message);
      return res.status(400).json({ error: messages.join("; ") || "Validation failed" });
    }

    return res.status(400).json({ error: err.message || "Validation failed" });
  }

  if (err instanceof CodeTooLargeError || err.name === "CodeTooLargeError") {
    return res.status(400).json({ error: err.message || "Code too large (max 10000 chars)" });
  }

  if (err && err.code === 11000) {
    return res.status(409).json({ error: "Email already registered" });
  }

  return res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
