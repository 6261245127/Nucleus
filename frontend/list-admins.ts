import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log(admins);
}
main().catch(console.error).finally(() => prisma.$disconnect());
