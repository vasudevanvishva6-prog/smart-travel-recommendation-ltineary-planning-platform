import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/toggle', WishlistController.toggleWishlist);
router.get('/', WishlistController.getWishlist);

export default router;
