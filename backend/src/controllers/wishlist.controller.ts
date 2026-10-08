import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/db';

export class WishlistController {
  static async toggleWishlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { destinationId } = req.body;
      if (!destinationId) {
        res.status(400).json({ success: false, message: 'destinationId is required' });
        return;
      }

      const existing = await prisma.wishlist.findUnique({
        where: {
          userId_destinationId: {
            userId,
            destinationId,
          },
        },
      });

      if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
        res.json({ success: true, isSaved: false, message: 'Removed from saved wishlist' });
        return;
      }

      await prisma.wishlist.create({
        data: { userId, destinationId },
      });

      res.json({ success: true, isSaved: true, message: 'Added to saved wishlist' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getWishlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const items = await prisma.wishlist.findMany({
        where: { userId },
        include: {
          destination: {
            include: {
              _count: { select: { places: true, hotels: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = items.map((i) => ({
        id: i.id,
        destinationId: i.destinationId,
        destination: {
          ...i.destination,
          images: JSON.parse(i.destination.images || '[]'),
          categories: JSON.parse(i.destination.categories || '[]'),
        },
      }));

      res.json({ success: true, count: formatted.length, wishlist: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
