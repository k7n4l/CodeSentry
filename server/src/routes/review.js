import express from "express";
import {
  reviewCode,
  getReviewById,
  getReviewHistory,
} from "../services/reviewService.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { strictLimiter } from "../middleware/rateLimiter.js";
import  Review from '../models/reviewSchema.js'

const router = express.Router();

router.use(authenticate);

router.post("/", strictLimiter, async (req, res, next) => {
  try {
    const { code, language } = req.body;

    const result = await reviewCode(code, language, null, req.userId);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/history", async (req, res) => {
  try {
    const reviews = await getReviewHistory(req.userId);
    res.json(reviews);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failes to fetch history" });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const review = await getReviewById(req.params.id, req.userId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id',async (req,res,next)=>{
  try{
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId:req.userId
    });
    if(!review){
      return res.status(404).json({error:'Review not found'});
    }
    res.json({
      success:true,
      message:'Review deleted'
    })
  }catch(error){
    next(error);
  };
});

export default router;
