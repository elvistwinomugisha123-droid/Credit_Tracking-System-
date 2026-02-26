import { Router, type Router as RouterType } from "express";

const router: RouterType = Router();

// POST /api/auth/login — to be implemented
router.post("/login", (_req, res) => {
  res.json({ success: true, data: { message: "Auth route placeholder" } });
});

export default router;
