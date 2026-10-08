import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Place, Hotel, Restaurant } from '../types';

interface InteractiveMapProps {
  center: [number, number];
  zoom?: number;
  places?: Place[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  routeCoordinates?: [number, number][];
}

// Custom SVG Icons for Leaflet markers
const createCustomIcon = (color: string, emoji: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        font-size: 16px;
        cursor: pointer;
      ">
        ${emoji}
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
};

const placeIcon = createCustomIcon('#0284c7', '📍');
const hotelIcon = createCustomIcon('#6366f1', '🏨');
const restaurantIcon = createCustomIcon('#f59e0b', '🍴');

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  zoom = 12,
  places = [],
  hotels = [],
  restaurants = [],
  routeCoordinates,
}) => {
  // If no custom route coordinates provided, assemble route from places coordinates
  const polylineCoords =
    routeCoordinates && routeCoordinates.length > 1
      ? routeCoordinates
      : places.length > 1
      ? places.map((p) => [p.latitude, p.longitude] as [number, number])
      : [];

  return (
    <div className="w-full h-[450px] rounded-3xl overflow-hidden border border-slate-200 shadow-md relative z-0">
      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-1000 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-slate-200/80 text-xs flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
          <span>Attractions ({places.length})</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
          <span>Hotels ({hotels.length})</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>Dining ({restaurants.length})</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Attractions Markers */}
        {places.map((place) => (
          <Marker
            key={`place-${place.id}`}
            position={[place.latitude, place.longitude]}
            icon={placeIcon}
          >
            <Popup>
              <div className="max-w-[200px]">
                {place.image && (
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <h4 className="font-bold text-sm text-slate-900 leading-snug">{place.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{place.description}</p>
                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-600">{place.category}</span>
                  <span className="font-bold text-slate-700">
                    {place.entryFee > 0 ? `₹${place.entryFee}` : 'Free'}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hotels Markers */}
        {hotels.map((hotel) => (
          <Marker
            key={`hotel-${hotel.id}`}
            position={[hotel.latitude, hotel.longitude]}
            icon={hotelIcon}
          >
            <Popup>
              <div className="max-w-[200px]">
                {hotel.image && (
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <h4 className="font-bold text-sm text-slate-900">{hotel.name}</h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">{hotel.address}</p>
                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-amber-500 font-bold">⭐ {hotel.rating}</span>
                  <span className="font-bold text-indigo-700">₹{hotel.pricePerNight}/night</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Restaurants Markers */}
        {restaurants.map((restaurant) => (
          <Marker
            key={`restaurant-${restaurant.id}`}
            position={[restaurant.latitude, restaurant.longitude]}
            icon={restaurantIcon}
          >
            <Popup>
              <div className="max-w-[200px]">
                {restaurant.image && (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <h4 className="font-bold text-sm text-slate-900">{restaurant.name}</h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">{restaurant.cuisine}</p>
                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-amber-500 font-bold">⭐ {restaurant.rating}</span>
                  <span className="font-bold text-emerald-700">{restaurant.priceRange}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Itinerary Route Polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#0284c7"
            weight={4}
            opacity={0.7}
            dashArray="6, 8"
          />
        )}
      </MapContainer>
    </div>
  );
};
