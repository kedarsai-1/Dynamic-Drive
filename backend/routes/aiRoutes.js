import express from "express";
import { chatWithAI } from "../controllers/aiController.js";
// leave public or protect with auth if you want
const router = express.Router();
router.post("/chat", chatWithAI);
export default router;
