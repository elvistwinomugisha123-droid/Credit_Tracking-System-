import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { signToken } from "../lib/jwt";

interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AuthError("Invalid email or password");
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    throw new AuthError("Invalid email or password");
  }

  const token = signToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
