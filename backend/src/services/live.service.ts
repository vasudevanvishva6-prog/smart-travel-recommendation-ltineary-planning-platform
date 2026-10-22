import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_e) {
  // ignore
}

import { cacheService } from '../config/redis';

/**
 * Live data service - no API keys needed.
 *  - Nominatim (OpenStreetMap)  -> search any place in India
 *  - Wikipedia Geosearch        -> instant live landmark & attraction discovery
 *  - Overpass API (OpenStreetMap) -> live POIs, food, stays
 *  - Open-Meteo                 -> real-time weather + forecast
 *  - Wikipedia REST             -> short description + photo for the searched place
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
const USER_AGENT = 'WanderSmart-Travel/1.0 (student travel project)';

export interface GeoPlace {
  name: string;
  displayName: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  type: string;
}

export type PoiKind = 'attraction' | 'food' | 'stay';

export interface LivePoi {
  id: string;
  kind: PoiKind;
  name: string;
  subtype: string; // e.g. temple, fort, cafe, hotel
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

export interface NearbyResult {
  attractions: LivePoi[];
  food: LivePoi[];
  stays: LivePoi[];
}

export interface PlaceSummary {
  title: string;
  extract: string;
  image?: string;
  url?: string;
}

// Common phonetic spellings and aliases
const CITY_ALIASES: Record<string, string> = {
  madhurai: 'Madurai',
  madhura: 'Madurai',
  rameshwaram: 'Rameswaram',
  rameswaram: 'Rameswaram',
  trichy: 'Tiruchirappalli',
  thiruchirappalli: 'Tiruchirappalli',
  tanjore: 'Thanjavur',
  thanjavur: 'Thanjavur',
  kumbakonam: 'Kumbakonam',
  tirupati: 'Tirupati',
  kodai: 'Kodaikanal',
  kodaikanal: 'Kodaikanal',
  ooty: 'Ooty',
  udhagamandalam: 'Ooty',
  kanyakumari: 'Kanyakumari',
  trivandrum: 'Thiruvananthapuram',
  thiruvananthapuram: 'Thiruvananthapuram',
  calicut: 'Kozhikode',
  kozhikode: 'Kozhikode',
  cochin: 'Kochi',
  kochi: 'Kochi',
  alleppey: 'Alappuzha',
  alappuzha: 'Alappuzha',
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  bombay: 'Mumbai',
  mumbai: 'Mumbai',
  calcutta: 'Kolkata',
  kolkata: 'Kolkata',
  banaras: 'Varanasi',
  kashi: 'Varanasi',
  varanasi: 'Varanasi',
  pondicherry: 'Puducherry',
  puducherry: 'Puducherry',
  pondi: 'Puducherry',
  mahabalipuram: 'Mamallapuram',
  mamallapuram: 'Mamallapuram',
  courtallam: 'Courtallam',
  kutralam: 'Courtallam',
  tirunelveli: 'Tirunelveli',
  nellai: 'Tirunelveli',
  tuticorin: 'Thoothukudi',
  thoothukudi: 'Thoothukudi',
  tiruvannamalai: 'Tiruvannamalai',
  thiruvannamalai: 'Tiruvannamalai',
  chidambaram: 'Chidambaram',
  yercaud: 'Yercaud',
  hogenakkal: 'Hogenakkal',
  mysore: 'Mysuru',
  mysuru: 'Mysuru',
  munnar: 'Munnar',
  goa: 'Goa',
  manali: 'Manali',
  coorg: 'Coorg',
  jaipur: 'Jaipur',
  udaipur: 'Udaipur',
  agra: 'Agra',
};

// Curated primary hubs for instant instant-accuracy match
const KNOWN_HUBS: Record<string, GeoPlace> = {
  madurai: {
    name: 'Madurai',
    displayName: 'Madurai, Tamil Nadu, India',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 9.9252,
    longitude: 78.1198,
    type: 'city',
  },
  ooty: {
    name: 'Ooty',
    displayName: 'Ooty (Udhagamandalam), Nilgiris, Tamil Nadu, India',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.4102,
    longitude: 76.695,
    type: 'town',
  },
  kodaikanal: {
    name: 'Kodaikanal',
    displayName: 'Kodaikanal, Dindigul, Tamil Nadu, India',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 10.2381,
    longitude: 77.4892,
    type: 'town',
  },
  chennai: {
    name: 'Chennai',
    displayName: 'Chennai, Tamil Nadu, India',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    type: 'city',
  },
  rameswaram: {
    name: 'Rameswaram',
    displayName: 'Rameswaram, Ramanathapuram, Tamil Nadu, India',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 9.2876,
    longitude: 79.3129,
    type: 'town',
  },
  munnar: {
    name: 'Munnar',
    displayName: 'Munnar, Idukki, Kerala, India',
    state: 'Kerala',
    country: 'India',
    latitude: 10.0889,
    longitude: 77.0595,
    type: 'town',
  },
  goa: {
    name: 'Goa',
    displayName: 'Panaji, Goa, India',
    state: 'Goa',
    country: 'India',
    latitude: 15.2993,
    longitude: 74.124,
    type: 'state',
  },
  jaipur: {
    name: 'Jaipur',
    displayName: 'Jaipur, Rajasthan, India',
    state: 'Rajasthan',
    country: 'India',
    latitude: 26.9124,
    longitude: 75.7873,
    type: 'city',
  },
  manali: {
    name: 'Manali',
    displayName: 'Manali, Kullu, Himachal Pradesh, India',
    state: 'Himachal Pradesh',
    country: 'India',
    latitude: 32.2432,
    longitude: 77.1892,
    type: 'town',
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson<T>(url: string, init: RequestInit = {}, timeoutMs = 12000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...(init.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const hit = await cacheService.get(key);
  if (hit) {
    try {
      return JSON.parse(hit) as T;
    } catch (_e) {
      /* fall through to reload */
    }
  }
  const fresh = await loader();
  await cacheService.set(key, JSON.stringify(fresh), ttlSeconds);
  return fresh;
}

