# CollabBridge

A platform that connects event planners with talented creative professionals.

## 🌟 Features

- **Dual User Roles**: Event planners and creative professionals
- **Event Management**: Create, manage, and discover events
- **Application System**: Apply to events and manage applications
- **Booking Management**: Handle bookings and contracts
- **Real-time Messaging**: Communication between users
- **Review System**: Rate and review collaborations
- **File Uploads**: Portfolio and document management
- **Search & Filtering**: Advanced search capabilities
- **Admin Dashboard**: User and content management

## 🏗️ Architecture

- **Frontend**: Astro + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Firebase Auth + JWT
- **File Storage**: Cloudinary
- **Deployment**: Render (Backend) + Vercel (Frontend)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/collabbridge.git
   cd collabbridge
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   
   # Frontend  
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your values
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:4321
   - Backend API: http://localhost:3000

## 📁 Project Structure

```
collabbridge/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema & migrations
│   │   ├── schema.prisma   # Prisma schema
│   │   └── seed.ts         # Database seeding
│   └── package.json
├── frontend/               # Astro + React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── layouts/        # Astro layouts
│   │   ├── pages/          # Astro pages
│   │   ├── stores/         # Zustand stores
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   └── package.json
├── .github/workflows/      # GitHub Actions
├── docs/                   # Documentation
└── README.md
```

## 🛠️ Development

### Backend Commands

```bash
cd backend

# Development
npm run dev              # Start development server
npm run build           # Build for production  
npm start              # Start production server

# Database
npx prisma studio      # Open Prisma Studio
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema changes
npx prisma migrate dev # Create and run migration
npx prisma db seed     # Seed database

# Testing
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint          # Lint code
npm run lint:fix      # Fix linting issues
npm run format        # Format code
```

### Frontend Commands

```bash
cd frontend

# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build

# Code Quality
npm run lint          # Lint code
npm run lint:fix      # Fix linting issues
npm run type-check    # Type checking
```

## 🚀 Deployment

### Render (Backend + Database)

1. Follow the comprehensive guide in `RENDER_DEPLOYMENT_GUIDE.md`
2. Set up PostgreSQL database on Render
3. Deploy backend service with environment variables
4. Run database migrations

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Configure environment variables
4. Deploy

### Environment Variables

See `.env.example` files for required environment variables:
- `backend/.env.example` - Backend configuration
- `frontend/.env.example` - Frontend configuration

## 📚 API Documentation

The API documentation is automatically generated and available at:
- Development: http://localhost:3000/api-docs
- Production: https://your-backend.onrender.com/api-docs

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Run unit tests only
npm run test:integration   # Run integration tests only
npm run test:e2e          # Run end-to-end tests
```

### Frontend Testing

```bash
cd frontend
npm run test              # Run component tests
npm run test:e2e         # Run end-to-end tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@collabbridge.com
- 💬 Discord: [Join our community](https://discord.gg/collabbridge)
- 📖 Documentation: [docs.collabbridge.com](https://docs.collabbridge.com)

## 🙏 Acknowledgments

- [Astro](https://astro.build/) - Frontend framework
- [React](https://reactjs.org/) - UI library
- [Express](https://expressjs.com/) - Backend framework
- [Prisma](https://prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Render](https://render.com/) - Deployment platform
