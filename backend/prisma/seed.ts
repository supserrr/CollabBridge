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
      firebaseUid: 'admin-firebase-uid',
      email: 'admin@collabbridge.com',
      name: 'CollabBridge Admin',
      role: UserRole.ADMIN,
      location: 'San Francisco, CA',
      bio: 'System administrator for CollabBridge platform',
      isVerified: true,
      isActive: true,
    },
  });

  // Create sample event planner
  const eventPlannerUser = await prisma.user.upsert({
    where: { email: 'sarah@eventpro.com' },
    update: {},
    create: {
      firebaseUid: 'planner-firebase-uid-1',
      email: 'sarah@eventpro.com',
      name: 'Sarah Johnson',
      role: UserRole.EVENT_PLANNER,
      location: 'New York, NY',
      bio: 'Professional event planner with 10+ years of experience in corporate and wedding events.',
      isVerified: true,
      isActive: true,
    },
  });

  const eventPlanner = await prisma.eventPlanner.create({
    data: {
      userId: eventPlannerUser.id,
      companyName: 'EventPro Solutions',
      website: 'https://eventpro.com',
      businessType: 'LLC',
      foundedYear: 2015,
      teamSize: '5-10',
      specialties: ['Corporate Events', 'Weddings', 'Product Launches'],
      serviceAreas: ['New York', 'New Jersey', 'Connecticut'],
      description: 'Full-service event planning company specializing in luxury corporate events and weddings.',
    },
  });

  // Create sample creative professionals
  const photographerUser = await prisma.user.upsert({
    where: { email: 'mike@creativelens.com' },
    update: {},
    create: {
      firebaseUid: 'photographer-firebase-uid-1',
      email: 'mike@creativelens.com',
      name: 'Mike Chen',
      role: UserRole.CREATIVE_PROFESSIONAL,
      location: 'Los Angeles, CA',
      bio: 'Award-winning photographer specializing in events, portraits, and commercial photography.',
      isVerified: true,
      isActive: true,
    },
  });

  const photographerProfile = await prisma.creativeProfile.create({
    data: {
      userId: photographerUser.id,
      categories: ['Photographer', 'Videographer'],
      portfolioImages: [
        'https://example.com/portfolio1.jpg',
        'https://example.com/portfolio2.jpg',
        'https://example.com/portfolio3.jpg',
      ],
      portfolioLinks: ['https://creativelens.com/portfolio'],
      hourlyRate: 150.0,
      dailyRate: 1200.0,
      experience: 'Professional',
      skills: ['Wedding Photography', 'Event Photography', 'Portrait Photography', 'Photo Editing'],
      languages: ['English', 'Mandarin'],
      isAvailable: true,
      responseTime: 2,
      travelRadius: 50,
      willTravel: true,
      yearsExperience: 8,
      completedProjects: 150,
      averageRating: 4.8,
      totalReviews: 45,
    },
  });

  const djUser = await prisma.user.upsert({
    where: { email: 'alex@soundwaves.com' },
    update: {},
    create: {
      firebaseUid: 'dj-firebase-uid-1',
      email: 'alex@soundwaves.com',
      name: 'Alex Rodriguez',
      role: UserRole.CREATIVE_PROFESSIONAL,
      location: 'Miami, FL',
      bio: 'Professional DJ and MC with expertise in weddings, corporate events, and private parties.',
      isVerified: true,
      isActive: true,
    },
  });

  const djProfile = await prisma.creativeProfile.create({
    data: {
      userId: djUser.id,
      categories: ['DJ', 'MC', 'Sound Technician'],
      portfolioImages: [
        'https://example.com/dj-portfolio1.jpg',
        'https://example.com/dj-portfolio2.jpg',
      ],
      portfolioLinks: ['https://soundwaves.com/mixes'],
      hourlyRate: 200.0,
      dailyRate: 1500.0,
      experience: 'Expert',
      skills: ['Wedding DJ', 'Corporate Events', 'MC Services', 'Sound Setup'],
      languages: ['English', 'Spanish'],
      isAvailable: true,
      responseTime: 1,
      travelRadius: 100,
      willTravel: true,
      yearsExperience: 12,
      completedProjects: 300,
      averageRating: 4.9,
      totalReviews: 78,
    },
  });

  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      eventPlannerId: eventPlanner.id,
      title: 'Tech Conference 2024',
      description: 'Annual technology conference featuring industry leaders and innovators. Looking for professional photographer and AV technician.',
      eventType: EventType.CONFERENCE,
      startDate: new Date('2024-06-15T09:00:00Z'),
      endDate: new Date('2024-06-15T18:00:00Z'),
      location: 'San Francisco, CA',
      address: '123 Conference Center Way, San Francisco, CA 94102',
      venue: 'Grand Conference Center',
      budget: 5000.0,
      estimatedGuests: 200,
      requiredRoles: ['Photographer', 'AV Technician', 'Event Coordinator'],
      tags: ['Technology', 'Conference', 'Business', 'Networking'],
      status: EventStatus.PUBLISHED,
      isPublic: true,
      requirements: 'Professional equipment required. Experience with corporate events preferred.',
      applicationDeadline: new Date('2024-05-15T23:59:59Z'),
    },
  });

  const event2 = await prisma.event.create({
    data: {
      eventPlannerId: eventPlanner.id,
      title: 'Wedding Reception - Smith & Johnson',
      description: 'Elegant wedding reception for 150 guests. Seeking photographer, DJ, and florist for memorable celebration.',
      eventType: EventType.WEDDING,
      startDate: new Date('2024-07-20T17:00:00Z'),
      endDate: new Date('2024-07-20T23:00:00Z'),
      location: 'Napa Valley, CA',
      address: '456 Vineyard Estate, Napa, CA 94558',
      venue: 'Sunset Vineyard Estate',
      budget: 8000.0,
      estimatedGuests: 150,
      requiredRoles: ['Photographer', 'DJ', 'Florist'],
      tags: ['Wedding', 'Elegant', 'Outdoor', 'Vineyard'],
      status: EventStatus.PUBLISHED,
      isPublic: true,
      requirements: 'Experience with outdoor weddings required. Portfolio of previous wedding work needed.',
      applicationDeadline: new Date('2024-06-20T23:59:59Z'),
    },
  });

  // Create sample applications
  const application1 = await prisma.eventApplication.create({
    data: {
      eventId: event1.id,
      professionalId: photographerProfile.id,
      message: 'I would love to photograph your tech conference. I have extensive experience with corporate events and can provide both photography and basic videography services.',
      proposedRate: 150.0,
      portfolio: ['https://creativelens.com/corporate-portfolio'],
      coverLetter: 'With 8 years of professional photography experience, I specialize in capturing the energy and networking aspects of corporate events.',
    },
  });

  const application2 = await prisma.eventApplication.create({
    data: {
      eventId: event2.id,
      professionalId: djProfile.id,
      message: 'I would be honored to provide DJ and MC services for this wedding. I have experience with outdoor venues and can adapt to any acoustic challenges.',
      proposedRate: 200.0,
      portfolio: ['https://soundwaves.com/wedding-mixes'],
      coverLetter: 'I have provided music and MC services for over 100 weddings, ensuring each celebration is unique and memorable.',
    },
  });

  // Create system configurations
  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Enable/disable maintenance mode',
        isPublic: false,
      },
      {
        key: 'max_file_upload_size',
        value: '10485760',
        type: 'number',
        description: 'Maximum file upload size in bytes (10MB)',
        isPublic: true,
      },
      {
        key: 'allowed_file_types',
        value: 'jpg,jpeg,png,gif,webp,pdf,doc,docx',
        type: 'string',
        description: 'Comma-separated list of allowed file extensions',
        isPublic: true,
      },
      {
        key: 'platform_commission',
        value: '0.05',
        type: 'number',
        description: 'Platform commission rate (5%)',
        isPublic: false,
      },
      {
        key: 'featured_listing_price',
        value: '49.99',
        type: 'number',
        description: 'Price for featuring a listing for 30 days',
        isPublic: true,
      },
    ],
  });

  console.log('✅ Database seed completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - 3 users (1 admin, 1 event planner, 2 creative professionals)`);
  console.log(`   - 2 events`);
  console.log(`   - 2 applications`);
  console.log(`   - 5 system configurations`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
