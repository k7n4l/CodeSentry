import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewRouter from "./routes/review.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/review", reviewRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
