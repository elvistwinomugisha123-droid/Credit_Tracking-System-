import prisma from "../lib/prisma";

export async function getAllCustomers(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : undefined;

  const customers = await prisma.customer.findMany({
    where,
    include: {
      credits: {
        select: {
          totalAmount: true,
          amountPaid: true,
          dueDate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((customer) => {
    const totalBorrowed = customer.credits.reduce(
      (sum, c) => sum + c.totalAmount,
      0
    );
    const totalPaid = customer.credits.reduce(
      (sum, c) => sum + c.amountPaid,
      0
    );
    const totalOutstanding = totalBorrowed - totalPaid;
    const hasActiveCredits = customer.credits.some(
      (c) => c.totalAmount - c.amountPaid > 0
    );

    const { credits: _, ...rest } = customer;
    return {
      ...rest,
      totalBorrowed,
      totalPaid,
      totalOutstanding,
      hasActiveCredits,
    };
  });
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      credits: {
        select: {
          totalAmount: true,
          amountPaid: true,
        },
      },
    },
  });

  if (!customer) return null;

  const totalBorrowed = customer.credits.reduce(
    (sum, c) => sum + c.totalAmount,
    0
  );
  const totalPaid = customer.credits.reduce(
    (sum, c) => sum + c.amountPaid,
    0
  );
  const totalOutstanding = totalBorrowed - totalPaid;
  const hasActiveCredits = customer.credits.some(
    (c) => c.totalAmount - c.amountPaid > 0
  );

  const { credits: _, ...rest } = customer;
  return {
    ...rest,
    totalBorrowed,
    totalPaid,
    totalOutstanding,
    hasActiveCredits,
  };
}

export async function createCustomer(name: string, phone: string) {
  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    throw new CustomerError("A customer with this phone number already exists");
  }

  return prisma.customer.create({
    data: { name, phone },
  });
}

export async function updateCustomer(
  id: string,
  data: { name?: string; phone?: string }
) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new CustomerError("Customer not found");
  }

  if (data.phone && data.phone !== customer.phone) {
    const existing = await prisma.customer.findUnique({
      where: { phone: data.phone },
    });
    if (existing) {
      throw new CustomerError(
        "A customer with this phone number already exists"
      );
    }
  }

  return prisma.customer.update({ where: { id }, data });
}

export async function getCustomerHistory(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new CustomerError("Customer not found");
  }

  const credits = await prisma.credit.findMany({
    where: { customerId: id },
    include: {
      payments: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  const creditsWithStatus = credits.map((credit) => {
    const outstandingBalance = credit.totalAmount - credit.amountPaid;
    const paymentProgress =
      credit.totalAmount > 0
        ? Math.round((credit.amountPaid / credit.totalAmount) * 100)
        : 0;

    let status: "ACTIVE" | "COMPLETED" | "OVERDUE";
    if (outstandingBalance <= 0) {
      status = "COMPLETED";
    } else if (credit.dueDate && now > credit.dueDate) {
      status = "OVERDUE";
    } else {
      status = "ACTIVE";
    }

    return {
      ...credit,
      status,
      outstandingBalance,
      paymentProgress,
    };
  });

  return {
    customer,
    credits: creditsWithStatus,
  };
}

export class CustomerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerError";
  }
}
