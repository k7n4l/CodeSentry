import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  code: {
    type: String,
    require: true,
  },
  language: {
    type: String,
    require: true,
    enum: ["javascript", "python", "java", "php", "sql", "other"],
  },
  review: {
    type: String,
    require: true,
  },
  fileName: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userIP: {
    type: String,
    default: null,
  }
});
export default mongoose.model("Review",reviewSchema);
