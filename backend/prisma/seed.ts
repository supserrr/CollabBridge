import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');
  
  // Create admin user
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@collabbridge.com' },
    update: {},
    create: {
      email: 'admin@collabbridge.com',
      name: 'Admin User',
      role: 'ADMIN',
      firebaseUid: 'admin-firebase-uid-collabbridge-2c528',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);
  
  // Create test event planner
  const eventPlannerUser = await prisma.users.upsert({
    where: { email: 'eventplanner@test.com' },
    update: {},
    create: {
      email: 'eventplanner@test.com',
      name: 'Jane Event Planner',
      role: 'EVENT_PLANNER',
      firebaseUid: 'eventplanner-firebase-uid-test',
      isVerified: true,
      isActive: true,
      username: 'janeplanner',
      bio: 'Professional event planner with 5+ years experience',
      location: 'New York, NY'
    },
  });

  console.log('✅ Event planner user created:', eventPlannerUser.email);
  
  // Create event planner profile
  const eventPlannerProfile = await prisma.event_planners.create({
    data: {
      userId: eventPlannerUser.id,
      companyName: 'Elite Events NYC',
      website: 'https://eliteeventsnyc.com'
    }
  });

  console.log('✅ Event planner profile created');
  
  // Create test creative professional
  const creativeUser = await prisma.users.upsert({
    where: { email: 'creative@test.com' },
    update: {},
    create: {
      email: 'creative@test.com',
      name: 'John Creative',
      role: 'CREATIVE_PROFESSIONAL',
      firebaseUid: 'creative-firebase-uid-test',
      isVerified: true,
      isActive: true,
      username: 'johncreative',
      bio: 'Freelance photographer and videographer specializing in events',
      location: 'Los Angeles, CA'
    },
  });

  console.log('✅ Creative professional user created:', creativeUser.email);
  
  // Create creative professional profile
  const creativeProfile = await prisma.creative_profiles.create({
    data: {
      userId: creativeUser.id,
      categories: ['PHOTOGRAPHY', 'VIDEOGRAPHY'],
      skills: ['Event Photography', 'Wedding Photography', 'Video Editing', 'Drone Photography'],
      hourlyRate: 150.00,
      isAvailable: true,
      experience: '5+ years in event photography and videography'
    }
  });

  console.log('✅ Creative professional profile created');
  
  // Create portfolio projects for the creative user
  const portfolioProject1 = await prisma.projects.create({
    data: {
      userId: creativeUser.id,
      title: 'Wedding Photography Portfolio',
      description: 'Beautiful wedding photography collection from various venues',
      imageUrl: 'https://example.com/wedding-portfolio.jpg',
      projectUrl: 'https://portfolio.example.com/wedding',
      tags: ['wedding', 'photography', 'events'],
      isPublic: true
    }
  });

  const portfolioProject2 = await prisma.projects.create({
    data: {
      userId: creativeUser.id,
      title: 'Corporate Event Video',
      description: 'Professional videography for corporate events and conferences',
      imageUrl: 'https://example.com/corporate-video.jpg',
      projectUrl: 'https://vimeo.com/example',
      tags: ['corporate', 'videography', 'events'],
      isPublic: true
    }
  });

  console.log('✅ Portfolio projects created for creative user');
  
  // Create a sample event
  const sampleEvent = await prisma.events.create({
    data: {
      creatorId: eventPlannerUser.id,
      eventPlannerId: eventPlannerProfile.id,
      title: 'Summer Music Festival 2025',
      description: 'A vibrant outdoor music festival featuring local and international artists',
      eventType: 'CONCERT',
      startDate: new Date('2025-08-15T10:00:00Z'),
      endDate: new Date('2025-08-15T23:00:00Z'),
      location: 'Central Park, New York',
      address: 'Central Park, Manhattan, NY 10024',
      budget: 50000.00,
      isPublic: true,
      status: 'PUBLISHED',
      requiredRoles: ['PHOTOGRAPHY', 'VIDEOGRAPHY', 'SOUND'],
      tags: ['music', 'festival', 'outdoor', 'summer']
    }
  });

  console.log('✅ Sample event created:', sampleEvent.title);
  
  // Create some portfolio views
  await prisma.portfolio_views.create({
    data: {
      userId: creativeUser.id,
      viewedAt: new Date(),
      viewerIp: '192.168.1.1',
      userAgent: 'Test Browser'
    }
  });

  await prisma.portfolio_views.create({
    data: {
      userId: creativeUser.id,
      viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      viewerIp: '192.168.1.2',
      userAgent: 'Another Test Browser'
    }
  });

  console.log('✅ Portfolio views created');
  
  console.log('🌱 Seeding completed!');
  console.log('📋 Test data summary:');
  console.log('   - Admin user: admin@collabbridge.com');
  console.log('   - Event planner: eventplanner@test.com (username: janeplanner)');
  console.log('   - Creative professional: creative@test.com (username: johncreative)');
  console.log('   - Sample event: Summer Music Festival 2025');
  console.log('   - Portfolio projects: 2 projects for johncreative');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