// ---------------------------------------------------------------------------
// 1. Place search (India only) with phonetic/alias support & city priority
// ---------------------------------------------------------------------------
export async function searchPlaces(query: string, limit = 6): Promise<GeoPlace[]> {
  const rawQ = query.trim().toLowerCase();
  if (rawQ.length < 2) return [];

  // Check alias (e.g. madhurai -> Madurai)
  const normalizedQ = CITY_ALIASES[rawQ] || rawQ;

  return cached(`geo:${normalizedQ}:${limit}`, 24 * 3600, async () => {
    const out: GeoPlace[] = [];
    const seen = new Set<string>();

    // 1. Check known primary hub
    const hubKey = normalizedQ.toLowerCase();
    if (KNOWN_HUBS[hubKey]) {
      const hub = KNOWN_HUBS[hubKey];
      out.push(hub);
      seen.add(`${hub.name}|${hub.state}`.toLowerCase());
    }

    try {
      const url =
        `${NOMINATIM}/search?format=jsonv2&addressdetails=1&countrycodes=in` +
        `&accept-language=en&limit=${limit + 4}&q=${encodeURIComponent(normalizedQ)}`;
      const rows = await fetchJson<any[]>(url, {}, 8000);

      // Rank results: prioritize administrative cities/towns over random shops/villages
      const sorted = [...rows].sort((a, b) => {
        const impA = parseFloat(a.importance || '0');
        const impB = parseFloat(b.importance || '0');
        const isCityA = a.type === 'administrative' || a.type === 'city' || a.category === 'boundary';
        const isCityB = b.type === 'administrative' || b.type === 'city' || b.category === 'boundary';
        if (isCityA && !isCityB) return -1;
        if (!isCityA && isCityB) return 1;
        return impB - impA;
      });

      for (const r of sorted) {
        const a = r.address || {};
        const name =
          r.name ||
          a.city ||
          a.town ||
          a.village ||
          a.suburb ||
          a.county ||
          a.state_district ||
          normalizedQ;
        const state = a.state || '';
        const key = `${name}|${state}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          name,
          displayName: r.display_name,
          state,
          country: a.country || 'India',
          latitude: parseFloat(r.lat),
          longitude: parseFloat(r.lon),
          type: r.type || r.category || 'place',
        });
        if (out.length >= limit) break;
      }
    } catch (_e) {
      // If Nominatim fails and we don't have results yet, fallback to known hubs if matched
    }

    return out;
  });
}

// ---------------------------------------------------------------------------
// 2. Curated & verified POIs for major hubs (Madurai, etc.)
// ---------------------------------------------------------------------------
function getMaduraiCurated(centerLat: number, centerLon: number): NearbyResult {
  const rawAttractions: Array<Omit<LivePoi, 'distanceKm' | 'mapsUrl'>> = [
    {
      id: 'madurai/meenakshi-temple',
      kind: 'attraction',
      name: 'Meenakshi Amman Temple',
      subtype: 'historic hindu temple',
      latitude: 9.9197,
      longitude: 78.1194,
      address: 'Madurai Main, Madurai',
      fee: 'Free (Special entry ₹50 - ₹100)',
      openingHours: '5:00 AM – 12:30 PM, 4:00 PM – 9:30 PM',
      wikipedia: 'https://en.wikipedia.org/wiki/Meenakshi_Temple',
    },
    {
      id: 'madurai/thirumalai-nayakkar-mahal',
      kind: 'attraction',
      name: 'Thirumalai Nayakkar Mahal',
      subtype: 'royal palace & museum',
      latitude: 9.9158,
      longitude: 78.1242,
      address: 'Panthadi, Madurai',
      fee: '₹10 (Camera ₹30, Light & Sound show ₹50)',
      openingHours: '9:00 AM – 5:00 PM',
      wikipedia: 'https://en.wikipedia.org/wiki/Thirumalai_Nayakkar_Mahal',
    },
    {
      id: 'madurai/gandhi-museum',
      kind: 'attraction',
      name: 'Gandhi Memorial Museum',
      subtype: 'national memorial & museum',
      latitude: 9.9328,
      longitude: 78.1408,
      address: 'Tamukkam, Madurai',
      fee: 'Free',
      openingHours: '10:00 AM – 1:00 PM, 2:00 PM – 5:45 PM',
      wikipedia: 'https://en.wikipedia.org/wiki/Gandhi_Memorial_Museum,_Madurai',
    },
    {
      id: 'madurai/teppakulam',
      kind: 'attraction',
      name: 'Vandiyur Mariamman Teppakulam',
      subtype: 'historic temple tank & island palace',
      latitude: 9.9103,
      longitude: 78.1517,
      address: 'Anuppanadi, Madurai',
      fee: 'Free',
      openingHours: 'Open 24 hours',
      wikipedia: 'https://en.wikipedia.org/wiki/Vandiyur_Mariamman_Teppakulam',
    },
    {
      id: 'madurai/koodal-azhagar',
      kind: 'attraction',
      name: 'Koodal Azhagar Temple',
      subtype: 'ancient vishnu temple',
      latitude: 9.9153,
      longitude: 78.1139,
      address: 'Near Periyar Bus Stand, Madurai',
      fee: 'Free',
      openingHours: '5:30 AM – 12:00 PM, 4:00 PM – 9:00 PM',
    },
    {
      id: 'madurai/alagar-kovil',
      kind: 'attraction',
      name: 'Alagar Kovil (Kallazhagar Temple)',
      subtype: 'hilltop temple & scenic forest',
      latitude: 10.0754,
      longitude: 78.2132,
      address: 'Alagar Hills, Madurai',
      fee: 'Free',
      openingHours: '6:00 AM – 12:30 PM, 3:30 PM – 8:00 PM',
      wikipedia: 'https://en.wikipedia.org/wiki/Alagar_Kovil',
    },
    {
      id: 'madurai/kazimar-mosque',
      kind: 'attraction',
      name: 'Kazimar Big Mosque & Maqbara',
      subtype: '13th century heritage mosque',
      latitude: 9.9142,
      longitude: 78.1167,
      address: 'Kazimar Street, Madurai',
      fee: 'Free',
      openingHours: '5:00 AM – 10:00 PM',
      wikipedia: 'https://en.wikipedia.org/wiki/Kazimar_Big_Mosque',
    },
    {
      id: 'madurai/st-marys-cathedral',
      kind: 'attraction',
      name: "St. Mary's Cathedral Church",
      subtype: 'neo-gothic heritage cathedral',
      latitude: 9.9167,
      longitude: 78.1283,
      address: 'East Veli Street, Madurai',
      fee: 'Free',
      openingHours: '7:00 AM – 7:00 PM',
      wikipedia: "https://en.wikipedia.org/wiki/St._Mary's_Cathedral,_Madurai",
    },
    {
      id: 'madurai/samanar-hills',
      kind: 'attraction',
      name: 'Samanar Hills (Jain Caves & Lotus Pond)',
      subtype: 'rock-cut cave carvings & viewpoint',
      latitude: 9.9389,
      longitude: 78.0461,
      address: 'Keelakuyilkudi, Madurai',
      fee: 'Free',
      openingHours: 'Sunrise to Sunset',
    },
    {
      id: 'madurai/pazhamudircholai',
      kind: 'attraction',
      name: 'Pazhamudircholai Murugan Temple',
      subtype: 'one of six arupadai veedu temples',
      latitude: 10.0894,
      longitude: 78.2256,
      address: 'Alagar Hills, Madurai',
      fee: 'Free',
      openingHours: '6:00 AM – 6:00 PM',
    },
  ];

  const rawFood: Array<Omit<LivePoi, 'distanceKm' | 'mapsUrl'>> = [
    {
      id: 'madurai/murugan-idli-shop',
      kind: 'food',
      name: 'Murugan Idli Shop',
      subtype: 'south indian restaurant',
      latitude: 9.9175,
      longitude: 78.1189,
      cuisine: 'Soft Idli, Podi Dosa, 4 Chutneys & Filter Coffee',
      vegetarian: 'only',
      address: 'West Masi Street, Madurai',
      phone: '0452 2341379',
      openingHours: '7:00 AM – 11:00 PM',
    },
    {
      id: 'madurai/kumar-mess',
      kind: 'food',
      name: 'Kumar Mess',
      subtype: 'traditional non-veg mess',
      latitude: 9.9341,
      longitude: 78.1362,
      cuisine: 'Authentic Madurai Mutton Chukka, Biryani, Nalli Fry',
      vegetarian: 'no',
      address: 'Alagarkoil Main Road, Madurai',
      phone: '0452 2535252',
      openingHours: '11:30 AM – 4:00 PM, 6:30 PM – 11:00 PM',
    },
    {
      id: 'madurai/amma-mess',
      kind: 'food',
      name: 'Amma Mess',
      subtype: 'iconic non-veg dining',
      latitude: 9.9302,
      longitude: 78.1495,
      cuisine: 'Bone Marrow Omelette, Crab Omelette, Fish Curry',
      vegetarian: 'no',
      address: 'Mattuthavani, Madurai',
      phone: '0452 2568888',
      openingHours: '12:00 PM – 4:30 PM, 7:00 PM – 11:00 PM',
    },
    {
      id: 'madurai/konar-kadai',
      kind: 'food',
      name: 'Konar Kadai',
      subtype: 'heritage street restaurant',
      latitude: 9.9271,
      longitude: 78.1225,
      cuisine: 'Original Madurai Kari Dosa, Kola Urundai, Mutton Sukka',
      vegetarian: 'no',
      address: 'North Veli Street, Simmakkal, Madurai',
      openingHours: '5:00 PM – 11:30 PM',
    },
    {
      id: 'madurai/famous-jigarthanda',
      kind: 'food',
      name: 'Famous Jigarthanda (Original)',
      subtype: 'legendary beverage shop',
      latitude: 9.9182,
      longitude: 78.1211,
      cuisine: 'Royal Jigarthanda with Badam Pisin & Basundi Ice Cream',
      vegetarian: 'yes',
      address: 'East Marret Street, Madurai',
      phone: '098421 21390',
      openingHours: '9:00 AM – 11:00 PM',
    },
    {
      id: 'madurai/sree-sabarees',
      kind: 'food',
      name: 'Sree Sabarees Pure Veg',
      subtype: 'pure vegetarian restaurant',
      latitude: 9.9164,
      longitude: 78.1158,
      cuisine: 'South Indian Thali, Crispy Ghee Roast, Meals',
      vegetarian: 'only',
      address: 'West Perumal Maistry Street, Madurai',
      openingHours: '6:30 AM – 10:30 PM',
    },
    {
      id: 'madurai/amsavalli-bhavan',
      kind: 'food',
      name: 'Amsavalli Bhavan',
      subtype: 'biryani restaurant',
      latitude: 9.9192,
      longitude: 78.1231,
      cuisine: 'Traditional Madurai Mutton Biryani & Gravies',
      vegetarian: 'no',
      address: 'Crime Branch Road, Madurai',
      openingHours: '11:00 AM – 10:00 PM',
    },
    {
      id: 'madurai/meenakshi-coffee',
      kind: 'food',
      name: 'Sri Meenakshi Coffee',
      subtype: 'traditional cafe',
      latitude: 9.919,
      longitude: 78.118,
      cuisine: 'Madurai Degree Filter Coffee, Vada & Bajji',
      vegetarian: 'yes',
      address: 'South Avani Moola Street, Madurai',
      openingHours: '6:00 AM – 9:30 PM',
    },
  ];

  const rawStays: Array<Omit<LivePoi, 'distanceKm' | 'mapsUrl'>> = [
    {
      id: 'madurai/heritage-madurai',
      kind: 'stay',
      name: 'Heritage Madurai',
      subtype: '5-star luxury heritage resort',
      latitude: 9.9431,
      longitude: 78.0856,
      stars: '5',
      address: '11 Melakkal Main Road, Kochadai, Madurai',
      phone: '+91 452 2385455',
      website: 'https://www.heritagemadurai.com',
    },
    {
      id: 'madurai/gateway-pasumalai',
      kind: 'stay',
      name: 'The Gateway Hotel Pasumalai (Taj)',
      subtype: '5-star hilltop resort hotel',
      latitude: 9.8978,
      longitude: 78.0864,
      stars: '5',
      address: 'No. 40, TPK Road, Pasumalai, Madurai',
      phone: '+91 452 6633000',
      website: 'https://www.tajhotels.com',
    },
    {
      id: 'madurai/courtyard-marriott',
      kind: 'stay',
      name: 'Courtyard by Marriott Madurai',
      subtype: '4-star premium business hotel',
      latitude: 9.9332,
      longitude: 78.1389,
      stars: '4',
      address: 'No. 168, Alagar Kovil Main Road, Madurai',
      phone: '+91 452 4255555',
      website: 'https://www.marriott.com',
    },
    {
      id: 'madurai/hotel-supreme',
      kind: 'stay',
      name: 'Hotel Supreme',
      subtype: 'hotel with rooftop temple view',
      latitude: 9.9171,
      longitude: 78.1147,
      stars: '3',
      address: '110 West Perumal Maistry Street, Madurai',
      phone: '+91 452 2343151',
      website: 'http://www.hotelsupreme.in',
    },
    {
      id: 'madurai/fortune-pandiyan',
      kind: 'stay',
      name: 'Fortune Pandiyan Hotel (ITC)',
      subtype: '4-star hotel',
      latitude: 9.9405,
      longitude: 78.1367,
      stars: '4',
      address: 'Race Course Road, Madurai',
      phone: '+91 452 4356789',
    },
    {
      id: 'madurai/madurai-residency',
      kind: 'stay',
      name: 'The Madurai Residency',
      subtype: 'hotel near meenakshi temple',
      latitude: 9.9168,
      longitude: 78.1152,
      stars: '3',
      address: '14-15 West Marret Street, Madurai',
      phone: '+91 452 2343140',
    },
    {
      id: 'madurai/jc-residency',
      kind: 'stay',
      name: 'JC Residency Madurai',
      subtype: 'boutique hotel',
      latitude: 9.9354,
      longitude: 78.1332,
      stars: '3',
      address: '14 Lady Doak College Road, Chinnachokkikulam, Madurai',
      phone: '+91 452 4200000',
    },
    {
      id: 'madurai/regency-grt',
      kind: 'stay',
      name: 'Regency Madurai by GRT Hotels',
      subtype: '4-star hotel',
      latitude: 9.8995,
      longitude: 78.0921,
      stars: '4',
      address: '38 TPK Road, Madurai',
      phone: '+91 452 2371155',
    },
  ];

  const toPoi = (p: Omit<LivePoi, 'distanceKm' | 'mapsUrl'>): LivePoi => ({
    ...p,
    distanceKm: Math.round(haversineKm(centerLat, centerLon, p.latitude, p.longitude) * 10) / 10,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`,
  });

  return {
    attractions: rawAttractions.map(toPoi).sort((a, b) => a.distanceKm - b.distanceKm),
    food: rawFood.map(toPoi).sort((a, b) => a.distanceKm - b.distanceKm),
    stays: rawStays.map(toPoi).sort((a, b) => a.distanceKm - b.distanceKm),
  };
}

// ---------------------------------------------------------------------------
// 3. Live Wikipedia GeoSearch for any place in India
// ---------------------------------------------------------------------------
async function fetchWikiAttractions(lat: number, lon: number, radiusKm: number): Promise<LivePoi[]> {
  try {
    const radiusM = Math.min(Math.max(radiusKm * 1000, 2000), 10000);
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=${radiusM}&gslimit=35&format=json`;
    const res = await fetchJson<any>(url, {}, 6000);
    const items = res.query?.geosearch || [];

    const out: LivePoi[] = [];
    for (const item of items) {
      const title: string = item.title;
      // Skip administrative subdivisions, bridges, police stations, constituencies
      if (
        /assembly constituency|constituency|district|police station|railway bridge|flyover|overbridge|corporation zone/i.test(
          title
        )
      ) {
        continue;
      }

      const distKm = Math.round((item.dist / 1000) * 10) / 10;
      out.push({
        id: `wiki/${item.pageid || title.replace(/\s+/g, '_')}`,
        kind: 'attraction',
        name: title,
        subtype: 'heritage landmark / attraction',
        latitude: item.lat,
        longitude: item.lon,
        distanceKm: distKm,
        wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`,
      });
    }
    return out;
  } catch (_e) {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 4. Nearby POIs from OpenStreetMap (Overpass)
// ---------------------------------------------------------------------------
function buildOverpassQuery(lat: number, lon: number, radiusM: number): string {
  const around = `(around:${radiusM},${lat},${lon})`;
  // Use node and way (avoid relation to keep response under 4-5s)
  return `
[out:json][timeout:12];
(
  nw["tourism"~"^(attraction|museum|viewpoint|zoo|theme_park|hotel|guest_house|resort)$"]["name"]${around};
  nw["historic"~"^(monument|memorial|palace|temple|fort|ruins)$"]["name"]${around};
  nw["amenity"~"^(restaurant|cafe|fast_food|place_of_worship)$"]["name"]${around};
);
out center 120;`;
}

async function runOverpass(query: string): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i < OVERPASS_ENDPOINTS.length; i++) {
    try {
      return await fetchJson<any>(
        OVERPASS_ENDPOINTS[i],
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
        },
        7000
      );
    } catch (err) {
      lastErr = err;
      await sleep(200);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Overpass unavailable');
}

