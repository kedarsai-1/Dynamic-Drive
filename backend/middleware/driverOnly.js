export default function driverOnly(req, res, next) {
  if (req.user?.role !== "driver") {
    return res.status(403).json({ error: "Only drivers can access this" });
  }
  next();
}
