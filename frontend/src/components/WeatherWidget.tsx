import React from 'react';
import { CloudSun, Droplets, Wind, Thermometer, AlertCircle, Sun, CloudRain } from 'lucide-react';
import { WeatherInfo } from '../types';

interface WeatherWidgetProps {
  weather?: WeatherInfo;
  destinationName: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, destinationName }) => {
  if (!weather) return null;

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-8 h-8 text-cyan-500" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
    return <CloudSun className="w-8 h-8 text-sky-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-sky-500 via-brand-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/10">
      {/* Current Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-200 font-semibold">
            Live Weather Forecast
          </span>
          <h3 className="text-2xl font-bold mt-0.5">{destinationName}</h3>
          <p className="text-sm text-sky-100 flex items-center gap-1.5 mt-1">
            {weather.condition}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <div className="text-4xl font-extrabold tracking-tight">
              {weather.temperature}°C
            </div>
            <div className="text-xs text-sky-200">Feels like {weather.feelsLike}°C</div>
          </div>
        </div>
      </div>

      {/* Weather Metrics Bar */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md text-xs mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-cyan-300 shrink-0" />
          <div>
            <span className="block text-sky-200 text-[10px]">Humidity</span>
            <span className="font-semibold">{weather.humidity}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-teal-300 shrink-0" />
          <div>
            <span className="block text-sky-200 text-[10px]">Wind Speed</span>
            <span className="font-semibold">{weather.windSpeedKmH} km/h</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-300 shrink-0" />
          <div>
            <span className="block text-sky-200 text-[10px]">Precipitation</span>
            <span className="font-semibold">{weather.rainProbability}%</span>
          </div>
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-200 mb-3">
          Upcoming Days Forecast & Activity Tips
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {weather.forecast.map((f) => (
            <div
              key={f.dayNumber}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/15 transition flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-sky-100">Day {f.dayNumber}</span>
                <div className="text-base font-extrabold mt-1">
                  {f.tempDay}° <span className="text-xs font-normal text-sky-200">/ {f.tempNight}°</span>
                </div>
                <div className="text-[11px] text-sky-200 truncate mt-0.5">{f.condition}</div>
              </div>
              <div className="mt-2 text-[10px] text-sky-100/90 leading-tight border-t border-white/10 pt-1.5">
                💡 {f.advice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="flex items-start gap-2 text-xs bg-black/20 backdrop-blur-xs p-3 rounded-xl text-sky-100">
        <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
        <span>
          <strong>Smart Recommendation:</strong> The weather is favorable for your trip! Plan outdoor viewpoints in the morning and indoor cafes or cultural spots in the afternoon.
        </span>
      </div>
    </div>
  );
};
