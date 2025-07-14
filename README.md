# CollabBridge

A platform connecting event planners with talented creative professionals.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Firebase Account
- Cloudinary Account

### Installation

1. **Clone and Setup**
```bash
git clone <your-repo>
cd collabbridge-project
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run prisma:generate
npm run prisma:push
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

## 📚 Documentation

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-token` - Verify Firebase token

#### Events
- `GET /api/events` - Get public events
- `POST /api/events` - Create event (Event Planners only)
- `GET /api/events/my/events` - Get my events

#### Search
- `GET /api/search/professionals` - Search creative professionals
- `GET /api/search/events` - Search events

### Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- Prisma + PostgreSQL
- Firebase Authentication
- Socket.IO for real-time features
- Cloudinary for file storage

**Frontend:**
- Astro + React
- TypeScript
- Tailwind CSS
- Firebase Client SDK

### Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.
