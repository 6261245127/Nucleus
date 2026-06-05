import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with test credentials...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const creator = await prisma.user.upsert({
    where: { email: 'creator@test.com' },
    update: { passwordHash },
    create: {
      email: 'creator@test.com',
      name: 'Test Creator',
      passwordHash,
      role: 'CREATOR',
      isVerified: true,
      wallet: {
        create: {
          coinBalance: 0,
          fiatBalance: 1000,
          rewardBalance: 0,
        },
      },
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@test.com' },
    update: { passwordHash },
    create: {
      email: 'viewer@test.com',
      name: 'Test Viewer',
      passwordHash,
      role: 'VIEWER',
      isVerified: true,
      wallet: {
        create: {
          coinBalance: 100,
          fiatBalance: 0,
          rewardBalance: 0,
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash },
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
      wallet: {
        create: {
          coinBalance: 0,
          fiatBalance: 0,
          rewardBalance: 0,
        },
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log('--- Credentials ---');
  console.log('Creator: creator@test.com / password123');
  console.log('Viewer:  viewer@test.com / password123');
  console.log('Admin:   admin@test.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
