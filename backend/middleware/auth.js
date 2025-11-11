import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    req.user = user;   // ✅ VERY IMPORTANT
    next();
  } catch (err) {
    console.error("Auth middleware:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default auth;
