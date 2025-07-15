import { PrismaClient, UserRole, EventType, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@collabbridge.com' },
    update: {},
    create: {
      firebaseUid: 'admin-firebase-uid',
      email: 'admin@collabbridge.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      location: 'Global',
      bio: 'Platform administrator',
      isVerified: true,
      isActive: true,
    },
  });

  // Create sample event planner
  const plannerUser = await prisma.user.upsert({
    where: { email: 'planner@example.com' },
    update: {},
    create: {
      firebaseUid: 'planner-firebase-uid',
      email: 'planner@example.com',
      name: 'Sarah Johnson',
      role: UserRole.EVENT_PLANNER,
      location: 'New York, NY',
      bio: 'Professional event planner with 10+ years experience',
      isVerified: true,
      isActive: true,
    },
  });

  const eventPlanner = await prisma.eventPlanner.upsert({
    where: { userId: plannerUser.id },
    update: {},
    create: {
      userId: plannerUser.id,
      companyName: 'Elite Events NYC',
      website: 'https://eliteevents.com',
    },
  });

  // Create sample creative professional
  const creativeUser = await prisma.user.upsert({
    where: { email: 'photographer@example.com' },
    update: {},
    create: {
      firebaseUid: 'creative-firebase-uid',
      email: 'photographer@example.com',
      name: 'Alex Chen',
      role: UserRole.CREATIVE_PROFESSIONAL,
      location: 'Los Angeles, CA',
      bio: 'Wedding and corporate photographer',
      isVerified: true,
      isActive: true,
    },
  });

  const creativeProfile = await prisma.creativeProfile.upsert({
    where: { userId: creativeUser.id },
    update: {},
    create: {
      userId: creativeUser.id,
      categories: ['photographer', 'videographer'],
      hourlyRate: 150.0,
      experience: '8 years of professional photography',
      equipment: 'Canon 5D Mark IV, professional lighting equipment',
      skills: ['portrait', 'wedding', 'corporate', 'event'],
      languages: ['en', 'es'],
      isAvailable: true,
      responseTime: 6,
      completedProjects: 142,
    },
  });

  // Create sample events
  const sampleEvent = await prisma.event.create({
    data: {
      title: 'Sarah & Mike Wedding',
      description: 'Beautiful outdoor wedding ceremony and reception',
      eventType: EventType.WEDDING,
      date: new Date('2024-06-15T16:00:00Z'),
      endDate: new Date('2024-06-15T23:00:00Z'),
      location: 'Central Park, New York',
      address: 'Central Park Conservatory Garden, New York, NY',
      budget: 5000.0,
      requiredRoles: ['photographer', 'videographer', 'florist'],
      status: EventStatus.ACTIVE,
      isPublic: true,
      plannerId: eventPlanner.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - Admin user: ${adminUser.email}`);
  console.log(`   - Event planner: ${plannerUser.email}`);
  console.log(`   - Creative professional: ${creativeUser.email}`);
  console.log(`   - Sample event: ${sampleEvent.title}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
