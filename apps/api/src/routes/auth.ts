import { Router, type Router as RouterType } from "express";
import { Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { login, AuthError } from "../services/auth.service";

const router: RouterType = Router();

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const result = await login(email, password);

    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error("Login error:", (error as Error).message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
