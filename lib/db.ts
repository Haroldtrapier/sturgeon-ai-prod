// Prisma client singleton for database access
// Note: Run `npx prisma generate` after setting up your schema

let prisma: any;

try {
  const { PrismaClient } = require("@prisma/client");

  const globalForPrisma = globalThis as unknown as {
    prisma: typeof PrismaClient | undefined;
  };

  prisma = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} catch {
  // PrismaClient not available - schema not yet generated
  prisma = null;
}

export { prisma };
export default prisma;
