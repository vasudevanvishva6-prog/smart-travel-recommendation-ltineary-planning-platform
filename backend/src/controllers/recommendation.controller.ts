import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RecommendationService } from '../services/recommendation.service';
import { prisma } from '../config/db';

export class RecommendationController {
  static async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      let { budget, durationDays, travelType, interests } = req.body;

      // If user is authenticated and some fields are missing, fetch user preferences
      if (req.user?.id && (!budget || !interests || !travelType)) {
        const userPref = await prisma.preference.findUnique({
          where: { userId: req.user.id },
        });

        if (userPref) {
          budget = budget ?? userPref.budget;
          durationDays = durationDays ?? userPref.durationDays;
          travelType = travelType ?? userPref.travelType;
          if (!interests && userPref.interests) {
            try {
              interests = JSON.parse(userPref.interests);
            } catch (_e) {
              interests = ['Nature', 'Adventure'];
            }
          }
        }
      }

      // Sensible defaults matching prompt
      budget = Number(budget) || 20000;
      durationDays = Number(durationDays) || 4;
      travelType = travelType || 'FRIENDS';
      interests = Array.isArray(interests) && interests.length > 0 ? interests : ['Nature', 'Adventure'];

      const recommendations = await RecommendationService.getRecommendations({
        budget,
        durationDays,
        travelType,
        interests,
      });

      res.json({
        success: true,
        query: {
          budget,
          durationDays,
          travelType,
          interests,
        },
        count: recommendations.length,
        recommendations,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
