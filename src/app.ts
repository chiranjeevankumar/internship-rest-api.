import express from 'express';
import internshipRoutes from './routes/internshipRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { getApiExplorerHtml } from './views/apiExplorer.js';
import { seedDatabase } from './db/database.js';

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
