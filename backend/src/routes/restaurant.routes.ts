import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';

const router = Router();

router.get('/', RestaurantController.getRestaurants);
router.get('/:id', RestaurantController.getRestaurantById);

export default router;
