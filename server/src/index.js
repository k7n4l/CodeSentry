import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewRouter from "./routes/review.js";
import {connectDB} from "./configs/db.js"
import uploadRouter from "./routes/upload.js"

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/review", reviewRouter);
app.use("/upload", uploadRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
