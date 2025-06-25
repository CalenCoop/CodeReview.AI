import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  const user = await prisma.users.create({
    data: { email: "CalenCooper12@yahoo.com" },
  });

  return Response.json(user);
}
