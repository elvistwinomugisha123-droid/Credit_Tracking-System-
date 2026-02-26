import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";

const router: RouterType = Router();

router.use(authenticate);

// POST   /api/credits
// GET    /api/credits
// GET    /api/credits/:id
// PATCH  /api/credits/:id
// All routes to be implemented

router.get("/", (_req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
