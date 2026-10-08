import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class HotelController {
  static async getHotels(req: Request, res: Response): Promise<void> {
    try {
      const { destinationId, maxPrice, minRating } = req.query;

      const where: any = {};
      if (destinationId && typeof destinationId === 'string') {
        where.destinationId = destinationId;
      }
      if (maxPrice) {
        where.pricePerNight = { lte: Number(maxPrice) };
      }
      if (minRating) {
        where.rating = { gte: Number(minRating) };
      }

      const hotels = await prisma.hotel.findMany({
        where,
        include: {
          destination: {
            select: { id: true, name: true, state: true },
          },
        },
        orderBy: { rating: 'desc' },
      });

      const formatted = hotels.map((h) => ({
        ...h,
        amenities: JSON.parse(h.amenities || '[]'),
      }));

      res.json({ success: true, count: formatted.length, hotels: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHotelById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const hotel = await prisma.hotel.findUnique({
        where: { id },
        include: { destination: true },
      });

      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      res.json({
        success: true,
        hotel: {
          ...hotel,
          amenities: JSON.parse(hotel.amenities || '[]'),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
