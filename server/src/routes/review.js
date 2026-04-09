import express from 'express';
import { reviewCode } from '../services/reviewService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    // Validation
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    if (code.length > 10000) {
      return res.status(400).json({ error: 'Code too large (max 10KB)' });
    }

    // Call service
    const result = await reviewCode(code, language);

    // Return response
    res.json(result);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to review code' });
  }
});

export default router;