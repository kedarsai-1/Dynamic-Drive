import express from "express";
import { autosuggest } from "../utils/ors.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/suggest", auth, async (req, res) => {
  try {
    const { text } = req.query;
    const results = await autosuggest(text);
    res.json(results);
  } catch (err) {
    console.error("Suggest error", err);
    res.status(500).json({ error: "Autosuggest failed" });
  }
});

export default router;
