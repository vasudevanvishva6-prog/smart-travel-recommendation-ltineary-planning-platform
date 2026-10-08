import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { WeatherService } from '../services/weather.service';

export class DestinationController {
  static async getDestinations(req: Request, res: Response): Promise<void> {
    const { search, category, travelType, sortBy, maxBudget } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { state: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (maxBudget) {
      where.averageBudget = { lte: Number(maxBudget) };
    }

    let destinations = await prisma.destination.findMany({
      where,
      include: {
        _count: {
          select: { places: true, hotels: true, restaurants: true, reviews: true },
        },
      },
    });

    // Parse JSON fields
    let formatted = destinations.map((d) => ({
      ...d,
      images: JSON.parse(d.images || '[]'),
      categories: JSON.parse(d.categories || '[]'),
      idealTravelTypes: JSON.parse(d.idealTravelTypes || '[]'),
    }));

    // In-memory filter for category if specified
    if (category && typeof category === 'string') {
      const catLower = category.toLowerCase();
      formatted = formatted.filter((d) =>
        d.categories.some((c: string) => c.toLowerCase().includes(catLower))
      );
    }

    // In-memory filter for travel type
    if (travelType && typeof travelType === 'string') {
      const typeUpper = travelType.toUpperCase();
      formatted = formatted.filter((d) =>
        d.idealTravelTypes.some((t: string) => t.toUpperCase() === typeUpper)
      );
    }

    // Sorting
    if (sortBy === 'rating') {
      formatted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'budget_asc') {
      formatted.sort((a, b) => a.averageBudget - b.averageBudget);
    } else if (sortBy === 'budget_desc') {
      formatted.sort((a, b) => b.averageBudget - a.averageBudget);
    }

    res.json({
      success: true,
      count: formatted.length,
      destinations: formatted,
    });
  }

  static async getDestinationById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        places: true,
        hotels: true,
        restaurants: true,
        reviews: {
          include: {
            user: { select: { id: true, fullName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!destination) {
      res.status(404).json({ success: false, message: 'Destination not found' });
      return;
    }

    const weather = await WeatherService.getWeather(destination.name, 4);

    const formatted = {
      ...destination,
      images: JSON.parse(destination.images || '[]'),
      categories: JSON.parse(destination.categories || '[]'),
      idealTravelTypes: JSON.parse(destination.idealTravelTypes || '[]'),
      weather,
      hotels: destination.hotels.map((h) => ({
        ...h,
        amenities: JSON.parse(h.amenities || '[]'),
      })),
      restaurants: destination.restaurants.map((r) => ({
        ...r,
        popularDishes: JSON.parse(r.popularDishes || '[]'),
      })),
    };

    res.json({ success: true, destination: formatted });
  }

  static async getDestinationBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;

    const destination = await prisma.destination.findUnique({
      where: { slug },
      include: {
        places: true,
        hotels: true,
        restaurants: true,
        reviews: {
          include: {
            user: { select: { id: true, fullName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!destination) {
      res.status(404).json({ success: false, message: 'Destination not found' });
      return;
    }

    const weather = await WeatherService.getWeather(destination.name, 4);

    const formatted = {
      ...destination,
      images: JSON.parse(destination.images || '[]'),
      categories: JSON.parse(destination.categories || '[]'),
      idealTravelTypes: JSON.parse(destination.idealTravelTypes || '[]'),
      weather,
      hotels: destination.hotels.map((h) => ({
        ...h,
        amenities: JSON.parse(h.amenities || '[]'),
      })),
      restaurants: destination.restaurants.map((r) => ({
        ...r,
        popularDishes: JSON.parse(r.popularDishes || '[]'),
      })),
    };

    res.json({ success: true, destination: formatted });
  }

  static async getFeaturedAndTrending(_req: Request, res: Response): Promise<void> {
    const destinations = await prisma.destination.findMany({
      include: {
        _count: { select: { places: true, hotels: true, restaurants: true } },
      },
      orderBy: { rating: 'desc' },
      take: 8,
    });

    const parsedDestinations = destinations.map((d) => ({
      ...d,
      images: JSON.parse(d.images || '[]'),
      categories: JSON.parse(d.categories || '[]'),
      idealTravelTypes: JSON.parse(d.idealTravelTypes || '[]'),
    }));

    // Popular destinations (top 4)
    const popular = parsedDestinations.slice(0, 4);

    // Trending places (extracted from popular destinations)
    const trendingPlaces = await prisma.place.findMany({
      take: 6,
      orderBy: { rating: 'desc' },
      include: { destination: { select: { id: true, name: true, state: true } } },
    });

    // Categories with metadata & images
    const categories = [
      { name: 'Nature', count: 18, image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80', description: 'Serene forests, misty valleys & scenic hills' },
      { name: 'Adventure', count: 14, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', description: 'Trekking, rafting, parasailing & thrill sports' },
      { name: 'Beach', count: 12, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', description: 'Golden sands, turquoise waters & coastal sunsets' },
      { name: 'Historical', count: 15, image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80', description: 'Royal forts, palaces & timeless heritage' },
      { name: 'Food', count: 11, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80', description: 'Authentic local delicacies & food trails' },
      { name: 'Religious', count: 9, image: 'https://images.unsplash.com/photo-1561361066-8889a71092aa?auto=format&fit=crop&w=600&q=80', description: 'Sacred temples, shrines & spiritual peace' },
      { name: 'Shopping', count: 8, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80', description: 'Handcrafted souvenirs & vibrant flea markets' },
    ];

    // Special packages / offers
    const packages = [
      {
        id: 'pkg-1',
        title: 'Misty Mountains Ooty & Coorg',
        duration: '4 Days / 3 Nights',
        originalPrice: 12000,
        offerPrice: 8999,
        discount: '25% OFF',
        image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80',
        destinations: ['Ooty', 'Coorg'],
        tag: 'Popular Hill Station',
      },
      {
        id: 'pkg-2',
        title: 'Kerala Backwaters & Tea Gardens',
        duration: '5 Days / 4 Nights',
        originalPrice: 24000,
        offerPrice: 18500,
        discount: '23% OFF',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
        destinations: ['Munnar', 'Alleppey', 'Fort Kochi'],
        tag: 'Best Seller',
      },
      {
        id: 'pkg-3',
        title: 'Goa Coastal Sun & Adventure',
        duration: '4 Days / 3 Nights',
        originalPrice: 18000,
        offerPrice: 13999,
        discount: '22% OFF',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
        destinations: ['Calangute', 'Anjuna', 'Old Goa'],
        tag: 'Friends Special',
      },
      {
        id: 'pkg-4',
        title: 'Royal Heritage of Rajasthan',
        duration: '4 Days / 3 Nights',
        originalPrice: 20000,
        offerPrice: 15499,
        discount: '20% OFF',
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
        destinations: ['Jaipur', 'Amber'],
        tag: 'Royal Experience',
      },
    ];

    res.json({
      success: true,
      popularDestinations: popular,
      trendingPlaces,
      categories,
      packages,
    });
  }
}
