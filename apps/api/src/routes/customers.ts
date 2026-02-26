import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";

const router: RouterType = Router();

router.use(authenticate);

// GET    /api/customers
// POST   /api/customers
// GET    /api/customers/:id
// PATCH  /api/customers/:id
// GET    /api/customers/:id/history
// All routes to be implemented

router.get("/", (_req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
