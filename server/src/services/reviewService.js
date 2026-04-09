import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

export const reviewCode = async (code, language = 'code') => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `Review this ${language} for security vulnerabilities:\n\n${code}`
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
  });

  return {
    review: completion.choices[0].message.content,
    timestamp: new Date().toISOString()
  };
};