import { cacheService } from '../config/redis';
import { getLiveWeather } from './live.service';

export interface WeatherInfo {
  temperature: number;
  condition: string; // Sunny, Partly Cloudy, Light Rain, Foggy, Clear Sky
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

export class WeatherService {
  static async getWeather(
    destinationName: string,
    durationDays = 4,
    latitude?: number,
    longitude?: number
  ): Promise<WeatherInfo> {
    // Prefer real live data (Open-Meteo) whenever coordinates are known
    if (latitude != null && longitude != null) {
      try {
        const live = await getLiveWeather(latitude, longitude);
        return {
          temperature: live.temperature,
          condition: live.condition,
          humidity: live.humidity,
          windSpeedKmH: live.windSpeedKmH,
          rainProbability: live.rainProbability,
          feelsLike: live.feelsLike,
          forecast: live.forecast.slice(0, durationDays).map((f, i) => ({
            dayNumber: i + 1,
            tempDay: f.tempMax,
            tempNight: f.tempMin,
            condition: f.condition,
            advice:
              f.rainProbability >= 60
                ? 'Rain likely - plan indoor spots, museums and cafes.'
                : f.tempMax >= 33
                ? 'Hot day - stay hydrated and visit outdoor spots early morning or evening.'
                : f.tempMax <= 15
                ? 'Cool weather - carry a jacket for mornings and evenings.'
                : 'Good weather for outdoor sightseeing and photography.',
          })),
        };
      } catch (_e) {
        // network problem -> fall through to the estimated offline values below
      }
    }

    const cacheKey = `weather:${destinationName.toLowerCase()}:${durationDays}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_e) {
        // Continue to fresh generation
      }
    }

    // Baseline climate characteristics by region/name
    let baseTemp = 25;
    let baseHumidity = 65;
    let defaultCondition = 'Partly Cloudy';

    const lower = destinationName.toLowerCase();
    if (lower.includes('manali') || lower.includes('ladakh') || lower.includes('shimla')) {
      baseTemp = 14;
      baseHumidity = 50;
      defaultCondition = 'Crisp & Sunny';
    } else if (lower.includes('ooty') || lower.includes('coorg') || lower.includes('munnar')) {
      baseTemp = 19;
      baseHumidity = 75;
      defaultCondition = 'Pleasant & Misty';
    } else if (lower.includes('goa') || lower.includes('kerala') || lower.includes('kovalam')) {
      baseTemp = 29;
      baseHumidity = 78;
      defaultCondition = 'Warm Coastal Breeze';
    } else if (lower.includes('jaipur') || lower.includes('rajasthan')) {
      baseTemp = 31;
      baseHumidity = 40;
      defaultCondition = 'Clear & Sunny';
    }

    const weatherConditionsPool = [
      defaultCondition,
      'Partly Cloudy',
      'Pleasant Sunshine',
      'Mild Breeze',
    ];

    const forecast = [];
    for (let day = 1; day <= durationDays; day++) {
      const cond = weatherConditionsPool[(day - 1) % weatherConditionsPool.length];
      const tempDay = baseTemp + (day % 3) - 1;
      const tempNight = tempDay - 7;

      let advice = 'Great weather for outdoor exploration and photography.';
      if (tempDay > 28) {
        advice = 'Stay hydrated and carry sunglasses; ideal for beach and evening strolls.';
      } else if (tempDay < 18) {
        advice = 'Pleasant cool weather; carry a light jacket for morning and evening activities.';
      }

      forecast.push({
        dayNumber: day,
        tempDay,
        tempNight,
        condition: cond,
        advice,
      });
    }

    const weatherData: WeatherInfo = {
      temperature: baseTemp,
      condition: defaultCondition,
      humidity: baseHumidity,
      windSpeedKmH: 14,
      rainProbability: 15,
      feelsLike: baseTemp + 1,
      forecast,
    };

    // Cache in Redis for 1 hour (3600s)
    await cacheService.set(cacheKey, JSON.stringify(weatherData), 3600);

    return weatherData;
  }
}
