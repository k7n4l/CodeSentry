import express from "express";
import {
  reviewCode,
  getReviewById,
  getReviewHistory,
} from "../services/reviewService.js";
import { authenticate } from "../middleware/authMiddleware.js";
import  Review from '../models/reviewSchema.js'

const router = express.Router();

router.use(authenticate);

router.post("/", async (req, res) => {
  try {
    const { code, language } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({ error: "No code provided" });
    }

    if (code.length > 10000) {
      return res.status(400).json({ error: "Code too large (max 10KB)" });
    }

    const userIP = req.ip || req.connection.remoteAddress;

    const result = await reviewCode(code, language, null, req.userId);

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to review code" });
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

router.get("/:id", async (req, res) => {
  try {
    const review = await getReviewById(req.params.id, req.userId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failes to fetch history" });
  }
});

router.delete('/:id',async (req,res)=>{
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
    console.error('Error: ',error)
    res.status(500).json({error:'Failed to delete review'})
  };
});

export default router;
