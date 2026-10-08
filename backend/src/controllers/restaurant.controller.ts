import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class RestaurantController {
  static async getRestaurants(req: Request, res: Response): Promise<void> {
    try {
      const { destinationId, cuisine, priceRange } = req.query;

      const where: any = {};
      if (destinationId && typeof destinationId === 'string') {
        where.destinationId = destinationId;
      }
      if (cuisine && typeof cuisine === 'string') {
        where.cuisine = { contains: cuisine };
      }
      if (priceRange && typeof priceRange === 'string') {
        where.priceRange = priceRange;
      }

      const restaurants = await prisma.restaurant.findMany({
        where,
        include: {
          destination: {
            select: { id: true, name: true, state: true },
          },
        },
        orderBy: { rating: 'desc' },
      });

      const formatted = restaurants.map((r) => ({
        ...r,
        popularDishes: JSON.parse(r.popularDishes || '[]'),
      }));

      res.json({ success: true, count: formatted.length, restaurants: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRestaurantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: { destination: true },
      });

      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Restaurant not found' });
        return;
      }

      res.json({
        success: true,
        restaurant: {
          ...restaurant,
          popularDishes: JSON.parse(restaurant.popularDishes || '[]'),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
