# Patient Records Management System

A comprehensive hospital management system with role-based dashboards for Admins, Doctors, and Patients.

## Features

- **Admin Dashboard**: User, doctor, and patient management with reports
- **Doctor Dashboard**: Appointments, patient history, prescriptions, medical records
- **Patient Dashboard**: View records, appointments, and prescriptions
- **Secure Authentication**: JWT-based auth with role-based access control
- **File Storage**: Cloudinary integration for medical reports and documents
- **Modern UI**: React + Vite + Tailwind CSS with premium design

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (file storage)
- Security: Helmet, CORS, Rate Limiting, Zod validation

### Frontend
- React.js + Vite
- Tailwind CSS
- Axios
- React Router

### Deployment
- Docker + Docker Compose
- MongoDB container
- Separate backend and frontend containers

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Cloudinary account (for file uploads)

### Environment Setup

1. **Backend Environment Variables**
   
   Create `backend/.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://mongo:27017/patient_records_db
   
   JWT_ACCESS_SECRET=your_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   FRONTEND_URL=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

2. **Root .env for Docker Compose**
   
   Create `.env` file in root directory:
   ```env
   JWT_ACCESS_SECRET=your_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### Running Locally (Without Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/role` - Change user role

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient (Admin)
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (Admin)

### Doctors
- `GET /api/doctors` - List doctors
- `POST /api/doctors` - Create doctor (Admin)
- `GET /api/doctors/:id` - Get doctor details
- `PUT /api/doctors/:id` - Update doctor
- `GET /api/doctors/:id/appointments` - Get doctor appointments

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/status` - Update status
- `DELETE /api/appointments/:id` - Cancel appointment

### Medical Records
- `GET /api/medical-records` - List records
- `POST /api/medical-records` - Create record (Doctor)
- `GET /api/medical-records/:id` - Get record details
- `PUT /api/medical-records/:id` - Update record (Doctor)
- `GET /api/medical-records/patient/:patientId` - Get patient records
- `POST /api/medical-records/:id/upload` - Upload attachment

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription (Doctor)
- `GET /api/prescriptions/:id` - Get prescription details
- `GET /api/prescriptions/patient/:patientId` - Get patient prescriptions

## User Roles

- **Admin**: Full access to all features, user management
- **Doctor**: Manage appointments, create medical records and prescriptions
- **Patient**: View own records, appointments, and prescriptions

## Security Features

- Password hashing with bcrypt
- JWT access and refresh tokens
- Role-based access control
- Rate limiting
- Input validation with Zod
- Security headers with Helmet
- CORS protection

## License

ISC
