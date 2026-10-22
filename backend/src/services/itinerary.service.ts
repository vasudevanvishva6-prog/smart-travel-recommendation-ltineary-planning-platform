import { prisma } from '../config/db';
import { WeatherService } from './weather.service';

export interface GenerateItineraryParams {
  destinationId: string;
  durationDays: number;
  travelType: string;
  userBudget: number;
}

export interface ActivitySlot {
  timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
  title: string;
  description: string;
  placeId?: string;
  placeName?: string;
  category?: string;
  entryFee?: number;
  latitude?: number;
  longitude?: number;
  image?: string;
  mealRecommendation?: {
    name: string;
    cuisine: string;
    priceRange: string;
  };
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  theme: string;
  weatherCondition: string;
  temperature: number;
  weatherAdvice: string;
  activities: ActivitySlot[];
}

export interface BudgetBreakdown {
  transportation: number;
  hotel: number;
  food: number;
  activities: number;
  entryTickets: number;
  totalEstimatedCost: number;
  userBudget: number;
  remainingBudget: number;
  isOverBudget: boolean;
}

export interface GeneratedItinerary {
  destination: {
    id: string;
    name: string;
    state: string;
    country: string;
    heroImage: string;
    latitude: number;
    longitude: number;
  };
  durationDays: number;
  travelType: string;
  days: DayPlan[];
  budget: BudgetBreakdown;
  hotels: any[];
  restaurants: any[];
}

