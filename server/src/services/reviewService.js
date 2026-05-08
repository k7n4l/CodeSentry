import Groq from "groq-sdk";
import Review from "../models/reviewSchema.js";

let groq = null;

const getGroqClient = () => {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }
    groq = new Groq({ apiKey });
  }
  return groq;
};

const SYSTEM_PROMPT = `You are CodeSentry, an expert security code reviewer. Analyze code for security vulnerabilities before deployment.

CRITICAL: Your response MUST start with these two lines in EXACTLY this format:
SEVERITY: [Critical/High/Medium/Low/Safe]
TITLE: [Brief description of what this code does or main security concern]

Then provide detailed analysis:

## VULNERABILITIES FOUND:

### 1. [Vulnerability Name] - [Severity Level]
**Location:** [Specific line or code snippet]
**Risk:** [Why it's dangerous]
**Fix:** [How to fix it with code example]

### 2. [Next vulnerability if any]
...

## RECOMMENDATIONS:
- [Additional security best practices]
- [Code quality improvements]

## SUMMARY:
[Brief overall assessment]

---

Focus on:
- SQL Injection, XSS, CSRF
- Authentication & Authorization flaws
- Hardcoded secrets, insecure storage
- Command injection, path traversal
- Input validation issues
- Cryptographic weaknesses
- Insecure dependencies

If code is safe, still provide SEVERITY and TITLE, then explain why it's secure.`;

// More flexible extraction - checks multiple line formats
const extractSeverity = (reviewText) => {
  // Try multiple patterns
  const patterns = [
    /SEVERITY:\s*(Critical|High|Medium|Low|Safe)/i,
    /##\s*SEVERITY:\s*(Critical|High|Medium|Low|Safe)/i,
    /Severity Level:\s*(Critical|High|Medium|Low|Safe)/i,
  ];

  for (const pattern of patterns) {
    const match = reviewText.match(pattern);
    if (match) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    }
  }

  // Fallback: analyze content for severity keywords
  if (/critical|severe|dangerous/i.test(reviewText)) return "Critical";
  if (/high risk|serious/i.test(reviewText)) return "High";
  if (/safe|secure|no vulnerabilities/i.test(reviewText)) return "Safe";

  return "Medium";
};

const extractTitle = (reviewText) => {
  // Try multiple patterns
  const patterns = [/TITLE:\s*(.+)/i, /##\s*TITLE:\s*(.+)/i, /Title:\s*(.+)/i];

  for (const pattern of patterns) {
    const match = reviewText.match(pattern);
    if (match) {
      return match[1].trim().replace(/\*\*/g, ""); // Remove markdown bold
    }
  }

  // Fallback: use first line if it looks like a title
  const firstLine = reviewText.split("\n")[0].trim();
  if (firstLine.length < 100 && firstLine.length > 10) {
    return firstLine.replace(/^#+\s*/, "").replace(/\*\*/g, "");
  }

  return "Code Security Review";
};

export const reviewCode = async (
  code,
  language = "javascript",
  fileName = null,
  userId
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
        content: `Review this ${language} code for security vulnerabilities:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });

  const reviewText = completion.choices[0].message.content;

  console.log("=== AI RESPONSE ===");
  console.log(reviewText.substring(0, 300)); // Debug: print first 300 chars
  console.log("==================");

  const severity = extractSeverity(reviewText);
  const title = extractTitle(reviewText);

  console.log("Extracted Severity:", severity);
  console.log("Extracted Title:", title);

  // Save to MongoDB
  const reviewDoc = await Review.create({
    userId,
    code,
    language,
    review: reviewText,
    title: fileName || title,
    fileName,
    severityLevel: severity,
    timestamp: new Date(),
  });

  return {
    id: reviewDoc._id,
    code: reviewDoc.code,
    review: reviewText,
    title: reviewDoc.title,
    fileName: reviewDoc.fileName,
    severityLevel: severity,
    language: reviewDoc.language,
    timestamp: reviewDoc.timestamp,
  };
};

export const getReviewHistory = async (userId) => {
  const reviews = await Review.find({ userId })
    .sort({ timestamp: -1 })
    .limit(50)
    .select("title language fileName severityLevel timestamp _id");

  return reviews;
};

export const getReviewById = async (id, userId) => {
  const review = await Review.findOne({ _id: id, userId });
  return review;
};
