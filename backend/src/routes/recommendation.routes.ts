import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', optionalAuthenticate, RecommendationController.getRecommendations);

export default router;
