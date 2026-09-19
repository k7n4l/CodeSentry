import express from "express";
import multer from "multer";
import { reviewCode } from "../services/reviewService.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
router.use(authenticate);

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
    fileFilter : (req, file, cb) => {
        const allowedextension = ['.js', '.py', '.java', '.php', '.sql', '.c', '.cpp', '.go', '.rs', '.txt']
        const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'))
    
        if(allowedextension.includes(ext)){
            cb(null,true);
        }else{
            const error = new Error('Invalid file type. Only code files allowed.');
            error.name = 'ValidationError';
            error.statusCode = 400;
            cb(error);
        }
    }
});

router.post('/', strictLimiter, upload.single('file'), async (req,res,next) =>{
    try{
        if(!req.file){
            return res.status(400).json({error: 'No file uploaded'})
        }
        const code = req.file.buffer.toString('utf-8')
        const fileName = req.file.originalname;
        const language = req.body.language ||'other'

        const result = await reviewCode(code, language, fileName, req.userId);
        res.json(result);
    }catch(error){
        next(error);
    }
});
export default router;