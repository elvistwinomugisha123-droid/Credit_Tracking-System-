import prisma from "../lib/prisma";
import type { CreditStatus } from "@credit-manager/types";

// BL-04, BL-05, BL-06: Status is always derived, never set manually
function deriveCreditStatus(
  outstandingBalance: number,
  dueDate: Date | null
): CreditStatus {
  // BL-05: Completed when balance = 0
  if (outstandingBalance <= 0) return "COMPLETED";
  // BL-06: Overdue when balance > 0 AND due date is set AND today is after due date
  // BL-02: No due date = never overdue
  if (dueDate && new Date() > dueDate) return "OVERDUE";
  // BL-04: Active when balance > 0 AND (no due date OR today <= due date)
  return "ACTIVE";
}

function enrichCredit(credit: {
  id: string;
  customerId: string;
  type: string;
  principalAmount: number;
  interestAmount: number | null;
  totalAmount: number;
  amountPaid: number;
  dueDate: Date | null;
  dateIssued: Date;
  repaymentType: string;
  installments: number | null;
  createdAt: Date;
  updatedAt: Date;
  payments?: {
    id: string;
    creditId: string;
    amount: number;
    date: Date;
    createdAt: Date;
  }[];
  customer?: { id: string; name: string; phone: string };
}) {
  const outstandingBalance = credit.totalAmount - credit.amountPaid;
  const paymentProgress =
    credit.totalAmount > 0
      ? Math.round((credit.amountPaid / credit.totalAmount) * 100)
      : 0;
  const status = deriveCreditStatus(outstandingBalance, credit.dueDate);

  // Generate installment schedule if applicable (BL-10)
  let installmentSchedule: { number: number; amount: number; dueDate: string | null }[] = [];
  if (
    credit.repaymentType === "INSTALLMENT" &&
    credit.installments &&
    credit.installments > 0
  ) {
    const monthlyAmount = Math.round((credit.totalAmount / credit.installments) * 100) / 100;
    for (let i = 1; i <= credit.installments; i++) {
      let scheduleDueDate: string | null = null;
      if (credit.dateIssued) {
        const d = new Date(credit.dateIssued);
        d.setMonth(d.getMonth() + i);
        scheduleDueDate = d.toISOString();
      }
      installmentSchedule.push({
        number: i,
        amount: i === credit.installments
          ? Math.round((credit.totalAmount - monthlyAmount * (credit.installments - 1)) * 100) / 100
          : monthlyAmount,
        dueDate: scheduleDueDate,
      });
    }
  }

  return {
    ...credit,
    status,
    outstandingBalance,
    paymentProgress,
    installmentSchedule,
  };
}

interface CreateCreditInput {
  customerId: string;
  type: string;
  principalAmount: number;
  interestAmount?: number | null;
  dueDate?: string | null;
  dateIssued: string;
  repaymentType: string;
  installments?: number | null;
}

export async function createCredit(input: CreateCreditInput) {
  // Verify customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
  });
  if (!customer) {
    throw new CreditError("Customer not found");
  }

  // BL-01: Interest is optional. Zero/null means total = principal only.
  const interest = input.interestAmount ?? 0;
  const totalAmount = input.principalAmount + interest;

  // BL-10: Installment requires number of installments
  if (input.repaymentType === "INSTALLMENT" && (!input.installments || input.installments < 1)) {
    throw new CreditError("Installment repayment requires number of installments");
  }

  const credit = await prisma.credit.create({
    data: {
      customerId: input.customerId,
      type: input.type,
      principalAmount: input.principalAmount,
      interestAmount: input.interestAmount ?? null,
      totalAmount,
      amountPaid: 0,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      dateIssued: new Date(input.dateIssued),
      repaymentType: input.repaymentType,
      installments: input.installments ?? null,
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      payments: true,
    },
  });

  return enrichCredit(credit);
}

export async function getAllCredits() {
  const credits = await prisma.credit.findMany({
    include: {
      customer: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return credits.map((credit) => enrichCredit(credit));
}

export async function getCreditById(id: string) {
  const credit = await prisma.credit.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      payments: { orderBy: { date: "desc" } },
    },
  });

  if (!credit) return null;

  // Build payment history with running balance
  const sortedPaymentsAsc = [...credit.payments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let runningBalance = credit.totalAmount;
  const paymentHistory = sortedPaymentsAsc.map((p) => {
    runningBalance -= p.amount;
    return {
      ...p,
      balanceAfterPayment: Math.round(runningBalance * 100) / 100,
    };
  });
  // Reverse so newest first for display
  paymentHistory.reverse();

  const enriched = enrichCredit(credit);

  return {
    ...enriched,
    paymentHistory,
  };
}

export class CreditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreditError";
  }
}
