import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';

const router = Router();

router.get('/', HotelController.getHotels);
router.get('/:id', HotelController.getHotelById);

export default router;
