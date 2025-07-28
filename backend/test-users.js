const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.users.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        username: true,
        createdAt: true
      }
    });
    
    console.log('Recent users:');
    console.table(users);
    
    // Also check events
    const events = await prisma.events.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        creatorId: true,
        eventPlannerId: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('\nRecent events:');
    console.table(events);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