function classify(tags: Record<string, string>): { kind: PoiKind; subtype: string } | null {
  if (tags.tourism && /^(hotel|guest_house|hostel|resort|motel|apartment|chalet|camp_site)$/.test(tags.tourism)) {
    return { kind: 'stay', subtype: tags.tourism.replace('_', ' ') };
  }
  if (tags.amenity && /^(restaurant|cafe|fast_food|food_court|ice_cream)$/.test(tags.amenity)) {
    return { kind: 'food', subtype: tags.amenity.replace('_', ' ') };
  }
  if (tags.historic) return { kind: 'attraction', subtype: tags.historic.replace('_', ' ') };
  if (tags.natural) return { kind: 'attraction', subtype: tags.natural.replace('_', ' ') };
  if (tags.amenity === 'place_of_worship') {
    return { kind: 'attraction', subtype: tags.religion ? `${tags.religion} temple/shrine` : 'place of worship' };
  }
  if (tags.leisure) return { kind: 'attraction', subtype: tags.leisure.replace('_', ' ') };
  if (tags.tourism) return { kind: 'attraction', subtype: tags.tourism.replace('_', ' ') };
  return null;
}

function buildAddress(t: Record<string, string>): string | undefined {
  const parts = [
    [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' '),
    t['addr:suburb'],
    t['addr:city'],
    t['addr:postcode'],
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : t['addr:full'];
}

export async function getNearby(lat: number, lon: number, radiusKm = 10): Promise<NearbyResult> {
  const r = Math.min(Math.max(radiusKm, 1), 30);
  const key = `nearby:${lat.toFixed(3)}:${lon.toFixed(3)}:${r}`;

  return cached<NearbyResult>(key, 3 * 3600, async () => {
    // Check if within 25 km of Madurai city center
    const isMadurai = haversineKm(lat, lon, 9.9252, 78.1198) <= 25;
    const curated = isMadurai ? getMaduraiCurated(lat, lon) : null;

    // Concurrently fetch Wikipedia attractions and Overpass live POIs
    const [wikiAttractionsRes, overpassRes] = await Promise.allSettled([
      fetchWikiAttractions(lat, lon, r),
      runOverpass(buildOverpassQuery(lat, lon, r * 1000)),
    ]);

    const attractionsMap = new Map<string, LivePoi>();
    const foodMap = new Map<string, LivePoi>();
    const staysMap = new Map<string, LivePoi>();

    // 1. Seed with curated data if available (guarantees iconic landmarks & food are present)
    if (curated) {
      for (const a of curated.attractions) {
        if (a.distanceKm <= r) attractionsMap.set(a.name.toLowerCase(), a);
      }
      for (const f of curated.food) {
        if (f.distanceKm <= r) foodMap.set(f.name.toLowerCase(), f);
      }
      for (const s of curated.stays) {
        if (s.distanceKm <= r) staysMap.set(s.name.toLowerCase(), s);
      }
    }

    // 2. Add Wikipedia live attractions
    if (wikiAttractionsRes.status === 'fulfilled') {
      for (const w of wikiAttractionsRes.value) {
        const k = w.name.toLowerCase();
        if (!attractionsMap.has(k) && w.distanceKm <= r) {
          attractionsMap.set(k, w);
        }
      }
    }

    // 3. Process Overpass results if available
    if (overpassRes.status === 'fulfilled' && overpassRes.value?.elements) {
      for (const el of overpassRes.value.elements) {
        const tags: Record<string, string> = el.tags || {};
        const name = tags['name:en'] || tags.name;
        const c = classify(tags);
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!name || !c || elLat == null || elLon == null) continue;

        const distanceKm = Math.round(haversineKm(lat, lon, elLat, elLon) * 10) / 10;
        if (distanceKm > r) continue;

        const keyName = name.toLowerCase();
        const poi: LivePoi = {
          id: `${el.type}/${el.id}`,
          kind: c.kind,
          name,
          subtype: c.subtype,
          latitude: elLat,
          longitude: elLon,
          distanceKm,
          address: buildAddress(tags),
          cuisine: tags.cuisine ? tags.cuisine.split(';').map((s) => s.replace(/_/g, ' ')).join(', ') : undefined,
          phone: tags.phone || tags['contact:phone'],
          website: tags.website || tags['contact:website'],
          openingHours: tags.opening_hours,
          stars: tags.stars,
          fee: tags.fee,
          vegetarian: tags['diet:vegetarian'],
          wikipedia: tags.wikipedia,
          mapsUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        };

        if (c.kind === 'attraction' && !attractionsMap.has(keyName)) {
          attractionsMap.set(keyName, poi);
        } else if (c.kind === 'food' && !foodMap.has(keyName)) {
          foodMap.set(keyName, poi);
        } else if (c.kind === 'stay' && !staysMap.has(keyName)) {
          staysMap.set(keyName, poi);
        }
      }
    }

    const sortFn = (a: LivePoi, b: LivePoi) => a.distanceKm - b.distanceKm;

    return {
      attractions: Array.from(attractionsMap.values()).sort(sortFn).slice(0, 50),
      food: Array.from(foodMap.values()).sort(sortFn).slice(0, 50),
      stays: Array.from(staysMap.values()).sort(sortFn).slice(0, 50),
    };
  });
}

