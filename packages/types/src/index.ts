// ============================================================
// Shared Types — Credit Management Web Application
// ============================================================

// --- Enums ---

export const CreditType = {
  CASH_LOAN: "CASH_LOAN",
  SERVICE_CREDIT: "SERVICE_CREDIT",
} as const;
export type CreditType = (typeof CreditType)[keyof typeof CreditType];

export const RepaymentType = {
  ONE_TIME: "ONE_TIME",
  INSTALLMENT: "INSTALLMENT",
  FLEXIBLE: "FLEXIBLE",
} as const;
export type RepaymentType = (typeof RepaymentType)[keyof typeof RepaymentType];

export const CreditStatus = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  OVERDUE: "OVERDUE",
} as const;
export type CreditStatus = (typeof CreditStatus)[keyof typeof CreditStatus];

// --- Models ---

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Credit {
  id: string;
  customerId: string;
  type: CreditType;
  principalAmount: number;
  interestAmount: number | null;
  totalAmount: number;
  amountPaid: number;
  dueDate: string | null;
  dateIssued: string;
  repaymentType: RepaymentType;
  installments: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  creditId: string;
  amount: number;
  date: string;
  createdAt: string;
}

// --- API Response Envelope ---

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// --- Dashboard ---

export interface DashboardMetrics {
  totalMoneyIssued: number;
  totalMoneyCollected: number;
  totalOutstanding: number;
  activeCredits: number;
  dueToday: number;
  overdueAccounts: number;
  thisMonthCollections: number;
}

// --- Customer with computed fields ---

export interface CustomerWithStats extends Customer {
  totalBorrowed: number;
  totalPaid: number;
  totalOutstanding: number;
  hasActiveCredits: boolean;
}

// --- Credit with computed status ---

export interface CreditWithStatus extends Credit {
  status: CreditStatus;
  outstandingBalance: number;
  paymentProgress: number;
}
