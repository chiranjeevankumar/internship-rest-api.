import { Router } from 'express';
import { createApplication, getApplications } from '../controllers/applicationController.js';
import { validateApplicationInput } from '../middleware/validateApplication.js';

const router = Router();

router.post('/applications', validateApplicationInput, createApplication);
router.get('/applications', getApplications);

export default router;
