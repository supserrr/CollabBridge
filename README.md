# CollabBridge Backend API

Backend API for CollabBridge - A platform connecting event planners with creative professionals in Rwanda.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)
- Firebase project for authentication

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb collabbridge
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── applicationController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Application.js
│   │   └── Review.js
│   ├── routes/              # Route definitions
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── events.js
│   │   ├── applications.js
│   │   └── reviews.js
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   └── firebase.js
│   ├── migrations/          # Database migrations
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_events_table.sql
│   │   ├── 003_create_applications_table.sql
│   │   └── 004_create_reviews_table.sql
│   ├── seeds/               # Database seed files
│   └── app.js               # Express app setup
├── tests/                   # Test files
├── logs/                    # Log files
├── package.json
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | No (default: 5432) |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No (default: 7d) |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |

## 🛣️ API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify-token` - Verify JWT token
- `DELETE /api/auth/account` - Delete user account

### Users
- `GET /api/users/professionals` - Get all professionals
- `GET /api/users/professionals/search` - Search professionals
- `GET /api/users/professionals/top-rated` - Get top-rated professionals
- `GET /api/users/professionals/location/:location` - Get professionals by location
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/dashboard` - Get dashboard summary
- `PUT /api/users/availability` - Update availability status
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user profile

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/my-events` - Get current user's events
- `GET /api/events/search` - Search events
- `GET /api/events/stats` - Get event statistics
- `GET /api/events/type/:type` - Get events by type
- `GET /api/events/:eventId` - Get event by ID
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event

### Applications
- `POST /api/applications` - Apply to event
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/stats` - Get application statistics
- `PUT /api/applications/bulk-update` - Bulk update applications
- `GET /api/applications/event/:eventId` - Get event applications
- `GET /api/applications/:applicationId` - Get application by ID
- `PUT /api/applications/:applicationId/status` - Update application status
- `DELETE /api/applications/:applicationId` - Withdraw application

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/my-reviews` - Get user's reviews
- `GET /api/reviews/pending` - Get pending reviews
- `GET /api/reviews/stats` - Get review statistics
- `GET /api/reviews/user/:userId` - Get user reviews
- `GET /api/reviews/application/:applicationId` - Get application reviews
- `GET /api/reviews/:reviewId` - Get review by ID
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review

## 🗄️ Database Schema

### Users Table
- `user_id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `email` (VARCHAR, Unique, Required)
- `role` (ENUM: planner/professional)
- `bio` (TEXT)
- `phone` (VARCHAR)
- `location` (VARCHAR)
- `rating` (DECIMAL)
- `availability_status` (ENUM)
- `created_at`, `updated_at` (TIMESTAMP)

### Events Table
- `event_id` (UUID, Primary Key)
- `planner_id` (UUID, Foreign Key)
- `title` (VARCHAR, Required)
- `description` (TEXT, Required)
- `location` (VARCHAR, Required)
- `date` (DATE, Required)
- `event_type` (ENUM)
- `required_roles` (JSONB)
- `budget_range` (VARCHAR)
- `is_public` (BOOLEAN)
- `status` (ENUM)
- `created_at`, `updated_at` (TIMESTAMP)

### Applications Table
- `app_id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key)
- `professional_id` (UUID, Foreign Key)
- `message` (TEXT)
- `status` (ENUM: pending/accepted/rejected)
- `response_message` (TEXT)
- `created_at`, `responded_at`, `updated_at` (TIMESTAMP)

### Reviews Table
- `review_id` (UUID, Primary Key)
- `from_user_id` (UUID, Foreign Key)
- `to_user_id` (UUID, Foreign Key)
- `application_id` (UUID, Foreign Key)
- `rating` (INTEGER, 1-5)
- `comment` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Reset database (drop and recreate)
npm run db:reset

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Clear log files
npm run logs:clear

# Generate documentation
npm run docs
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Firebase Integration** - Additional auth layer with Firebase
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - API rate limiting to prevent abuse
- **SQL Injection Protection** - Parameterized queries
- **CORS Configuration** - Proper CORS setup
- **Helmet Security** - Security headers middleware
- **Error Handling** - Secure error responses

## 📊 Logging & Monitoring

- **Winston Logger** - Structured logging with multiple levels
- **Request Logging** - HTTP request/response logging
- **Error Logging** - Comprehensive error tracking
- **Security Logging** - Authentication and security events
- **Performance Logging** - Database query and request performance

## 🚀 Deployment

### Production Environment Variables
```bash
NODE_ENV=production
DB_SSL=true
LOG_LEVEL=warn
```

### Docker Support (Future)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

For technical support or questions, contact the development team:
- Email: support@collabbridge.rw
- GitHub Issues: [Create an issue](https://github.com/team/collabbridge/issues)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.