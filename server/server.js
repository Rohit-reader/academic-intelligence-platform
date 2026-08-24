const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Academic Intelligence API Operational', timestamp: new Date() });
});

// Route Modules
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/master', require('./src/routes/masterDataRoutes'));
app.use('/api/timetable', require('./src/routes/timetableRoutes'));
app.use('/api/leaves', require('./src/routes/leaveRoutes'));
app.use('/api/recommendations', require('./src/routes/recommendationRoutes'));
app.use('/api/simulations', require('./src/routes/simulationRoutes'));
app.use('/api/exams', require('./src/routes/examRoutes'));
app.use('/api/events', require('./src/routes/eventRoutes'));
app.use('/api/system', require('./src/routes/auditSecurityRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
