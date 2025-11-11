import jwt from "jsonwebtoken";

export const signAccess = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRES_IN || "15m",
  });
};

export const signRefresh = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES_IN || "7d",
  });
};

export const verifyAccess = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

export const verifyRefresh = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
