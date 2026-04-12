import Groq from "groq-sdk";
import Review from "../models/reviewSchema.js";

let groq = null;

const getGroqClient = () => {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

const SYSTEM_PROMPT = `You are CodeSentry, an expert security code reviewer. Your job is to analyze code for security vulnerabilities before deployment.

Focus on:
- SQL Injection vulnerabilities
- XSS (Cross-Site Scripting) attacks
- Authentication & Authorization flaws
- Insecure data storage (hardcoded secrets, passwords)
- CSRF vulnerabilities
- Command injection risks
- Insecure dependencies
- API security issues
- Input validation problems
- Cryptographic weaknesses

For each issue found:
1. Severity level (Critical/High/Medium/Low)
2. Exact line or code snippet with the issue
3. Why it's dangerous
4. How to fix it

If code is secure, say so clearly. Be direct and actionable.`;

export const reviewCode = async (
  code,
  language = "javascript",
  filename = null,
  userIP = null,
) => {
  const groqClient = getGroqClient();
  const completion = await groqClient.chat.completions.create({
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Review this ${language} for security vulnerabilities:\n\n${code}`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });

  const reviewText = completion.choices[0].message.content;

  const ReviewDoc = await Review.create({
    code,
    language,
    review: reviewText,
    fileName: filename,
    userIP,
    timestamp: new Date(),
  });

  return {
    id: ReviewDoc._id,
    review: reviewText,
    timestamp: ReviewDoc.timestamp || ReviewDoc.createdAt,
  };
};

export const getReviewById = async (id) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new Error("Review not found");
  }
  // Ensure timestamp is properly included
  return {
    _id: review._id,
    code: review.code,
    language: review.language,
    review: review.review,
    fileName: review.fileName,
    timestamp: review.timestamp,
    userIP: review.userIP,
  };
};

export const getReviewHistory = async (id) => {
  const review = await Review.find()
    .sort({ timestamp: -1 })
    .limit(50)
    .select("language fileName timestamp _id");

  return review;
};
