import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.com';
  const newPassword = 'Admin@12345';
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });
  
  console.log(`Password for ${email} has been updated to ${newPassword}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
