// Prisma client singleton for database access
// Note: Run `npx prisma generate` after setting up your schema

type PrismaClientType = {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  [key: string]: unknown;
} | null;

let prisma: PrismaClientType = null;

try {
  // Dynamic import to handle case where Prisma schema is not yet generated
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientType | undefined;
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
