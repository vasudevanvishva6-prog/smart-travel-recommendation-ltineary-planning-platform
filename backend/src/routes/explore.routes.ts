import { Router } from 'express';
import { ExploreController } from '../controllers/explore.controller';

const router = Router();

router.get('/search', ExploreController.search);
router.get('/nearby', ExploreController.nearby);

export default router;