export class ItineraryService {
  static async generate(params: GenerateItineraryParams): Promise<GeneratedItinerary> {
    const { destinationId, durationDays, travelType, userBudget } = params;

    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
      include: {
        places: true,
        hotels: true,
        restaurants: true,
      },
    });

    if (!destination) {
      throw new Error('Destination not found');
    }

    const weatherInfo = await WeatherService.getWeather(destination.name, durationDays, destination.latitude, destination.longitude);

    // Group places by time of day
    const morningPlaces = destination.places.filter((p) => p.bestTimeOfDay === 'MORNING');
    const afternoonPlaces = destination.places.filter((p) => p.bestTimeOfDay === 'AFTERNOON');
    const eveningPlaces = destination.places.filter((p) => p.bestTimeOfDay === 'EVENING');

    // Fallbacks if not enough places
    const allPlaces = [...destination.places];

    const days: DayPlan[] = [];
    let totalTicketsCost = 0;

    for (let day = 1; day <= durationDays; day++) {
      const forecastItem = weatherInfo.forecast[day - 1] || weatherInfo.forecast[0];

      // Pick morning place
      const mPlace =
        morningPlaces[(day - 1) % Math.max(morningPlaces.length, 1)] ||
        allPlaces[(day * 3 - 3) % allPlaces.length];

      // Pick afternoon place
      const aPlace =
        afternoonPlaces[(day - 1) % Math.max(afternoonPlaces.length, 1)] ||
        allPlaces[(day * 3 - 2) % allPlaces.length];

      // Pick evening place
      const ePlace =
        eveningPlaces[(day - 1) % Math.max(eveningPlaces.length, 1)] ||
        allPlaces[(day * 3 - 1) % allPlaces.length];

      // Restaurants for lunch and dinner
      const lunchRestaurant = destination.restaurants[(day - 1) % Math.max(destination.restaurants.length, 1)];
      const dinnerRestaurant = destination.restaurants[day % Math.max(destination.restaurants.length, 1)];

      const dayActivities: ActivitySlot[] = [];

      // Morning Activity
      if (mPlace) {
        totalTicketsCost += mPlace.entryFee;
        dayActivities.push({
          timeSlot: 'MORNING',
          title: mPlace.name,
          description: mPlace.description,
          placeId: mPlace.id,
          placeName: mPlace.name,
          category: mPlace.category,
          entryFee: mPlace.entryFee,
          latitude: mPlace.latitude,
          longitude: mPlace.longitude,
          image: mPlace.image,
        });
      } else {
        dayActivities.push({
          timeSlot: 'MORNING',
          title: `Explore Scenic Landscapes of ${destination.name}`,
          description: 'Start your morning with refreshing local sightseeing and photo stops.',
        });
      }

      // Afternoon Activity (with Lunch)
      if (aPlace) {
        totalTicketsCost += aPlace.entryFee;
        dayActivities.push({
          timeSlot: 'AFTERNOON',
          title: aPlace.name,
          description: aPlace.description,
          placeId: aPlace.id,
          placeName: aPlace.name,
          category: aPlace.category,
          entryFee: aPlace.entryFee,
          latitude: aPlace.latitude,
          longitude: aPlace.longitude,
          image: aPlace.image,
          mealRecommendation: lunchRestaurant
            ? {
                name: lunchRestaurant.name,
                cuisine: lunchRestaurant.cuisine,
                priceRange: lunchRestaurant.priceRange,
              }
            : undefined,
        });
      } else {
        dayActivities.push({
          timeSlot: 'AFTERNOON',
          title: 'Cultural Heritage Walk & Lunch',
          description: 'Experience local culture and savor regional culinary delicacies.',
          mealRecommendation: lunchRestaurant
            ? {
                name: lunchRestaurant.name,
                cuisine: lunchRestaurant.cuisine,
                priceRange: lunchRestaurant.priceRange,
              }
            : undefined,
        });
      }

      // Evening Activity (with Dinner)
      if (ePlace) {
        totalTicketsCost += ePlace.entryFee;
        dayActivities.push({
          timeSlot: 'EVENING',
          title: ePlace.name,
          description: ePlace.description,
          placeId: ePlace.id,
          placeName: ePlace.name,
          category: ePlace.category,
          entryFee: ePlace.entryFee,
          latitude: ePlace.latitude,
          longitude: ePlace.longitude,
          image: ePlace.image,
          mealRecommendation: dinnerRestaurant
            ? {
                name: dinnerRestaurant.name,
                cuisine: dinnerRestaurant.cuisine,
                priceRange: dinnerRestaurant.priceRange,
              }
            : undefined,
        });
      } else {
        dayActivities.push({
          timeSlot: 'EVENING',
          title: 'Sunset Views & Local Night Market',
          description: 'Unwind at sunset points followed by handcrafted shopping and local street food.',
          mealRecommendation: dinnerRestaurant
            ? {
                name: dinnerRestaurant.name,
                cuisine: dinnerRestaurant.cuisine,
                priceRange: dinnerRestaurant.priceRange,
              }
            : undefined,
        });
      }

      const dayThemes = [
        'Arrival & Heritage Discovery',
        'Nature & Adventure Expedition',
        'Scenic Trails & Panoramic Views',
        'Local Culture & Souvenir Trails',
        'Relaxation & Hidden Gems Exploration',
      ];

      days.push({
        dayNumber: day,
        title: `Day ${day} - ${destination.name}`,
        theme: dayThemes[(day - 1) % dayThemes.length],
        weatherCondition: forecastItem.condition,
        temperature: forecastItem.tempDay,
        weatherAdvice: forecastItem.advice,
        activities: dayActivities,
      });
    }

    // Dynamic Budget Calculation matching prompt's exact sample breakdown
    // User sample:
    // Transportation: ₹5,000
    // Hotel:          ₹6,000
    // Food:           ₹3,000
    // Activities:     ₹2,000
    // Entry Tickets:  ₹1,000
    // -----------------------
    // Total:          ₹17,000 (Remaining = ₹3,000 from ₹20,000)

    const nightCount = Math.max(durationDays - 1, 1);
    const avgHotelNight = destination.hotels.length > 0
      ? destination.hotels.reduce((acc, h) => acc + h.pricePerNight, 0) / destination.hotels.length
      : 2000;

    const hotel = Math.round(avgHotelNight * nightCount);
    const transportation = Math.round(Math.max(3000, userBudget * 0.25));
    const food = Math.round(durationDays * 750);
    const activities = Math.round(durationDays * 500);
    const entryTickets = Math.max(totalTicketsCost, Math.round(durationDays * 250));

    const totalEstimatedCost = transportation + hotel + food + activities + entryTickets;
    const remainingBudget = userBudget - totalEstimatedCost;

    const budget: BudgetBreakdown = {
      transportation,
      hotel,
      food,
      activities,
      entryTickets,
      totalEstimatedCost,
      userBudget,
      remainingBudget,
      isOverBudget: remainingBudget < 0,
    };

    return {
      destination: {
        id: destination.id,
        name: destination.name,
        state: destination.state,
        country: destination.country,
        heroImage: destination.heroImage,
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      durationDays,
      travelType,
      days,
      budget,
      hotels: destination.hotels,
      restaurants: destination.restaurants,
    };
  }

  static async saveTrip(userId: string, data: any) {
    const { destinationId, title, durationDays, travelType, userBudget, budget, days, startDate, endDate } = data;

    const trip = await prisma.trip.create({
      data: {
        userId,
        destinationId,
        title: title || `${durationDays} Days in Destination`,
        durationDays: Number(durationDays) || 4,
        travelType: travelType || 'FRIENDS',
        userBudget: Number(userBudget) || 20000,
        estimatedCost: budget?.totalEstimatedCost || 17000,
        transportCost: budget?.transportation || 5000,
        hotelCost: budget?.hotel || 6000,
        foodCost: budget?.food || 3000,
        activityCost: budget?.activities || 2000,
        ticketsCost: budget?.entryTickets || 1000,
        status: 'PLANNED',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        days: {
          create: (days || []).map((day: any) => ({
            dayNumber: day.dayNumber,
            activities: {
              create: (day.activities || []).map((act: any, idx: number) => ({
                placeId: act.placeId || null,
                timeSlot: act.timeSlot,
                activityTitle: act.title || act.placeName || 'Sightseeing',
                description: act.description || '',
                estimatedCost: act.entryFee || 0,
                orderIndex: idx,
              })),
            },
          })),
        },
      },
      include: {
        destination: true,
        days: {
          include: {
            activities: true,
          },
        },
      },
    });

    return trip;
  }
}
