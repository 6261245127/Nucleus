const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const viewerId = "09bb70a1-4107-470e-b9b0-977680a175f5"; // From previous log
  const res = await prisma.userStat.upsert({
    where: { userId: viewerId },
    update: { totalTasks: { increment: 1 } },
    create: { userId: viewerId, totalTasks: 1, currentStreak: 1, longestStreak: 1, level: 1 }
  });
  console.log(res);
}
main().catch(console.error).finally(() => prisma.$disconnect());
