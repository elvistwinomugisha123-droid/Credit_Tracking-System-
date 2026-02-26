import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@creditmanager.com" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists, skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: "admin@creditmanager.com",
      password: hashedPassword,
      name: "Mugabe Rogers",
    },
  });

  console.log(`Admin user created: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
