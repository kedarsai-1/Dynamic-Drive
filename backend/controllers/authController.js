import jwt from "jsonwebtoken";
import User from "../models/User.js";

const maxAge = 7 * 24 * 60 * 60; // 7 days

// ✅ Create JWT
const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

// ✅ REGISTER

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ error: "All fields required" });

    let existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const user = await User.create({ name, email, password, role });

    // ✅ Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,
    });

    // ✅ Store JWT in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: maxAge * 1000,
    });

    return res.json({
      message: "Registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ LOGIN

// 7 days

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // IMPORTANT: include +password so we can compare
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: maxAge });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",   // dev
      secure: false,     // dev
      maxAge: maxAge * 1000,
    });

    // Do not return password
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({ message: "Logged in", user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ GET LOGGED-IN USER
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ REFRESH TOKEN (Optional; can skip logic or enhance later)
export const refresh = async (req, res) => {
  try {
    const token = createToken({ id: req.user.id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: maxAge * 1000,
    });

    res.json({ message: "Refreshed" });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