// ---------------------------------------------------------------------------
// 5. Live weather (Open-Meteo)
// ---------------------------------------------------------------------------
const WMO: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
};
const wmo = (code: number) => WMO[code] || 'Mixed conditions';

export async function getLiveWeather(lat: number, lon: number): Promise<LiveWeather> {
  const key = `lweather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  return cached<LiveWeather>(key, 15 * 60, async () => {
    const url =
      `${OPEN_METEO}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,precipitation` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&forecast_days=5&timezone=auto`;
    const d = await fetchJson<any>(url, {}, 8000);
    const cur = d.current;
    const daily = d.daily;

    return {
      temperature: Math.round(cur.temperature_2m),
      feelsLike: Math.round(cur.apparent_temperature),
      humidity: Math.round(cur.relative_humidity_2m),
      windSpeedKmH: Math.round(cur.wind_speed_10m),
      condition: wmo(cur.weather_code),
      isDay: cur.is_day === 1,
      rainProbability: daily.precipitation_probability_max?.[0] ?? 0,
      updatedAt: cur.time,
      forecast: daily.time.map((date: string, i: number) => ({
        date,
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        rainProbability: daily.precipitation_probability_max?.[i] ?? 0,
        condition: wmo(daily.weather_code[i]),
      })),
    };
  });
}

// ---------------------------------------------------------------------------
// 6. Wikipedia summary + photo for the searched place
// ---------------------------------------------------------------------------
export async function getPlaceSummary(name: string): Promise<PlaceSummary | null> {
  const cleanName = CITY_ALIASES[name.trim().toLowerCase()] || name.trim();

  return cached<PlaceSummary | null>(`wiki:${cleanName.toLowerCase()}`, 7 * 24 * 3600, async () => {
    try {
      const d = await fetchJson<any>(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName.replace(/ /g, '_'))}?redirect=true`,
        {},
        6000
      );
      if (d.type === 'disambiguation' || !d.extract) return null;
      return {
        title: d.title,
        extract: d.extract,
        image: d.originalimage?.source || d.thumbnail?.source,
        url: d.content_urls?.desktop?.page,
      };
    } catch (_e) {
      return null;
    }
  });
}
