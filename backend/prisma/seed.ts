import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.tripActivity.deleteMany();
  await prisma.tripDay.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.place.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', adminSalt);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@travel.com',
      fullName: 'System Administrator',
      passwordHash: adminHash,
      role: 'ADMIN',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });

  // Create Standard Traveler User
  const userSalt = await bcrypt.genSalt(10);
  const userHash = await bcrypt.hash('traveler123', userSalt);
  const user = await prisma.user.create({
    data: {
      email: 'traveler@gmail.com',
      fullName: 'Rahul Sharma',
      passwordHash: userHash,
      role: 'USER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      preference: {
        create: {
          budget: 20000,
          durationDays: 4,
          travelType: 'FRIENDS',
          interests: JSON.stringify(['Nature', 'Adventure', 'Beach']),
        },
      },
    },
  });

  console.log('✅ Users created: admin@travel.com, traveler@gmail.com');

  // Destinations Data
  const destinationsData = [
    {
      name: 'Kerala',
      slug: 'kerala',
      state: 'Kerala',
      country: 'India',
      description: 'Known as "God\'s Own Country", Kerala is famous for its serene backwaters, lush emerald tea plantations in Munnar, serene coastal shores, and rejuvenating Ayurvedic wellness.',
      heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'September – March',
      averageBudget: 12000,
      rating: 4.8,
      reviewCount: 320,
      latitude: 9.9312,
      longitude: 76.2673,
      categories: ['Nature', 'Adventure', 'Beach', 'Food'],
      idealTravelTypes: ['FRIENDS', 'FAMILY', 'COUPLE', 'SOLO'],
      weatherTemp: 28,
      weatherCondition: 'Warm Coastal Breeze',
      weatherHumidity: 72,
      places: [
        {
          name: 'Munnar Tea Museum & Gardens',
          description: 'Sprawling green tea estates with historical tea making machinery and tea tasting experiences.',
          image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          visitDurationHours: 2.5,
          entryFee: 150,
          bestTimeOfDay: 'MORNING',
          latitude: 10.0889,
          longitude: 77.0595,
          rating: 4.7,
        },
        {
          name: 'Mattupetty Dam & Lake',
          description: 'Scenic storage reservoir nestled among hills, popular for speedboating and misty reservoir views.',
          image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
          category: 'Adventure',
          visitDurationHours: 2.0,
          entryFee: 50,
          bestTimeOfDay: 'AFTERNOON',
          latitude: 10.1066,
          longitude: 77.1239,
          rating: 4.5,
        },
        {
          name: 'Eravikulam National Park',
          description: 'High altitude sanctuary home to the endangered Nilgiri Tahr and blooming Neelakurinji flowers.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          visitDurationHours: 3.0,
          entryFee: 200,
          bestTimeOfDay: 'MORNING',
          latitude: 10.1517,
          longitude: 77.0601,
          rating: 4.8,
        },
        {
          name: 'Alleppey Houseboat Backwaters',
          description: 'Glide on traditional Kettuvallam houseboats through tranquil palm-fringed canals and lagoons.',
          image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          visitDurationHours: 4.0,
          entryFee: 1200,
          bestTimeOfDay: 'AFTERNOON',
          latitude: 9.4981,
          longitude: 76.3388,
          rating: 4.9,
        },
        {
          name: 'Fort Kochi Heritage & Chinese Fishing Nets',
          description: 'Colonial lanes, Portuguese architecture, art cafes, and iconic cantilevered Chinese fishing nets.',
          image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
          category: 'Historical',
          visitDurationHours: 2.5,
          entryFee: 0,
          bestTimeOfDay: 'EVENING',
          latitude: 9.9658,
          longitude: 76.2421,
          rating: 4.6,
        },
      ],
      hotels: [
        {
          name: 'Windermere Estate Resort',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 4200,
          rating: 4.8,
          address: 'Pothamedu, Munnar, Kerala',
          amenities: ['Tea Garden View', 'Free WiFi', 'Breakfast', 'Fireplace', 'Mountain Treks'],
          latitude: 10.0754,
          longitude: 77.0621,
        },
        {
          name: 'Lake Palace Backwater Resort',
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 3500,
          rating: 4.6,
          address: 'Thirumala Ward, Alleppey, Kerala',
          amenities: ['Lake View', 'Ayurveda Spa', 'Houseboat Dock', 'Swimming Pool', 'Breakfast'],
          latitude: 9.512,
          longitude: 76.345,
        },
      ],
      restaurants: [
        {
          name: 'Malabar Junction & Seafood Bar',
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          cuisine: 'Traditional Kerala Seafood',
          priceRange: '₹₹',
          rating: 4.7,
          popularDishes: ['Karimeen Pollichathu', 'Appam with Stew', 'Malabar Prawn Curry'],
          latitude: 9.966,
          longitude: 76.244,
        },
        {
          name: 'Rapsy Restaurant Munnar',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          cuisine: 'South Indian & Kerala Meals',
          priceRange: '₹',
          rating: 4.5,
          popularDishes: ['Kerala Parotta with Beef Roast', 'Biryani', 'Cardamom Tea'],
          latitude: 10.089,
          longitude: 77.06,
        },
      ],
    },
    {
      name: 'Goa',
      slug: 'goa',
      state: 'Goa',
      country: 'India',
      description: 'The party and coastal jewel of India featuring golden sandy beaches, vibrant shacks, Portuguese heritage forts, thrilling water sports, and lively nightlife.',
      heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'November – February',
      averageBudget: 11000,
      rating: 4.7,
      reviewCount: 410,
      latitude: 15.2993,
      longitude: 74.124,
      categories: ['Beach', 'Adventure', 'Food', 'Shopping'],
      idealTravelTypes: ['FRIENDS', 'COUPLE', 'SOLO'],
      weatherTemp: 30,
      weatherCondition: 'Sunny Coastal Breeze',
      weatherHumidity: 68,
      places: [
        {
          name: 'Calangute & Baga Beach',
          description: 'The vibrant queen of beaches with parasailing, jet skiing, beach shacks, and sunbeds.',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
          category: 'Beach',
          visitDurationHours: 3.0,
          entryFee: 0,
          bestTimeOfDay: 'AFTERNOON',
          latitude: 15.5439,
          longitude: 73.7553,
          rating: 4.6,
        },
        {
          name: 'Fort Aguada & Lighthouse',
          description: '17th-century Portuguese fort overlooking the Arabian Sea, offering panoramic sunset horizons.',
          image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
          category: 'Historical',
          visitDurationHours: 2.0,
          entryFee: 50,
          bestTimeOfDay: 'EVENING',
          latitude: 15.4924,
          longitude: 73.7736,
          rating: 4.7,
        },
        {
          name: 'Dudhsagar Waterfalls Trek',
          description: 'Four-tiered spectacular cascading waterfall located in the dense Bhagwan Mahaveer Sanctuary.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          category: 'Adventure',
          visitDurationHours: 4.0,
          entryFee: 500,
          bestTimeOfDay: 'MORNING',
          latitude: 15.3144,
          longitude: 74.3143,
          rating: 4.9,
        },
        {
          name: 'Anjuna Flea Market & Sunset Point',
          description: 'Bohemian open-air bazaar filled with handcrafted jewelry, clothes, live music, and sea breezes.',
          image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
          category: 'Shopping',
          visitDurationHours: 2.5,
          entryFee: 0,
          bestTimeOfDay: 'EVENING',
          latitude: 15.5806,
          longitude: 73.7428,
          rating: 4.5,
        },
      ],
      hotels: [
        {
          name: 'Taj Fort Aguada Resort',
          image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 5500,
          rating: 4.9,
          address: 'Sinquerim, Candolim, Goa',
          amenities: ['Private Beach', 'Infinity Pool', 'Spa', 'Sea View Dining', 'Bar'],
          latitude: 15.495,
          longitude: 73.774,
        },
        {
          name: 'Zostel Goa Morjim',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 1600,
          rating: 4.6,
          address: 'Morjim Beach Road, Goa',
          amenities: ['Swimming Pool', 'Co-working space', 'Free WiFi', 'Cafe', 'Beach Access'],
          latitude: 15.618,
          longitude: 73.738,
        },
      ],
      restaurants: [
        {
          name: "Britto's Beach Shack",
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          cuisine: 'Goan & Continental Seafood',
          priceRange: '₹₹',
          rating: 4.6,
          popularDishes: ['Goan Fish Curry Rice', 'Butter Garlic Prawns', 'Bebinca'],
          latitude: 15.553,
          longitude: 73.751,
        },
        {
          name: 'Curlies Beach Shack',
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          cuisine: 'Multi-Cuisine & Cocktails',
          priceRange: '₹₹',
          rating: 4.5,
          popularDishes: ['Woodfired Pizza', 'Calamari Fry', 'Cocktails'],
          latitude: 15.581,
          longitude: 73.742,
        },
      ],
    },
    {
      name: 'Ooty',
      slug: 'ooty',
      state: 'Tamil Nadu',
      country: 'India',
      description: 'The "Queen of Hill Stations" nestled in the Nilgiri hills. Famous for cool misty weather, picturesque tea estates, eucalyptus groves, and heritage toy train.',
      heroImage: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'October – June',
      averageBudget: 8000,
      rating: 4.6,
      reviewCount: 285,
      latitude: 11.4102,
      longitude: 76.695,
      categories: ['Nature', 'Adventure', 'Food'],
      idealTravelTypes: ['COUPLE', 'FAMILY', 'FRIENDS', 'SOLO'],
      weatherTemp: 18,
      weatherCondition: 'Pleasant & Misty',
      weatherHumidity: 70,
      places: [
        {
          name: 'Ooty Lake & Boating',
          description: 'Artificial lake built in 1824, surrounded by eucalyptus trees, offering pedal boats and motorboat rides.',
          image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          visitDurationHours: 2.0,
          entryFee: 30,
          bestTimeOfDay: 'MORNING',
          latitude: 11.4082,
          longitude: 76.6853,
          rating: 4.5,
        },
        {
          name: 'Government Botanical Garden',
          description: 'Sprawling 55-acre terraced garden featuring thousands of exotic and indigenous flora and a 20-million-year-old fossil tree trunk.',
          image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          visitDurationHours: 2.5,
          entryFee: 50,
          bestTimeOfDay: 'AFTERNOON',
          latitude: 11.4186,
          longitude: 76.7115,
          rating: 4.6,
        },
        {
          name: 'Doddabetta Peak',
          description: 'Highest peak in the Nilgiri Mountains (2,637 m) featuring an observatory telescope with breathtaking 360-degree valley vistas.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          category: 'Adventure',
          visitDurationHours: 2.0,
          entryFee: 20,
          bestTimeOfDay: 'MORNING',
          latitude: 11.4005,
          longitude: 76.7369,
          rating: 4.7,
        },
        {
          name: 'Tea Museum & Factory',
          description: 'Explore origin of tea leaves, manufacturing processes, and sample hot homemade chocolates and fresh Nilgiri tea.',
          image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
          category: 'Food',
          visitDurationHours: 1.5,
          entryFee: 250,
          bestTimeOfDay: 'EVENING',
          latitude: 11.419,
          longitude: 76.731,
          rating: 4.4,
        },
      ],
      hotels: [
        {
          name: 'Savoy - IHCL SeleQtions',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 4800,
          rating: 4.7,
          address: 'Sylks Road, Ooty, Tamil Nadu',
          amenities: ['Heritage Architecture', 'Fireplace', 'Lush Lawns', 'Fine Dining', 'Free WiFi'],
          latitude: 11.412,
          longitude: 76.699,
        },
        {
          name: 'Sterling Ooty Fern Hill',
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 3200,
          rating: 4.5,
          address: 'Fern Hill, Ooty, Tamil Nadu',
          amenities: ['Panoramic Valley View', 'Activity Center', 'Restaurant', 'Spa', 'Bonfire'],
          latitude: 11.398,
          longitude: 76.69,
        },
      ],
      restaurants: [
        {
          name: 'Earl’s Secret - Glasshouse Dining',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          cuisine: 'Continental & Anglo-Indian',
          priceRange: '₹₹',
          rating: 4.7,
          popularDishes: ['Shepherd’s Pie', 'Nilgiri Herb Roast Chicken', 'Warm Apple Pie'],
          latitude: 11.405,
          longitude: 76.698,
        },
        {
          name: 'Shinkow’s Chinese Restaurant',
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          cuisine: 'Authentic Hakka Chinese',
          priceRange: '₹',
          rating: 4.4,
          popularDishes: ['Sweet & Sour Chicken', 'Chili Beef', 'Steamed Dumplings'],
          latitude: 11.411,
          longitude: 76.702,
        },
      ],
    },
    {
      name: 'Coorg',
      slug: 'coorg',
      state: 'Karnataka',
      country: 'India',
      description: 'The "Scotland of India", renowned for aromatic coffee plantations, cascading waterfalls, Kodava cultural hospitality, and misty forest trails.',
      heroImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'October – April',
      averageBudget: 9500,
      rating: 4.7,
      reviewCount: 240,
      latitude: 12.3375,
      longitude: 75.8069,
      categories: ['Nature', 'Adventure', 'Food'],
      idealTravelTypes: ['FRIENDS', 'COUPLE', 'FAMILY'],
      weatherTemp: 21,
      weatherCondition: 'Pleasant & Breezy',
      weatherHumidity: 65,
      places: [
        {
          name: 'Abbey Falls',
          description: 'Dramatic waterfall cascading down hanging bridges amidst private coffee plantations and spice estates.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          visitDurationHours: 2.0,
          entryFee: 40,
          bestTimeOfDay: 'MORNING',
          latitude: 12.4542,
          longitude: 75.7196,
          rating: 4.7,
        },
        {
          name: "Raja's Seat Sunset Garden",
          description: 'A seasonal garden of flowers and fountains perched on a cliff where Kodagu kings enjoyed sunsets.',
          image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          visitDurationHours: 1.5,
          entryFee: 20,
          bestTimeOfDay: 'EVENING',
          latitude: 12.421,
          longitude: 75.736,
          rating: 4.6,
        },
        {
          name: 'Dubare Elephant Camp',
          description: 'Eco-tourism sanctuary on the banks of River Cauvery where travelers can bathe and feed elephants.',
          image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
          category: 'Adventure',
          visitDurationHours: 3.0,
          entryFee: 150,
          bestTimeOfDay: 'MORNING',
          latitude: 12.368,
          longitude: 75.905,
          rating: 4.8,
        },
        {
          name: 'Namdroling Golden Temple (Bylakuppe)',
          description: 'Vibrant Tibetan Buddhist monastery with golden 40-foot statues, Tibetan wall paintings, and chanting ceremonies.',
          image: 'https://images.unsplash.com/photo-1561361066-8889a71092aa?auto=format&fit=crop&w=600&q=80',
          category: 'Religious',
          visitDurationHours: 2.0,
          entryFee: 0,
          bestTimeOfDay: 'AFTERNOON',
          latitude: 12.43,
          longitude: 75.966,
          rating: 4.8,
        },
      ],
      hotels: [
        {
          name: 'The Tamara Coorg',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 5900,
          rating: 4.9,
          address: 'Kabbinakad Estate, Napoklu, Coorg',
          amenities: ['Plantation Walk', 'Luxury Cottages', 'Fine Dining', 'Spa', 'Waterfall Trail'],
          latitude: 12.228,
          longitude: 75.694,
        },
      ],
      restaurants: [
        {
          name: 'Raintree Kodava Restaurant',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          cuisine: 'Authentic Kodava Cuisine',
          priceRange: '₹₹',
          rating: 4.6,
          popularDishes: ['Pandi Curry (Pork Curry)', 'Kadambuttu (Rice Balls)', 'Coorg Filter Coffee'],
          latitude: 12.423,
          longitude: 75.739,
        },
      ],
    },
    {
      name: 'Manali',
      slug: 'manali',
      state: 'Himachal Pradesh',
      country: 'India',
      description: 'Himalayan wonderland set on the Beas River, famed for snow-capped alpine peaks, Solang adventure sports, apple orchards, and pine forests.',
      heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'October – June',
      averageBudget: 13000,
      rating: 4.8,
      reviewCount: 380,
      latitude: 32.2432,
      longitude: 77.1892,
      categories: ['Adventure', 'Nature', 'Religious'],
      idealTravelTypes: ['FRIENDS', 'COUPLE', 'SOLO'],
      weatherTemp: 14,
      weatherCondition: 'Crisp Alpine Sun',
      weatherHumidity: 45,
      places: [
        {
          name: 'Solang Valley Adventure Arena',
          description: 'Center for thrilling adventure sports: paragliding, zorbing, ATV quad biking, and winter ski slopes.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          category: 'Adventure',
          visitDurationHours: 4.0,
          entryFee: 500,
          bestTimeOfDay: 'MORNING',
          latitude: 32.3166,
          longitude: 77.1575,
          rating: 4.9,
        },
        {
          name: 'Hadimba Wooden Temple',
          description: 'Unique pagoda-style 16th-century wooden temple nestled inside towering cedar deodar forests.',
          image: 'https://images.unsplash.com/photo-1561361066-8889a71092aa?auto=format&fit=crop&w=600&q=80',
          category: 'Religious',
          visitDurationHours: 1.5,
          entryFee: 0,
          bestTimeOfDay: 'AFTERNOON',
          latitude: 32.2483,
          longitude: 77.1806,
          rating: 4.7,
        },
        {
          name: 'Old Manali Cafes & Beas River Walk',
          description: 'Cobblestone streets with indie cafes, live music, wooden houses, and soothing river walks.',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          category: 'Shopping',
          visitDurationHours: 2.5,
          entryFee: 0,
          bestTimeOfDay: 'EVENING',
          latitude: 32.253,
          longitude: 77.181,
          rating: 4.6,
        },
      ],
      hotels: [
        {
          name: 'The Himalayan Luxury Resort & Castle',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 5200,
          rating: 4.8,
          address: 'Hadimba Road, Manali, Himachal Pradesh',
          amenities: ['Snow View', 'Heated Pool', 'Fine Dining', 'Boutique Cottages', 'WiFi'],
          latitude: 32.245,
          longitude: 77.185,
        },
      ],
      restaurants: [
        {
          name: 'Cafe 1947',
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          cuisine: 'Italian, Trout & Mountain Delights',
          priceRange: '₹₹',
          rating: 4.7,
          popularDishes: ['Fresh River Trout', 'Wood-fired Pizza', 'Mountain Chai'],
          latitude: 32.256,
          longitude: 77.182,
        },
      ],
    },
    {
      name: 'Jaipur',
      slug: 'jaipur',
      state: 'Rajasthan',
      country: 'India',
      description: 'The "Pink City", capital of royal Rajasthan filled with majestic hill forts, pink sandstone palaces, vibrant bazaars, and opulent heritage.',
      heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'October – March',
      averageBudget: 10000,
      rating: 4.7,
      reviewCount: 350,
      latitude: 26.9124,
      longitude: 75.7873,
      categories: ['Historical', 'Shopping', 'Food'],
      idealTravelTypes: ['FAMILY', 'COUPLE', 'FRIENDS', 'SOLO'],
      weatherTemp: 29,
      weatherCondition: 'Warm Royal Sun',
      weatherHumidity: 35,
      places: [
        {
          name: 'Amber Fort & Palace',
          description: 'Sprawling hilltop fortress built from yellow and pink sandstone, famous for the magnificent Sheesh Mahal (Mirror Palace).',
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
          category: 'Historical',
          visitDurationHours: 3.0,
          entryFee: 100,
          bestTimeOfDay: 'MORNING',
          latitude: 26.9855,
          longitude: 75.8513,
          rating: 4.8,
        },
        {
          name: 'Hawa Mahal (Palace of Winds)',
          description: 'Iconic 5-story facade featuring 953 intricately carved jharokha windows built for royal women to observe street processions.',
          image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
          category: 'Historical',
          visitDurationHours: 1.5,
          entryFee: 50,
          bestTimeOfDay: 'AFTERNOON',
          latitude: 26.9239,
          longitude: 75.8267,
          rating: 4.6,
        },
        {
          name: 'Nahargarh Fort Sunset View',
          description: 'Hilltop ramparts with a panoramic view overlooking the illuminated pink city at dusk.',
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
          category: 'Adventure',
          visitDurationHours: 2.0,
          entryFee: 50,
          bestTimeOfDay: 'EVENING',
          latitude: 26.9372,
          longitude: 75.8156,
          rating: 4.7,
        },
      ],
      hotels: [
        {
          name: 'ITC Rajputana Luxury Collection',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          pricePerNight: 5000,
          rating: 4.8,
          address: 'Palace Road, Jaipur, Rajasthan',
          amenities: ['Royal Courtyard', 'Swimming Pool', 'Spa', 'Heritage Dining', 'Free WiFi'],
          latitude: 26.918,
          longitude: 75.792,
        },
      ],
      restaurants: [
        {
          name: 'Chokhi Dhani Ethnic Resort & Thali',
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
          cuisine: 'Rajasthani Royal Feast',
          priceRange: '₹₹',
          rating: 4.8,
          popularDishes: ['Dal Baati Churma', 'Gatte Ki Sabzi', 'Ker Sangri'],
          latitude: 26.772,
          longitude: 75.834,
        },
      ],
    },
  ];

  for (const d of destinationsData) {
    const createdDest = await prisma.destination.create({
      data: {
        name: d.name,
        slug: d.slug,
        state: d.state,
        country: d.country,
        description: d.description,
        heroImage: d.heroImage,
        images: JSON.stringify(d.images),
        bestTimeToVisit: d.bestTimeToVisit,
        averageBudget: d.averageBudget,
        rating: d.rating,
        reviewCount: d.reviewCount,
        latitude: d.latitude,
        longitude: d.longitude,
        categories: JSON.stringify(d.categories),
        idealTravelTypes: JSON.stringify(d.idealTravelTypes),
        weatherTemp: d.weatherTemp,
        weatherCondition: d.weatherCondition,
        weatherHumidity: d.weatherHumidity,
        places: {
          create: d.places,
        },
        hotels: {
          create: d.hotels.map((h) => ({
            ...h,
            amenities: JSON.stringify(h.amenities),
          })),
        },
        restaurants: {
          create: d.restaurants.map((r) => ({
            ...r,
            popularDishes: JSON.stringify(r.popularDishes),
          })),
        },
      },
    });

    // Add initial review
    await prisma.review.create({
      data: {
        userId: user.id,
        destinationId: createdDest.id,
        rating: 5,
        comment: `Very beautiful place and good experience in ${d.name}. Highly recommend visiting with friends or family!`,
      },
    });

    console.log(`📍 Seeded destination: ${d.name}`);
  }

  // Pre-seed a sample 4-day trip for user
  const keralaDest = await prisma.destination.findUnique({ where: { slug: 'kerala' } });
  if (keralaDest) {
    await prisma.trip.create({
      data: {
        userId: user.id,
        destinationId: keralaDest.id,
        title: 'Kerala – 4 Days Nature & Backwaters Trip',
        durationDays: 4,
        travelType: 'FRIENDS',
        userBudget: 20000,
        estimatedCost: 17000,
        transportCost: 5000,
        hotelCost: 6000,
        foodCost: 3000,
        activityCost: 2000,
        ticketsCost: 1000,
        status: 'PLANNED',
        days: {
          create: [
            {
              dayNumber: 1,
              activities: {
                create: [
                  { timeSlot: 'MORNING', activityTitle: 'Munnar Tea Museum', description: 'Explore tea factory and plantations', estimatedCost: 150, orderIndex: 0 },
                  { timeSlot: 'AFTERNOON', activityTitle: 'Mattupetty Dam', description: 'Speed boating and scenic lake reservoir', estimatedCost: 50, orderIndex: 1 },
                  { timeSlot: 'EVENING', activityTitle: 'Local Market & Spices', description: 'Shop local cardamom, pepper, and handmade crafts', estimatedCost: 0, orderIndex: 2 },
                ],
              },
            },
            {
              dayNumber: 2,
              activities: {
                create: [
                  { timeSlot: 'MORNING', activityTitle: 'Eravikulam National Park', description: 'Nilgiri Tahr safari and viewpoint', estimatedCost: 200, orderIndex: 0 },
                  { timeSlot: 'AFTERNOON', activityTitle: 'Adventure Activity', description: 'Zipline and nature trek', estimatedCost: 600, orderIndex: 1 },
                  { timeSlot: 'EVENING', activityTitle: 'Hotel & Bonfire', description: 'Relax at hotel with tea and campfire', estimatedCost: 0, orderIndex: 2 },
                ],
              },
            },
            {
              dayNumber: 3,
              activities: {
                create: [
                  { timeSlot: 'MORNING', activityTitle: 'Alleppey Arrival', description: 'Drive to backwater shores', estimatedCost: 0, orderIndex: 0 },
                  { timeSlot: 'AFTERNOON', activityTitle: 'Houseboat Cruise', description: 'Traditional houseboat ride with Kerala lunch', estimatedCost: 1200, orderIndex: 1 },
                  { timeSlot: 'EVENING', activityTitle: 'Backwater Sunset', description: 'Canal sunset views and village photography', estimatedCost: 0, orderIndex: 2 },
                ],
              },
            },
            {
              dayNumber: 4,
              activities: {
                create: [
                  { timeSlot: 'MORNING', activityTitle: 'Fort Kochi Heritage', description: 'Chinese fishing nets and colonial art cafes', estimatedCost: 0, orderIndex: 0 },
                  { timeSlot: 'AFTERNOON', activityTitle: 'Jew Town & Shopping', description: 'Antique shopping and spices', estimatedCost: 0, orderIndex: 1 },
                  { timeSlot: 'EVENING', activityTitle: 'Return Journey', description: 'Transfer to airport / railway station', estimatedCost: 0, orderIndex: 2 },
                ],
              },
            },
          ],
        },
      },
    });
    console.log('✈️ Seeded sample 4-day Kerala Trip');
  }

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
