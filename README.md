# Lead Management System

A full-stack Lead Management System built with React.js frontend, Express.js backend, and PostgreSQL database. This system provides comprehensive lead management capabilities with authentication, CRUD operations, filtering, and pagination.

## 🚀 Features

- **Authentication System**
  - User registration and login
  - JWT authentication with httpOnly cookies
  - Password hashing with bcrypt
  - Protected routes

- **Lead Management**
  - Create, Read, Update, Delete (CRUD) operations
  - Comprehensive lead fields (name, email, company, status, score, etc.)
  - Server-side pagination
  - Advanced filtering and search
  - Status and source tracking

- **User Interface**
  - Modern React.js frontend with Tailwind CSS
  - AG Grid for data display and management
  - Responsive design
  - Form validation
  - Toast notifications

- **Backend API**
  - RESTful API with Express.js
  - Input validation and sanitization
  - Error handling middleware
  - Rate limiting
  - CORS configuration

## 🛠️ Tech Stack

### Frontend
- React.js 18
- React Router for navigation
- AG Grid for data grid
- Tailwind CSS for styling
- React Hook Form for forms
- Axios for API calls
- React Hot Toast for notifications

### Backend
- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- bcrypt for password hashing
- Express Validator for input validation
- CORS and Helmet for security

### Database
- PostgreSQL with proper indexing
- User and leads tables
- Foreign key relationships
- Data constraints and validation

## 📋 Requirements

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lead-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
DATABASE_URL=postgresql://postgres:Fivesharps%40123@localhost:5432/lead_management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Create database
createdb lead_management

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Backend
```bash
npm run dev
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## 🔐 Test Account

After running the seed script, you can use:
- **Email**: test@example.com
- **Password**: test123

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - Get leads with pagination and filters
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

## 🌐 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Environment Variables**
   - Set `DATABASE_URL` to your production PostgreSQL URL
   - Set `JWT_SECRET` to a strong secret key
   - Set `NODE_ENV=production`
   - Set `FRONTEND_URL` to your deployed frontend URL

2. **Database**
   - Use a production PostgreSQL service (Supabase, Railway, etc.)
   - Run migrations: `npm run db:migrate`
   - Seed data if needed: `npm run db:seed`

3. **Deploy**
   - Connect your repository to your hosting platform
   - Set build command: `npm install`
   - Set start command: `npm start`

### Frontend Deployment (Vercel)

1. **Environment Variables**
   - Set `REACT_APP_API_URL` to your deployed backend URL

2. **Deploy**
   - Connect your repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `build`

## 🔧 Configuration

### Database Schema

**Users Table**
- id, email, password, first_name, last_name, created_at, updated_at

**Leads Table**
- id, first_name, last_name, email, phone, company, city, state
- source, status, score, lead_value, last_activity_at, is_qualified
- user_id (foreign key), created_at, updated_at

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT token expiration | 7d |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🧪 Testing

The system includes:
- 100+ sample leads for testing
- Test user account
- Comprehensive form validation
- Error handling and user feedback

## 📱 Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Immediate UI updates after CRUD operations
- **Advanced Filtering**: Filter by any lead field with multiple criteria
- **Pagination**: Server-side pagination for large datasets
- **Sorting**: Sort by any column in the grid
- **Search**: Quick search across lead fields

## 🔒 Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Note**: Make sure to update the database connection string and JWT secret in your environment variables before deployment.
