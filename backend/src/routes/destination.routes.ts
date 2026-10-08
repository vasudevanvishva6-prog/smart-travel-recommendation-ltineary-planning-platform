import { Router } from 'express';
import { DestinationController } from '../controllers/destination.controller';

const router = Router();

router.get('/', DestinationController.getDestinations);
router.get('/featured', DestinationController.getFeaturedAndTrending);
router.get('/slug/:slug', DestinationController.getDestinationBySlug);
router.get('/:id', DestinationController.getDestinationById);

export default router;
