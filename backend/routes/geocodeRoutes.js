import express from "express";
import { autosuggest } from "../utils/ors.js";

const router = express.Router();

router.get("/suggest", async (req, res) => {
  try {
    const { q } = req.query;
    const list = await autosuggest(q);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: "Suggest failed" });
  }
});

export default router;
