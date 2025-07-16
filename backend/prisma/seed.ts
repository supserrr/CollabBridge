import { PrismaClient, UserRole, EventType, EventStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@collabbridge.com' },
    update: {},
    create: {
      email: 'admin@collabbridge.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      firebaseUid: 'admin-firebase-uid',
      isVerified: true,
      bio: 'System administrator',
    },
  });

  console.log('✅ Admin user created');

  // Create sample event planner
  const plannerUser = await prisma.user.upsert({
    where: { email: 'planner@example.com' },
    update: {},
    create: {
      email: 'planner@example.com',
      name: 'Sarah Johnson',
      role: UserRole.EVENT_PLANNER,
      firebaseUid: 'planner-firebase-uid',
      location: 'New York, NY',
      bio: 'Professional event planner with 10+ years experience',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1f7?w=400',
    },
  });

  const eventPlanner = await prisma.eventPlanner.upsert({
    where: { userId: plannerUser.id },
    update: {},
    create: {
      userId: plannerUser.id,
      companyName: 'Elite Events Co.',
      website: 'https://eliteevents.com',
    },
  });

  console.log('✅ Event planner created');

  // Create sample creative professional
  const creativeUser = await prisma.user.upsert({
    where: { email: 'photographer@example.com' },
    update: {},
    create: {
      email: 'photographer@example.com',
      name: 'Alex Chen',
      role: UserRole.CREATIVE_PROFESSIONAL,
      firebaseUid: 'creative-firebase-uid',
      location: 'Los Angeles, CA',
      bio: 'Award-winning wedding photographer specializing in candid moments',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
  });

  const creativeProfile = await prisma.creativeProfile.upsert({
    where: { userId: creativeUser.id },
    update: {},
    create: {
      userId: creativeUser.id,
      categories: ['photographer', 'videographer'],
      skills: ['wedding photography', 'portrait photography', 'event photography'],
      portfolioImages: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800',
      ],
      hourlyRate: 150,
      dailyRate: 1200,
      experience: '8 years of professional photography experience',
      equipment: 'Canon R5, Sony A7R IV, Professional lighting equipment',
      languages: ['English', 'Spanish'],
      isAvailable: true,
      responseTime: 2,
      travelRadius: 50,
    },
  });

  console.log('✅ Creative professional created');

  // Create sample events
  const sampleEvents = [
    {
      title: 'Elegant Garden Wedding',
      description: 'Beautiful outdoor wedding ceremony and reception for 150 guests in a stunning garden setting.',
      eventType: EventType.WEDDING,
      location: 'Napa Valley, CA',
      budget: 50000,
      requiredRoles: ['photographer', 'videographer', 'florist', 'caterer'],
      tags: ['outdoor', 'elegant', 'garden', 'intimate'],
    },
    {
      title: 'Corporate Product Launch',
      description: 'High-profile product launch event for tech company with 300 attendees.',
      eventType: EventType.CORPORATE,
      location: 'San Francisco, CA',
      budget: 75000,
      requiredRoles: ['photographer', 'videographer', 'sound engineer', 'lighting technician'],
      tags: ['corporate', 'tech', 'product launch', 'networking'],
    },
    {
      title: 'Birthday Party Celebration',
      description: 'Fun 30th birthday party with live music and catering for 80 guests.',
      eventType: EventType.BIRTHDAY,
      location: 'Los Angeles, CA',
      budget: 15000,
      requiredRoles: ['photographer', 'dj', 'caterer', 'decorator'],
      tags: ['birthday', 'party', 'celebration', 'music'],
    },
  ];

  for (const eventData of sampleEvents) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90) + 30);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 8);

    await prisma.event.create({
      data: {
        ...eventData,
        eventPlannerId: eventPlanner.id,
        startDate,
        endDate,
        status: EventStatus.PUBLISHED,
        isPublic: true,
        maxApplicants: 10,
      },
    });
  }

  console.log('✅ Sample events created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
