import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isStrongPassword, isValidEmail } from '../utils/validators.js';

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '7d';

const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
//Registration 
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all fields' });
        }

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ error: 'Please provide a valid email address' });
        }

        const passwordCheck = isStrongPassword(password);
        if (!passwordCheck.valid) {
            return res.status(400).json({ error: passwordCheck.message });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if ((existingUser)) {
            return res.status(400).json({ error: 'Email already registered' })
        }
        const user = await User.create({ name, email: normalizedEmail, password })

        const token = generateToken(user._id)

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Registration Error:', error)
        res.status(500).json({ error: 'Registration Failed' })
    }
}

//Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' })
        }

        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid Credentials' })
        }

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}
    //for token verification
    export const getCurrentUser = async (req, res) => {
        try {
            const user = await User.findById(req.userId).select('-password');

            if (!user) {
                return res.status(400).json({ error: 'User Not Found' });
            }
            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }


    }
