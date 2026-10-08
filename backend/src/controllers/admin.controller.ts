import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class AdminController {
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const totalUsers = await prisma.user.count();
      const totalDestinations = await prisma.destination.count();
      const totalTrips = await prisma.trip.count();
      const totalReviews = await prisma.review.count();

      const popularDestinations = await prisma.destination.findMany({
        take: 5,
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
        select: {
          id: true,
          name: true,
          state: true,
          rating: true,
          reviewCount: true,
          averageBudget: true,
          heroImage: true,
          _count: {
            select: { trips: true, reviews: true },
          },
        },
      });

      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      });

      const recentTrips = await prisma.trip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true } },
          destination: { select: { name: true } },
        },
      });

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalDestinations,
          totalTrips,
          totalReviews,
          popularDestinations,
          recentUsers,
          recentTrips,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createDestination(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        slug,
        state,
        country = 'India',
        description,
        heroImage,
        images = [],
        bestTimeToVisit,
        averageBudget,
        latitude,
        longitude,
        categories = [],
        idealTravelTypes = [],
      } = req.body;

      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const destination = await prisma.destination.create({
        data: {
          name,
          slug: generatedSlug,
          state,
          country,
          description,
          heroImage,
          images: JSON.stringify(images),
          bestTimeToVisit,
          averageBudget: Number(averageBudget),
          latitude: Number(latitude),
          longitude: Number(longitude),
          categories: JSON.stringify(categories),
          idealTravelTypes: JSON.stringify(idealTravelTypes),
        },
      });

      res.status(201).json({ success: true, destination });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateDestination(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        state,
        country,
        description,
        heroImage,
        images,
        bestTimeToVisit,
        averageBudget,
        latitude,
        longitude,
        categories,
        idealTravelTypes,
      } = req.body;

      const destination = await prisma.destination.update({
        where: { id },
        data: {
          name,
          state,
          country,
          description,
          heroImage,
          images: images ? JSON.stringify(images) : undefined,
          bestTimeToVisit,
          averageBudget: averageBudget ? Number(averageBudget) : undefined,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
          categories: categories ? JSON.stringify(categories) : undefined,
          idealTravelTypes: idealTravelTypes ? JSON.stringify(idealTravelTypes) : undefined,
        },
      });

      res.json({ success: true, destination });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteDestination(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.destination.delete({ where: { id } });
      res.json({ success: true, message: 'Destination deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addPlace(req: Request, res: Response): Promise<void> {
    try {
      const { destinationId, name, description, image, category, visitDurationHours, entryFee, bestTimeOfDay, latitude, longitude } = req.body;
      const place = await prisma.place.create({
        data: {
          destinationId,
          name,
          description,
          image,
          category,
          visitDurationHours: Number(visitDurationHours) || 2.0,
          entryFee: Number(entryFee) || 0,
          bestTimeOfDay: bestTimeOfDay || 'MORNING',
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      });
      res.status(201).json({ success: true, place });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addHotel(req: Request, res: Response): Promise<void> {
    try {
      const { destinationId, name, image, pricePerNight, rating, address, amenities, latitude, longitude } = req.body;
      const hotel = await prisma.hotel.create({
        data: {
          destinationId,
          name,
          image,
          pricePerNight: Number(pricePerNight),
          rating: Number(rating) || 4.2,
          address,
          amenities: JSON.stringify(amenities || ['WiFi', 'Air Conditioning']),
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      });
      res.status(201).json({ success: true, hotel });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const { destinationId, name, image, cuisine, priceRange, rating, popularDishes, latitude, longitude } = req.body;
      const restaurant = await prisma.restaurant.create({
        data: {
          destinationId,
          name,
          image,
          cuisine,
          priceRange: priceRange || '₹₹',
          rating: Number(rating) || 4.3,
          popularDishes: JSON.stringify(popularDishes || []),
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      });
      res.status(201).json({ success: true, restaurant });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { trips: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, count: users.length, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.review.delete({ where: { id } });
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
