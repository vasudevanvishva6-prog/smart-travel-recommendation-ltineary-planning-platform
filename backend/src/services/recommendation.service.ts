import { prisma } from '../config/db';

export interface RecommendationParams {
  budget: number;
  durationDays: number;
  travelType: string; // SOLO, COUPLE, FAMILY, FRIENDS
  interests: string[]; // Nature, Adventure, Beach, Historical, Shopping, Food, Religious
}

export interface RecommendationResult {
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  description: string;
  heroImage: string;
  bestTimeToVisit: string;
  averageBudget: number;
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  weatherTemp: number;
  weatherCondition: string;
  matchScore: number; // e.g. 92
  matchPercentage: string; // e.g. "92%"
  matchReasons: string[];
  estimatedCostForTrip: number;
  categories: string[];
  idealTravelTypes: string[];
  placesCount: number;
  hotelsCount: number;
  restaurantsCount: number;
}

export class RecommendationService {
  static async getRecommendations(params: RecommendationParams): Promise<RecommendationResult[]> {
    const { budget, durationDays, travelType, interests } = params;

    const destinations = await prisma.destination.findMany({
      include: {
        _count: {
          select: {
            places: true,
            hotels: true,
            restaurants: true,
          },
        },
      },
    });

    const userInterestsLower = (interests || []).map((i) => i.toLowerCase().trim());
    const normalizedTravelType = (travelType || 'SOLO').toUpperCase();

    const scoredDestinations = destinations.map((dest) => {
      let destCategories: string[] = [];
      let idealTravelTypes: string[] = [];
      try {
        destCategories = JSON.parse(dest.categories);
      } catch (_e) {
        destCategories = [dest.categories];
      }

      try {
        idealTravelTypes = JSON.parse(dest.idealTravelTypes);
      } catch (_e) {
        idealTravelTypes = [dest.idealTravelTypes];
      }

      const destCategoriesLower = destCategories.map((c) => c.toLowerCase());
      const idealTypesUpper = idealTravelTypes.map((t) => t.toUpperCase());

      // 1. Interest Matching Score (0 - 45 points)
      let interestScore = 0;
      const matchedInterests: string[] = [];

      if (userInterestsLower.length > 0) {
        let matchCount = 0;
        for (const userInt of userInterestsLower) {
          const found = destCategoriesLower.some(
            (cat) => cat.includes(userInt) || userInt.includes(cat)
          );
          if (found) {
            matchCount++;
            matchedInterests.push(userInt);
          }
        }
        const overlapRatio = matchCount / Math.max(userInterestsLower.length, 1);
        interestScore = overlapRatio * 45;
      } else {
        interestScore = 30; // default moderate score
      }

      // 2. Budget Compatibility Score (0 - 25 points)
      // Destination base cost scales moderately with duration
      const dayFactor = Math.max(durationDays / 3, 0.7);
      const estimatedCost = Math.round(dest.averageBudget * dayFactor * 2.1);
      
      let budgetScore = 25;
      const budgetDiffRatio = (budget - estimatedCost) / budget;

      if (budgetDiffRatio >= 0) {
        // Fits within user budget comfortably
        if (budgetDiffRatio < 0.35) {
          budgetScore = 25; // Sweet spot
        } else {
          budgetScore = 22; // Well within budget
        }
      } else {
        // Exceeds budget
        const overBudgetPercent = Math.abs(budgetDiffRatio);
        if (overBudgetPercent < 0.15) {
          budgetScore = 20; // Slightly higher but feasible
        } else if (overBudgetPercent < 0.35) {
          budgetScore = 13;
        } else {
          budgetScore = Math.max(5, Math.round(25 - overBudgetPercent * 30));
        }
      }

      // 3. Travel Type Compatibility (0 - 20 points)
      let travelTypeScore = 10;
      let travelTypeMatch = false;
      if (idealTypesUpper.includes(normalizedTravelType)) {
        travelTypeScore = 20;
        travelTypeMatch = true;
      } else {
        travelTypeScore = 12;
      }

      // 4. Rating & Quality Score (0 - 10 points)
      const ratingScore = Math.min(10, Math.round((dest.rating / 5.0) * 10));

      // Calculate total match score (scaled 50% to 98% for realistic matching experience)
      const rawScore = interestScore + budgetScore + travelTypeScore + ratingScore;
      const matchScore = Math.min(98, Math.max(55, Math.round(rawScore)));

      // Generate dynamic human-readable match badges/reasons
      const matchReasons: string[] = [];
      if (matchedInterests.length > 0) {
        const titleCaseInterests = matchedInterests
          .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
          .join(' & ');
        matchReasons.push(`Top match for ${titleCaseInterests}`);
      }
      if (travelTypeMatch) {
        matchReasons.push(`Ideal destination for ${normalizedTravelType.toLowerCase()} trips`);
      }
      if (budget >= estimatedCost) {
        matchReasons.push(`Well within your ₹${budget.toLocaleString('en-IN')} budget`);
      } else {
        matchReasons.push(`Moderate package (approx ₹${estimatedCost.toLocaleString('en-IN')})`);
      }
      if (dest.rating >= 4.5) {
        matchReasons.push(`Highly rated: ⭐ ${dest.rating.toFixed(1)}/5`);
      }

      return {
        id: dest.id,
        name: dest.name,
        slug: dest.slug,
        state: dest.state,
        country: dest.country,
        description: dest.description,
        heroImage: dest.heroImage,
        bestTimeToVisit: dest.bestTimeToVisit,
        averageBudget: dest.averageBudget,
        rating: dest.rating,
        reviewCount: dest.reviewCount,
        latitude: dest.latitude,
        longitude: dest.longitude,
        weatherTemp: dest.weatherTemp,
        weatherCondition: dest.weatherCondition,
        matchScore,
        matchPercentage: `${matchScore}%`,
        matchReasons: matchReasons.slice(0, 3),
        estimatedCostForTrip: estimatedCost,
        categories: destCategories,
        idealTravelTypes,
        placesCount: dest._count.places,
        hotelsCount: dest._count.hotels,
        restaurantsCount: dest._count.restaurants,
      };
    });

    // Sort descending by match score
    scoredDestinations.sort((a, b) => b.matchScore - a.matchScore);

    return scoredDestinations;
  }
}
