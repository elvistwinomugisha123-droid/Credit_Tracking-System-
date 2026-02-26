import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";

const router: RouterType = Router();

router.use(authenticate);

// GET /api/dashboard — to be implemented
router.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "Dashboard route placeholder" } });
});

export default router;
