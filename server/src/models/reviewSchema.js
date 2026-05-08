import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  
  },
  code: {
    type: String,
    require: true,
  },
  language: {
    type: String,
    require: true,
    enum: ["javascript", "python", "java", "php", "sql", "c", "cpp","go","rust", "other"],
  },
  review: {
    type: String,
    require: true,
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
  },
  userIP: {
    type: String,
    default: null,
  }
});
export default mongoose.model("Review",reviewSchema);
