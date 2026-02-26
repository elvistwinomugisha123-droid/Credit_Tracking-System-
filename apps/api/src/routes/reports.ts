import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";

const router: RouterType = Router();

router.use(authenticate);

// GET /api/reports?filter=today|week|month|custom&from=&to= — to be implemented
router.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "Reports route placeholder" } });
});

export default router;
