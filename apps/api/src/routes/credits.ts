import { Router, type Router as RouterType } from "express";
import { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createCredit,
  getAllCredits,
  getCreditById,
  CreditError,
} from "../services/credit.service";

type IdParams = { id: string };

const router: RouterType = Router();

router.use(authenticate);

const createCreditSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  type: z.enum(["CASH_LOAN", "SERVICE_CREDIT"], {
    errorMap: () => ({ message: "Type must be CASH_LOAN or SERVICE_CREDIT" }),
  }),
  principalAmount: z.number().positive("Principal amount must be positive"),
  interestAmount: z.number().min(0).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  dateIssued: z.string().min(1, "Date issued is required"),
  repaymentType: z.enum(["ONE_TIME", "INSTALLMENT", "FLEXIBLE"], {
    errorMap: () => ({
      message: "Repayment type must be ONE_TIME, INSTALLMENT, or FLEXIBLE",
    }),
  }),
  installments: z.number().int().positive().nullable().optional(),
});

// POST /api/credits
router.post(
  "/",
  validate(createCreditSchema),
  async (req: Request, res: Response) => {
    try {
      const data = req.body as z.infer<typeof createCreditSchema>;
      const credit = await createCredit(data);
      res.status(201).json({ success: true, data: credit });
    } catch (error) {
      if (error instanceof CreditError) {
        const status = error.message.includes("not found") ? 404 : 400;
        res.status(status).json({ success: false, error: error.message });
        return;
      }
      console.error("Create credit error:", (error as Error).message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// GET /api/credits
router.get("/", async (_req: Request, res: Response) => {
  try {
    const credits = await getAllCredits();
    res.json({ success: true, data: credits });
  } catch (error) {
    console.error("Get credits error:", (error as Error).message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/credits/:id
router.get("/:id", async (req: Request<IdParams>, res: Response) => {
  try {
    const credit = await getCreditById(req.params.id);
    if (!credit) {
      res.status(404).json({ success: false, error: "Credit not found" });
      return;
    }
    res.json({ success: true, data: credit });
  } catch (error) {
    console.error("Get credit error:", (error as Error).message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
