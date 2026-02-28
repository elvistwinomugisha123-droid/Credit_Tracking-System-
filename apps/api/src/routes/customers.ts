import { Router, type Router as RouterType } from "express";
import { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

type IdParams = { id: string };
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerHistory,
  CustomerError,
} from "../services/customer.service";

const router: RouterType = Router();

router.use(authenticate);

const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  phone: z.string().min(1, "Phone number is required").trim(),
});

const updateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  phone: z.string().min(1, "Phone number is required").trim().optional(),
});

// GET /api/customers?search=
router.get("/", async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const customers = await getAllCustomers(search);
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error("Get customers error:", (error as Error).message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/customers
router.post(
  "/",
  validate(createCustomerSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, phone } = req.body as z.infer<typeof createCustomerSchema>;
      const customer = await createCustomer(name, phone);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      if (error instanceof CustomerError) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      console.error("Create customer error:", (error as Error).message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// GET /api/customers/:id
router.get("/:id", async (req: Request<IdParams>, res: Response) => {
  try {
    const customer = await getCustomerById(req.params.id);
    if (!customer) {
      res.status(404).json({ success: false, error: "Customer not found" });
      return;
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("Get customer error:", (error as Error).message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/customers/:id
router.patch(
  "/:id",
  validate(updateCustomerSchema),
  async (req: Request<IdParams>, res: Response) => {
    try {
      const data = req.body as z.infer<typeof updateCustomerSchema>;
      const customer = await updateCustomer(req.params.id, data);
      res.json({ success: true, data: customer });
    } catch (error) {
      if (error instanceof CustomerError) {
        const status = error.message.includes("not found") ? 404 : 409;
        res.status(status).json({ success: false, error: error.message });
        return;
      }
      console.error("Update customer error:", (error as Error).message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// GET /api/customers/:id/history
router.get("/:id/history", async (req: Request<IdParams>, res: Response) => {
  try {
    const history = await getCustomerHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (error) {
    if (error instanceof CustomerError) {
      res.status(404).json({ success: false, error: error.message });
      return;
    }
    console.error("Get customer history error:", (error as Error).message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
