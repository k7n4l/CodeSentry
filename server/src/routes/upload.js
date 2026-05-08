import express from "express";
import multer from "multer";
import { reviewCode } from "../services/reviewService.js";
import { authenticate } from "../middleware/authMiddleware.js";

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
            cb(new Error('Invalid file type. Only code files allowed.'))
        }
    }
});

router.post('/',upload.single('file'),async (req,res) =>{
    try{
        if(!req.file){
            return res.status(400).json({error: 'No file uploaded'})
        }
        const code = req.file.buffer.toString('utf-8')
        const fileName = req.file.originalname;
        const language = req.body.language ||'other'
        const userIP = req.ip ||req.connection.remoteAddress;

        const result = await reviewCode(code , language , fileName, userIP);
        res.json(result);
    }catch(error){
        console.error('Upload Error: ',error);
        res.status(500).json({error: error.message || 'Failed to process file'})
    }
});
export default router;