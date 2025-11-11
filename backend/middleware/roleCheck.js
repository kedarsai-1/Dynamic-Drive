export const driverOnly = (req, res, next) => {
  if (req.user.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can perform this action" });
  }
  next();
};
