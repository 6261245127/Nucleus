const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { status: 'COMPLETED' }
  });

  const userCounts = {};
  for (const t of tasks) {
    userCounts[t.viewerId] = (userCounts[t.viewerId] || 0) + 1;
  }

  for (const [userId, count] of Object.entries(userCounts)) {
    let level = 1;
    if (count >= 100) level = 5;
    else if (count >= 50) level = 4;
    else if (count >= 10) level = 3;
    else if (count >= 5) level = 2;

    await prisma.userStat.upsert({
      where: { userId },
      update: { totalTasks: count, level },
      create: { userId, totalTasks: count, level, currentStreak: 1, longestStreak: 1, lastTaskDate: new Date() }
    });
  }

  console.log("Backfilled UserStat for users:", Object.keys(userCounts).length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
