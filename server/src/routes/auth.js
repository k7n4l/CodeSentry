import express from 'express'
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import Review from '../models/reviewSchema.js';

const router = express.Router();

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, getCurrentUser);

//for profile update
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

//change password
router.put('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.userId)
        const isValid = await user.comparePassword(currentPassword);

        if (!isValid) {
            return res.status(401).json({ error: 'Current Passwrod is incorrect' })
        }
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Delete account
router.delete('/account', authenticate, async (req, res) => {
  try {
      await Review.deleteMany({ userId: req.userId });
    await User.findByIdAndDelete(req.userId);
    
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});
export default router;