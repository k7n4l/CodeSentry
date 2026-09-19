import mongoose from "mongoose";

export const ALLOWED_REVIEW_LANGUAGES = ["javascript", "python", "java", "php", "sql", "c", "cpp", "go", "rust", "other"];

const reviewSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ALLOWED_REVIEW_LANGUAGES,
  },
  review: {
    type: String,
    required: true,
  },
  title:{
    type: String,
    default: "Untitled Review",
  },
  fileName: {
    type: String,
    default: null,
  },  
  severityLevel: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low', 'Safe'],
    default: 'Medium'
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});
export default mongoose.model("Review",reviewSchema);
