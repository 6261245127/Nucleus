const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log("Users:", users);

  const stats = await prisma.userStat.findMany();
  console.log("UserStats:", stats);
  
  const tasks = await prisma.task.findMany({ select: { id: true, viewerId: true, status: true } });
  console.log("Tasks:", tasks);
}
main().catch(console.error).finally(() => prisma.$disconnect());
