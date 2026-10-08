import { cacheService } from '../config/redis';

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
  static async getWeather(destinationName: string, durationDays = 4): Promise<WeatherInfo> {
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
