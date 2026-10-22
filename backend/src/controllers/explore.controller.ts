import { Request, Response } from 'express';
import {
  searchPlaces,
  getNearby,
  getLiveWeather,
  getPlaceSummary,
} from '../services/live.service';

export class ExploreController {
  // GET /api/explore/search?q=munnar  -> autocomplete suggestions for any place in India
  static async search(req: Request, res: Response): Promise<void> {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      res.json({ success: true, results: [] });
      return;
    }
    try {
      const results = await searchPlaces(q);
      res.json({ success: true, results });
    } catch (err: any) {
      res.status(502).json({
        success: false,
        message: 'Live place search is temporarily unavailable. Please try again.',
        detail: err.message,
      });
    }
  }

  // GET /api/explore/nearby?lat=..&lon=..&name=..&radius=10
  // Returns live tourist places + food + stays + weather + summary around the point
  static async nearby(req: Request, res: Response): Promise<void> {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const radius = Number(req.query.radius) || 10;
    const name = String(req.query.name || '').trim();

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 6 || lat > 38 || lon < 67 || lon > 98) {
      res.status(400).json({ success: false, message: 'Please provide a valid location within India.' });
      return;
    }

    // Run all live sources in parallel; one failing source must not break the page.
    const [poiRes, weatherRes, summaryRes] = await Promise.allSettled([
      getNearby(lat, lon, radius),
      getLiveWeather(lat, lon),
      name ? getPlaceSummary(name) : Promise.resolve(null),
    ]);

    const pois =
      poiRes.status === 'fulfilled'
        ? poiRes.value
        : { attractions: [], food: [], stays: [] };

    res.json({
      success: true,
      center: { latitude: lat, longitude: lon, radiusKm: radius },
      attractions: pois.attractions,
      food: pois.food,
      stays: pois.stays,
      weather: weatherRes.status === 'fulfilled' ? weatherRes.value : null,
      summary: summaryRes.status === 'fulfilled' ? summaryRes.value : null,
      fetchedAt: new Date().toISOString(),
      sources: ['OpenStreetMap', 'Open-Meteo', 'Wikipedia'],
    });
  }
}
