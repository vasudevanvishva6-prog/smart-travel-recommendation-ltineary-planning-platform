export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  preference?: UserPreference;
}

export interface UserPreference {
  budget: number;
  durationDays: number;
  travelType: string;
  interests: string[];
}

export interface Place {
  id: string;
  destinationId: string;
  name: string;
  description: string;
  image: string;
  category: string;
  visitDurationHours: number;
  entryFee: number;
  bestTimeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING';
  latitude: number;
  longitude: number;
  rating: number;
}

export interface Hotel {
  id: string;
  destinationId: string;
  name: string;
  image: string;
  pricePerNight: number;
  rating: number;
  address: string;
  amenities: string[];
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  destinationId: string;
  name: string;
  image: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  popularDishes: string[];
  latitude: number;
  longitude: number;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  description: string;
  heroImage: string;
  images: string[];
  bestTimeToVisit: string;
  averageBudget: number;
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  categories: string[];
  idealTravelTypes: string[];
  weatherTemp: number;
  weatherCondition: string;
  weatherHumidity: number;
  places?: Place[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  reviews?: Review[];
  weather?: WeatherInfo;
  _count?: {
    places: number;
    hotels: number;
    restaurants: number;
    reviews?: number;
  };
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeedKmH: number;
  rainProbability: number;
  feelsLike: number;
  forecast: Array<{
    dayNumber: number;
    tempDay: number;
    tempNight: number;
    condition: string;
    advice: string;
  }>;
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
  matchScore: number;
  matchPercentage: string;
  matchReasons: string[];
  estimatedCostForTrip: number;
  categories: string[];
  idealTravelTypes: string[];
  placesCount: number;
  hotelsCount: number;
  restaurantsCount: number;
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
  hotels: Hotel[];
  restaurants: Restaurant[];
}

export interface Trip {
  id: string;
  userId: string;
  destinationId: string;
  destination: Destination;
  title: string;
  durationDays: number;
  travelType: string;
  userBudget: number;
  estimatedCost: number;
  transportCost: number;
  hotelCost: number;
  foodCost: number;
  activityCost: number;
  ticketsCost: number;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  days: Array<{
    id: string;
    dayNumber: number;
    activities: Array<{
      id: string;
      timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
      activityTitle: string;
      description?: string;
      estimatedCost: number;
      orderIndex: number;
    }>;
  }>;
}

export interface Review {
  id: string;
  userId: string;
  destinationId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface WishlistItem {
  id: string;
  destinationId: string;
  destination: Destination;
}

// ---- Live explore (OpenStreetMap / Open-Meteo / Wikipedia) ----
export interface GeoPlace {
  name: string;
  displayName: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  type: string;
}

export interface LivePoi {
  id: string;
  kind: 'attraction' | 'food' | 'stay';
  name: string;
  subtype: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  address?: string;
  cuisine?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  stars?: string;
  fee?: string;
  vegetarian?: string;
  wikipedia?: string;
  mapsUrl: string;
}

export interface LiveWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeedKmH: number;
  condition: string;
  isDay: boolean;
  rainProbability: number;
  updatedAt: string;
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    rainProbability: number;
    condition: string;
  }>;
}

export interface ExploreResult {
  success: boolean;
  center: { latitude: number; longitude: number; radiusKm: number };
  attractions: LivePoi[];
  food: LivePoi[];
  stays: LivePoi[];
  weather: LiveWeather | null;
  summary: { title: string; extract: string; image?: string; url?: string } | null;
  fetchedAt: string;
  sources: string[];
}
