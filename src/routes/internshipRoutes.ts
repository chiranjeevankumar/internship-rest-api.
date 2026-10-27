import { Router } from 'express';
import {
  getHealth,
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship
} from '../controllers/internshipController.js';
import { validateInternshipInput } from '../middleware/validate.js';

const router = Router();

// Health Check
router.get('/health', getHealth);

// Internship CRUD & Filter Endpoints
router.get('/internships', getInternships);
router.get('/internships/:id', getInternshipById);
router.post('/internships', validateInternshipInput(false), createInternship);
router.put('/internships/:id', validateInternshipInput(true), updateInternship);
router.delete('/internships/:id', deleteInternship);

export default router;
