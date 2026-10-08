import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ItineraryService } from '../services/itinerary.service';
import { prisma } from '../config/db';

export class ItineraryController {
  static async generateItinerary(req: Request, res: Response): Promise<void> {
    try {
      const { destinationId, durationDays, travelType, userBudget } = req.body;

      if (!destinationId) {
        res.status(400).json({ success: false, message: 'destinationId is required' });
        return;
      }

      const itinerary = await ItineraryService.generate({
        destinationId,
        durationDays: Number(durationDays) || 4,
        travelType: travelType || 'FRIENDS',
        userBudget: Number(userBudget) || 20000,
      });

      res.json({
        success: true,
        itinerary,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveTrip(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required to save trip' });
        return;
      }

      const trip = await ItineraryService.saveTrip(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Trip saved to your itinerary list successfully!',
        trip,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserTrips(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const trips = await prisma.trip.findMany({
        where: { userId },
        include: {
          destination: true,
          days: {
            include: {
              activities: true,
            },
            orderBy: { dayNumber: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        count: trips.length,
        trips,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTripById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
          destination: {
            include: {
              places: true,
              hotels: true,
              restaurants: true,
            },
          },
          days: {
            include: {
              activities: true,
            },
            orderBy: { dayNumber: 'asc' },
          },
        },
      });

      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      // Check authorization
      if (trip.userId !== userId && req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      res.json({ success: true, trip });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteTrip(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const trip = await prisma.trip.findUnique({ where: { id } });
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      if (trip.userId !== userId && req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      await prisma.trip.delete({ where: { id } });

      res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateTripStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      const trip = await prisma.trip.findUnique({ where: { id } });
      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      if (trip.userId !== userId && req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const updated = await prisma.trip.update({
        where: { id },
        data: { status },
      });

      res.json({ success: true, trip: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
