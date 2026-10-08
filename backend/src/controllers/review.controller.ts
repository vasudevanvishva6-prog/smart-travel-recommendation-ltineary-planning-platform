import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/db';

export class ReviewController {
  static async addReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { destinationId, rating, comment } = req.body;

      if (!destinationId || !rating || !comment) {
        res.status(400).json({ success: false, message: 'destinationId, rating and comment are required' });
        return;
      }

      const review = await prisma.review.create({
        data: {
          userId,
          destinationId,
          rating: Number(rating),
          comment,
        },
        include: {
          user: { select: { id: true, fullName: true, avatar: true } },
        },
      });

      // Recalculate destination rating
      const reviews = await prisma.review.findMany({
        where: { destinationId },
        select: { rating: true },
      });

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await prisma.destination.update({
        where: { id: destinationId },
        data: {
          rating: Number(avgRating.toFixed(1)),
          reviewCount: reviews.length,
        },
      });

      res.status(201).json({ success: true, message: 'Review submitted successfully', review });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDestinationReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { destinationId } = req.params;

      const reviews = await prisma.review.findMany({
        where: { destinationId },
        include: {
          user: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, count: reviews.length, reviews });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
