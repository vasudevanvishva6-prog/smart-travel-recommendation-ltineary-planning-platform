import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, ReviewController.addReview);
router.get('/destination/:destinationId', ReviewController.getDestinationReviews);

export default router;
