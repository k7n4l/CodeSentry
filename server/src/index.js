import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import mongoose from "mongoose";
import helmet from "helmet";
import reviewRouter from "./routes/review.js";
import {connectDB} from "./configs/db.js"
import uploadRouter from "./routes/upload.js"
import authRouter from "./routes/auth.js"
import { CodeTooLargeError } from "./services/reviewService.js";

dotenv.config();

const requiredEnvVars = ["PORT", "MONGODB_URI", "JWT_SECRET", "GROQ_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key] || !String(process.env[key]).trim());

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missingEnvVars.join(", ")}. Check server/.env and set them before starting the app.`);
}

const DEFAULT_CLIENT_ORIGIN = "http://localhost:5173";
const allowedOrigins = (process.env.CLIENT_ORIGIN || DEFAULT_CLIENT_ORIGIN)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  throw new Error("CLIENT_ORIGIN must include at least one allowed origin.");
}

const app = express();

connectDB();

app.use(helmet());
// Keep JSON payloads well below MAX_CODE_LENGTH in reviewService.js so oversized code is rejected before Groq billing or analysis work begins.
app.use(express.json({ limit: "200kb" }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS policy"));
  },
  credentials: true,
}));

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

  if (err && err.message === "Origin not allowed by CORS policy") {
    return res.status(403).json({ error: "Origin not allowed" });
  }

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

app.listen(Number(process.env.PORT), () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
