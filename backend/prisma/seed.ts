import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@collabbridge.com' },
    update: {},
    create: {
      firebaseUid: 'admin-firebase-uid',
      email: 'admin@collabbridge.com',
      name: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created/updated:', adminUser.email);

  // Create sample event planner
  const eventPlannerUser = await prisma.user.upsert({
    where: { email: 'planner@example.com' },
    update: {},
    create: {
      firebaseUid: 'planner-firebase-uid',
      email: 'planner@example.com',
      name: 'Sarah Johnson',
      role: 'EVENT_PLANNER',
      location: 'New York, NY',
      bio: 'Professional event planner with 10+ years of experience in corporate and wedding events.',
      isVerified: true,
      isActive: true,
    },
  });

  const eventPlanner = await prisma.eventPlanner.upsert({
    where: { userId: eventPlannerUser.id },
    update: {},
    create: {
      userId: eventPlannerUser.id,
      companyName: 'Elite Events NYC',
      website: 'https://eliteeventsnyc.com',
    },
  });

  console.log('✅ Event planner created/updated:', eventPlannerUser.email);

  // Create sample creative professional
  const professionalUser = await prisma.user.upsert({
    where: { email: 'photographer@example.com' },
    update: {},
    create: {
      firebaseUid: 'photographer-firebase-uid',
      email: 'photographer@example.com',
      name: 'Mike Thompson',
      role: 'CREATIVE_PROFESSIONAL',
      location: 'New York, NY',
      bio: 'Professional photographer specializing in weddings and corporate events. Award-winning work with 8+ years experience.',
      isVerified: true,
      isActive: true,
    },
  });

  const creativeProfile = await prisma.creativeProfile.upsert({
    where: { userId: professionalUser.id },
    update: {},
    create: {
      userId: professionalUser.id,
      categories: ['Photography', 'Videography'],
      skills: ['Wedding Photography', 'Event Photography', 'Portrait Photography', 'Video Editing'],
      hourlyRate: 150.0,
      dailyRate: 1200.0,
      experience: '8+ years of professional photography experience',
      equipment: 'Full-frame cameras, professional lighting, drones',
      languages: ['English', 'Spanish'],
      isAvailable: true,
      responseTime: 2,
      travelRadius: 50,
      portfolioImages: [
        'https://example.com/portfolio1.jpg',
        'https://example.com/portfolio2.jpg',
      ],
      portfolioLinks: [
        'https://mikethompsonphotography.com',
        'https://instagram.com/mikethompsonphoto',
      ],
    },
  });

  console.log('✅ Creative professional created/updated:', professionalUser.email);

  // Create sample event
  const sampleEvent = await prisma.event.upsert({
    where: { id: 'sample-event-id' },
    update: {},
    create: {
      id: 'sample-event-id',
      eventPlannerId: eventPlanner.id,
      title: 'Corporate Annual Gala 2024',
      description: 'High-end corporate gala for 200+ guests. Looking for professional photographer and videographer to capture the event. Premium venue with excellent lighting.',
      eventType: 'CORPORATE',
      startDate: new Date('2024-09-15T18:00:00Z'),
      endDate: new Date('2024-09-15T23:00:00Z'),
      location: 'Manhattan, New York',
      address: '123 Park Avenue, New York, NY 10017',
      budget: 5000.0,
      requiredRoles: ['Photography', 'Videography'],
      tags: ['Corporate', 'Gala', 'Premium', 'Manhattan'],
      maxApplicants: 10,
      status: 'PUBLISHED',
      isPublic: true,
    },
  });

  console.log('✅ Sample event created/updated:', sampleEvent.title);

  // Create sample application
  await prisma.eventApplication.upsert({
    where: {
      eventId_professionalId: {
        eventId: sampleEvent.id,
        professionalId: creativeProfile.id,
      },
    },
    update: {},
    create: {
      eventId: sampleEvent.id,
      professionalId: creativeProfile.id,
      message: 'I would love to photograph your corporate gala. I have extensive experience with similar high-end events and can provide both photography and videography services.',
      proposedRate: 1200.0,
      status: 'PENDING',
      portfolio: [
        'https://example.com/corporate-portfolio1.jpg',
        'https://example.com/corporate-portfolio2.jpg',
      ],
    },
  });

  console.log('✅ Sample application created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
