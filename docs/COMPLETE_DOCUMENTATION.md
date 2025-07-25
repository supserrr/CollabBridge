# CollabBridge - Complete Project Documentation

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [Changelog](#changelog)
- [Support](#support)

## Project Overview

CollabBridge is a modern professional networking platform that connects skilled professionals with clients seeking their expertise. Built with Next.js 14, TypeScript, and modern web technologies, it provides a seamless experience for professionals to showcase their skills and for clients to find the perfect collaborators.

### Key Features
- 🎨 **Beautiful UI/UX** - Modern card designs with glassmorphism effects
- 🔐 **Secure Authentication** - Firebase-based user management with JWT
- 📊 **Professional Dashboards** - Role-based interfaces for different user types
- 🔍 **Advanced Search** - Filter professionals by skills, location, availability
- 📅 **Event Management** - Discover and manage networking events
- 📱 **Responsive Design** - Mobile-first approach with seamless experience

## Features

### Core Components

#### ProfileCard Component
- **Full-cover Images**: Portfolio images as card backgrounds
- **Letter Animations**: Name appears with letter-by-letter effect using Framer Motion
- **Interactive Elements**: Hover effects, skill tags, rating displays
- **Status Indicators**: Availability and verification badges
- **Responsive Design**: Adapts seamlessly to different screen sizes

#### EventCard Component
- **Immersive Design**: Event images as full backgrounds
- **Dynamic Pricing**: Shows "Free" for price: 0, otherwise displays cost
- **Badge System**: Category, featured, and price badges with proper positioning
- **Organizer Info**: Organizer details with avatar and rating
- **Attendee Tracking**: Current vs maximum attendee display

#### Search Interfaces
- **Glassmorphism Style**: Backdrop-blur effects with transparent backgrounds
- **Multi-filter Support**: Skills, location, availability, price range
- **Real-time Search**: Instant filtering and results
- **Clean Design**: Minimal appearance without unnecessary titles

### User Management
- **Firebase Authentication**: Secure registration and login
- **Username System**: Unique username assignment for all users
- **Profile Management**: Comprehensive profiles with portfolio sections
- **Role-Based Access**: Different dashboard experiences for professionals vs clients

### Dashboard System
- **Professional Dashboard**: Portfolio management, booking calendar, analytics
- **Client Dashboard**: Event planning, professional browsing, saved professionals
- **Analytics**: Budget tracking, team management, performance metrics
- **Responsive Navigation**: Mobile-optimized sidebar and navigation

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Full type safety throughout
- **Tailwind CSS**: Utility-first styling with custom components
- **Framer Motion**: Smooth animations and transitions
- **React Hooks**: Modern state management

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **Prisma ORM**: Database toolkit
- **PostgreSQL**: Primary database
- **Redis**: Caching and session management

### Authentication & Security
- **Firebase Auth**: User authentication
- **JWT**: Secure token management
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection

### Deployment & DevOps
- **Vercel**: Frontend hosting
- **Render**: Backend hosting
- **Docker**: Containerization
- **GitHub Actions**: CI/CD pipeline

## Installation & Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- PostgreSQL database
- Redis instance
- Firebase project

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/collabbridge
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secure_jwt_secret
FIREBASE_ADMIN_KEY=your_firebase_admin_key
PORT=5000
```

### Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/supserrr/CollabBridge.git
cd CollabBridge
```

2. **Install Dependencies**
```bash
# Root dependencies
npm install

# Frontend setup
cd frontend
npm install

# Backend setup (new terminal)
cd backend
npm install
```

3. **Database Setup**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

4. **Start Development Servers**
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

Visit `http://localhost:3000` for the frontend and `http://localhost:5000` for the API.

## API Documentation

### Base URLs
- **Development**: `http://localhost:5000/api`
- **Production**: `https://collabbridge-api.onrender.com/api`

### Authentication
All protected endpoints require Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Authentication
```
POST /auth/register          # User registration
POST /auth/login             # User login
POST /auth/logout            # User logout
GET  /auth/profile           # Get current user profile
PUT  /auth/profile           # Update user profile
```

#### Professionals
```
GET    /professionals        # List all professionals
GET    /professionals/:id    # Get specific professional
POST   /professionals        # Create professional profile
PUT    /professionals/:id    # Update professional profile
DELETE /professionals/:id    # Delete professional profile
```

#### Events
```
GET    /events              # List all events
GET    /events/:id          # Get specific event
POST   /events              # Create new event
PUT    /events/:id          # Update event
DELETE /events/:id          # Delete event
```

#### Bookings
```
GET    /bookings            # Get user bookings
POST   /bookings            # Create new booking
PUT    /bookings/:id        # Update booking status
DELETE /bookings/:id        # Cancel booking
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  }
}
```

## Database Schema

### Tables Overview

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Professionals
```sql
CREATE TABLE professionals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  company VARCHAR(255),
  location VARCHAR(255),
  skills TEXT[],
  hourly_rate DECIMAL(10,2),
  description TEXT,
  portfolio_images TEXT[],
  availability_status VARCHAR(20) DEFAULT 'available',
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  response_time VARCHAR(50),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Events
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255),
  category VARCHAR(100),
  price DECIMAL(10,2) DEFAULT 0,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  organizer_id INTEGER REFERENCES users(id),
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Bookings
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER REFERENCES professionals(id),
  client_id INTEGER REFERENCES users(id),
  event_id INTEGER REFERENCES events(id),
  booking_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships
- Users → Professionals (1:1)
- Users → Events (1:many as organizer)
- Users → Bookings (1:many as client)
- Professionals → Bookings (1:many)

## Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel --prod
```

3. **Environment Variables**
Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

### Backend Deployment (Render)

1. **Create render.yaml**
```yaml
services:
  - type: web
    name: collabbridge-api
    env: node
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        sync: false
      - key: JWT_SECRET
        sync: false
```

2. **Deploy to Render**
- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

### Database Setup
1. **PostgreSQL**: Use Render PostgreSQL or similar service
2. **Redis**: Use Redis Cloud or similar service
3. **Migrations**: Run `npx prisma migrate deploy` in production

## Contributing

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/CollabBridge.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit: `git commit -m "feat: add amazing feature"`
6. Push: `git push origin feature/your-feature-name`
7. Create a Pull Request

### Code Standards
- **TypeScript**: All new code must be properly typed
- **Components**: Use functional components with hooks
- **Styling**: Tailwind CSS classes, avoid inline styles
- **Testing**: Write tests for new features
- **Documentation**: Update docs for significant changes

### Development Guidelines
- Follow existing patterns in `/components/ui/`
- Use Framer Motion for animations
- Implement responsive design from start
- Include proper TypeScript interfaces
- Write descriptive commit messages

### Pull Request Process
1. Ensure your code follows project standards
2. Update documentation if needed
3. Add tests for new features
4. Ensure all tests pass
5. Create detailed PR description

## Security

### Reporting Vulnerabilities
**Do not report security vulnerabilities through public GitHub issues.**

Send security reports to: security@collabbridge.com

Include:
- Type of issue
- Full paths of affected files
- Location of affected source code
- Steps to reproduce
- Impact assessment

### Security Measures

#### Authentication
- Firebase Authentication with secure token management
- JWT tokens with appropriate expiration times
- Password strength requirements enforced
- Rate limiting on authentication endpoints

#### Data Protection
- All data encrypted in transit (HTTPS)
- Database connections secured with SSL
- Environment variables for sensitive configuration
- Input validation and sanitization on all endpoints

#### Infrastructure Security
- Regular dependency updates
- Automated security scanning with ggshield
- CORS properly configured
- Rate limiting implemented on API endpoints

### Best Practices
- Regular security audits
- Principle of least privilege for database access
- Secure coding practices followed
- Regular backup procedures

## Changelog

### [1.0.0] - 2025-07-25

#### Added
- Beautiful ProfileCard and EventCard components with full-cover images
- Glassmorphism search bars with backdrop-blur effects
- Professional and Events pages with modern card layouts
- Firebase authentication system
- Role-based dashboard system
- User profile management with portfolio sections
- Event discovery and management functionality
- Responsive design with mobile-first approach
- Aurora background effects with brand theming
- Redis caching and session management
- TypeScript implementation throughout
- Comprehensive test suite
- Production deployment configuration

#### Enhanced
- Load more buttons with pagination indicators
- EventCard badge positioning to prevent overlap
- Search bar gradients for better visual appeal
- Repository cleanup and documentation consolidation

#### Technical Implementation
- Next.js 14 with App Router
- Tailwind CSS with custom components
- Framer Motion animations
- Prisma ORM with PostgreSQL
- Docker containerization
- Vercel/Render deployment

#### Security
- Secure authentication with JWT tokens
- Input validation and sanitization
- CORS configuration
- Rate limiting on API endpoints
- Environment variable management

#### Performance
- Critical CSS optimization
- Image optimization with Next.js Image component
- Bundle splitting and code optimization
- Redis caching implementation

## Support

### Getting Help
- **Documentation**: Check this comprehensive guide first
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and community support
- **Email**: contact@collabbridge.com for general inquiries

### Common Issues

#### Build Errors
- Check TypeScript types and import paths
- Verify environment variables are set correctly
- Ensure all dependencies are installed

#### Styling Issues
- Verify Tailwind CSS classes are correct
- Check for conflicting CSS rules
- Ensure responsive design classes are applied

#### Authentication Problems
- Check Firebase configuration
- Verify environment variables
- Ensure JWT secret is properly set

#### Database Issues
- Ensure PostgreSQL is running
- Check database connection string
- Run migrations: `npx prisma migrate dev`

### Contributing
We welcome contributions! See the Contributing section above for guidelines.

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**CollabBridge** - Connecting professionals, building communities.

*Last Updated: July 25, 2025*  
*Repository: https://github.com/supserrr/CollabBridge*
