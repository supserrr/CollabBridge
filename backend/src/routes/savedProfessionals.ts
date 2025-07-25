import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { SavedProfessionalsController } from '../controllers/savedProfessionalsController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const savedProfessionalsController = new SavedProfessionalsController();

// Get saved professional IDs (for UI state)
router.get('/ids', authenticate, asyncHandler(savedProfessionalsController.getSavedProfessionalIds.bind(savedProfessionalsController)));

// Get all saved professionals
router.get('/', authenticate, asyncHandler(savedProfessionalsController.getSavedProfessionals.bind(savedProfessionalsController)));

// Save a professional
router.post('/:professionalId', authenticate, asyncHandler(savedProfessionalsController.saveProfessional.bind(savedProfessionalsController)));

// Unsave a professional
router.delete('/:professionalId', authenticate, asyncHandler(savedProfessionalsController.unsaveProfessional.bind(savedProfessionalsController)));

export default router;
