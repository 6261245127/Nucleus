import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.campaign.findMany();
  let updatedCount = 0;
  
  for (const campaign of campaigns) {
    if (campaign.url.includes('youtube.com/watch?v=abc') || campaign.url.includes('youtube.com/watch?v=def')) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' } // Me at the zoo
      });
      updatedCount++;
    }
  }
  
  console.log(`Successfully updated ${updatedCount} mock campaigns with valid YouTube URLs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
