import { Router } from 'express';
import { ItineraryController } from '../controllers/itinerary.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/generate', ItineraryController.generateItinerary);
router.post('/save', authenticate, ItineraryController.saveTrip);
router.get('/my-trips', authenticate, ItineraryController.getUserTrips);
router.get('/:id', authenticate, ItineraryController.getTripById);
router.delete('/:id', authenticate, ItineraryController.deleteTrip);
router.patch('/:id/status', authenticate, ItineraryController.updateTripStatus);

export default router;
