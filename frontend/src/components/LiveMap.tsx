import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LivePoi } from '../types';

interface LiveMapProps {
  center: [number, number];
  radiusKm: number;
  attractions: LivePoi[];
  food: LivePoi[];
  stays: LivePoi[];
  show: { attractions: boolean; food: boolean; stays: boolean };
  focus?: LivePoi | null;
}

const icon = (color: string, emoji: string) =>
  L.divIcon({
    html: `<div style="background:${color};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 6px rgba(0,0,0,.3);font-size:14px">${emoji}</div>`,
    className: 'custom-leaflet-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });

const icons = {
  attraction: icon('#0284c7', '📍'),
  food: icon('#f59e0b', '🍴'),
  stay: icon('#6366f1', '🏨'),
};

const centerIcon = L.divIcon({
  html: '<div style="background:#e11d48;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px rgba(225,29,72,.25)"></div>',
  className: 'custom-leaflet-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Re-centre / zoom whenever the searched place or the focused card changes
const Recenter: React.FC<{ center: [number, number]; radiusKm: number; focus?: LivePoi | null }> = ({
  center,
  radiusKm,
  focus,
}) => {
  const map = useMap();
  useEffect(() => {
    const zoom = radiusKm <= 5 ? 14 : radiusKm <= 10 ? 13 : radiusKm <= 20 ? 12 : 11;
    map.setView(center, zoom);
  }, [center[0], center[1], radiusKm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (focus) map.flyTo([focus.latitude, focus.longitude], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

export const LiveMap: React.FC<LiveMapProps> = ({ center, radiusKm, attractions, food, stays, show, focus }) => {
  const layers: Array<[LivePoi[], boolean]> = [
    [attractions, show.attractions],
    [food, show.food],
    [stays, show.stays],
  ];

  return (
    <div className="w-full h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-md relative z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} radiusKm={radiusKm} focus={focus} />
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#0284c7', weight: 1, fillOpacity: 0.04, dashArray: '4 6' }}
        />
        <Marker position={center} icon={centerIcon}>
          <Popup>Search centre</Popup>
        </Marker>

        {layers.map(([list, visible]) =>
          visible
            ? list.map((p) => (
                <Marker key={p.id} position={[p.latitude, p.longitude]} icon={icons[p.kind]}>
                  <Popup>
                    <div className="max-w-[210px]">
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{p.name}</h4>
                      <p className="text-xs text-slate-500 capitalize mt-0.5">
                        {p.subtype} · {p.distanceKm} km away
                      </p>
                      {p.cuisine && <p className="text-xs text-amber-700 mt-1">🍽 {p.cuisine}</p>}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-600 mt-2 inline-block"
                      >
                        Get directions →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))
            : null
        )}
      </MapContainer>
    </div>
  );
};
