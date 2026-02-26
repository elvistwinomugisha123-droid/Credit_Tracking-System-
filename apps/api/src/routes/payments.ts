import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";

const router: RouterType = Router();

router.use(authenticate);

// POST   /api/payments
// GET    /api/payments/credit/:creditId
// All routes to be implemented

router.get("/credit/:creditId", (_req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
