import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Protect all admin endpoints
router.use(authenticate, requireAdmin);

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);

router.post('/destinations', AdminController.createDestination);
router.put('/destinations/:id', AdminController.updateDestination);
router.delete('/destinations/:id', AdminController.deleteDestination);

router.post('/places', AdminController.addPlace);
router.post('/hotels', AdminController.addHotel);
router.post('/restaurants', AdminController.addRestaurant);

router.delete('/reviews/:id', AdminController.deleteReview);

export default router;
