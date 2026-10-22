import { Router } from 'express';
import authRoutes from './auth.routes';
import destinationRoutes from './destination.routes';
import recommendationRoutes from './recommendation.routes';
import itineraryRoutes from './itinerary.routes';
import hotelRoutes from './hotel.routes';
import restaurantRoutes from './restaurant.routes';
import reviewRoutes from './review.routes';
import wishlistRoutes from './wishlist.routes';
import adminRoutes from './admin.routes';
import exploreRoutes from './explore.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/itineraries', itineraryRoutes);
router.use('/hotels', hotelRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/admin', adminRoutes);
router.use('/explore', exploreRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'Smart Travel Recommendation & Itinerary Planning API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
