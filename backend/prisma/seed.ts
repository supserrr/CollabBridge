import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');
  
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@collabbridge.com' },
    update: {},
    create: {
      email: 'admin@collabbridge.com',
      name: 'Admin User',
      role: 'ADMIN',
      firebaseUid: 'admin-firebase-uid',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);
  
  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
