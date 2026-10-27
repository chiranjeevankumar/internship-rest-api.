import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import internshipRoutes from './routes/internshipRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { getApiExplorerHtml } from './views/apiExplorer.js';
import { seedDatabase } from './db/database.js';

const app = express();

// Enable trust proxy for reverse proxy / Cloud Run load balancers
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false // Allows inline scripts for local API Explorer UI
  })
);

// CORS Configuration: Strict Origin Policy for Production
const isProd = process.env.NODE_ENV === 'production';
const rawOrigins = process.env.CLIENT_ORIGIN || (isProd ? '' : '*');
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // In development/test mode without explicit origins, or when origin is in allowed list
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation: Access denied for origin.'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiters
const isTest = process.env.NODE_ENV === 'test';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : 100, // Allow high limit in test environment
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

export const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100 : 5, // Stricter limit for application submissions
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    error: 'Application submission limit reached. Please wait 15 minutes before submitting another application.'
  }
});

// Apply General Rate Limiting to /api
app.use('/api', generalLimiter);

// Seed database on application startup if needed
try {
  seedDatabase();
} catch (error) {
  console.error('Failed to auto-seed database on startup:', error);
}

// Serve Interactive API Documentation & Explorer on GET /
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getApiExplorerHtml());
});

// Mount API routes
app.use('/api', internshipRoutes);
app.use('/api', applicationRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
