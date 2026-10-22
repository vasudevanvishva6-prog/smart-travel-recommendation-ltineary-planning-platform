import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Landmark,
  Utensils,
  Hotel as HotelIcon,
  Navigation,
  Phone,
  Globe,
  Clock,
  LocateFixed,
  Loader2,
  RefreshCw,
  Droplets,
  Wind,
  CloudSun,
  Leaf,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { exploreApi } from '../services/api';
import { ExploreResult, GeoPlace, LivePoi } from '../types';
import { LiveMap } from '../components/LiveMap';

type Tab = 'attractions' | 'food' | 'stays';

const POPULAR = ['Madurai', 'Ooty', 'Munnar', 'Jaipur', 'Goa', 'Varanasi', 'Manali', 'Rameswaram', 'Hampi', 'Pondicherry'];

const prettyDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export const ExplorePage: React.FC = () => {
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState(params.get('name') || '');
  const [suggestions, setSuggestions] = useState<GeoPlace[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const [data, setData] = useState<ExploreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [tab, setTab] = useState<Tab>('attractions');
  const [vegOnly, setVegOnly] = useState(false);
  const [focus, setFocus] = useState<LivePoi | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);

  // Selected location comes from the URL so results are shareable / refresh-safe
  const lat = params.get('lat');
  const lon = params.get('lon');
  const name = params.get('name') || '';
  const radius = Number(params.get('r')) || 10;

  // Landing from the navbar / home search box with just ?q=place
  const qParam = params.get('q');
  useEffect(() => {
    if (!qParam || lat) return;
    setQuery(qParam);
    setSearching(true);
    exploreApi
      .search(qParam)
      .then((res) => {
        const first: GeoPlace | undefined = res.data.results?.[0];
        if (first) {
          setParams({ lat: String(first.latitude), lon: String(first.longitude), name: first.name, r: '10' }, { replace: true });
        } else {
          setError(`"${qParam}" India la kedaikala. Vera spelling try pannunga.`);
        }
      })
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setSearching(false));
  }, [qParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadNearby = useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true);
    setError('');
    setFocus(null);
    try {
      const res = await exploreApi.nearby(Number(lat), Number(lon), name, radius);
      setData(res.data);
    } catch (err: any) {
      setData(null);
      setError(
        err.response?.data?.message ||
          'Could not load live data. Check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [lat, lon, name, radius]);

  useEffect(() => {
    loadNearby();
  }, [loadNearby]);

  // Debounced autocomplete
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || q === name) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await exploreApi.search(q);
        setSuggestions(res.data.results || []);
        setSuggestOpen(true);
      } catch (_e) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      clearTimeout(t);
      setSearching(false);
    };
  }, [query, name]);

  // Close suggestion list on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const choose = (p: GeoPlace) => {
    setQuery(p.name);
    setSuggestOpen(false);
    setSuggestions([]);
    setTab('attractions');
    setParams({ lat: String(p.latitude), lon: String(p.longitude), name: p.name, r: String(radius) });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (suggestions.length > 0) {
      choose(suggestions[0]);
      return;
    }
    try {
      setSearching(true);
      const res = await exploreApi.search(q);
      const first: GeoPlace | undefined = res.data.results?.[0];
      if (first) choose(first);
      else setError(`"${q}" India la kedaikala. Vera spelling try pannunga.`);
    } catch (_e) {
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support location.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setQuery('My location');
        setTab('attractions');
        setParams({
          lat: pos.coords.latitude.toFixed(5),
          lon: pos.coords.longitude.toFixed(5),
          name: 'My location',
          r: String(radius),
        });
      },
      () => setError('Location permission denied. Type a place name instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const changeRadius = (r: number) => {
    if (!lat || !lon) return;
    setParams({ lat, lon, name, r: String(r) });
  };

  const list: LivePoi[] = useMemo(() => {
    if (!data) return [];
    if (tab === 'attractions') return data.attractions;
    if (tab === 'stays') return data.stays;
    return vegOnly ? data.food.filter((f) => f.vegetarian === 'yes' || f.vegetarian === 'only') : data.food;
  }, [data, tab, vegOnly]);

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; count: number }> = [
    { id: 'attractions', label: 'Tourist Places', icon: <Landmark className="w-4 h-4" />, count: data?.attractions.length ?? 0 },
    { id: 'food', label: 'Food', icon: <Utensils className="w-4 h-4" />, count: data?.food.length ?? 0 },
    { id: 'stays', label: 'Stay', icon: <HotelIcon className="w-4 h-4" />, count: data?.stays.length ?? 0 },
  ];

  const w = data?.weather;

  return (
    <div className="pb-20">
      {/* Search header */}
      <section className="bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Explore anywhere in India — live</h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Type any city, town, village or landmark. Nearby tourist places, food, stays and weather load live.
          </p>

          <div ref={boxRef} className="relative max-w-2xl mx-auto text-left">
            <form onSubmit={submit} className="bg-white rounded-2xl sm:rounded-full shadow-2xl flex items-center gap-2 p-2 text-slate-800">
              <Search className="w-5 h-5 text-brand-600 ml-3 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length && setSuggestOpen(true)}
                placeholder="Search any place in India…  (e.g. Hogenakkal, Kodaikanal)"
                className="flex-1 min-w-0 outline-none bg-transparent text-sm sm:text-base font-medium placeholder-slate-400"
                autoComplete="off"
              />
              {searching && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              <button
                type="button"
                onClick={useMyLocation}
                title="Use my current location"
                className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <LocateFixed className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm"
              >
                Explore
              </button>
            </form>

            {suggestOpen && suggestions.length > 0 && (
              <ul className="absolute z-[1100] left-0 right-0 mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {suggestions.map((s, i) => (
                  <li key={`${s.latitude}-${s.longitude}-${i}`}>
                    <button
                      type="button"
                      onClick={() => choose(s)}
                      className="w-full text-left px-4 py-3 hover:bg-brand-50 flex items-start gap-3"
                    >
                      <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block font-semibold text-sm truncate">{s.name}</span>
                        <span className="block text-xs text-slate-500 truncate">{s.displayName}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {POPULAR.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setQuery(p);
                  exploreApi.search(p).then((r) => r.data.results?.[0] && choose(r.data.results[0]));
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        {/* Empty state */}
        {!lat && !loading && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center text-slate-500">
            <MapPin className="w-10 h-10 mx-auto text-brand-500 mb-3" />
            <p className="font-semibold text-slate-700">Pick a place to start</p>
            <p className="text-sm mt-1">Search above or tap one of the popular places.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            {lat && (
              <button onClick={loadNearby} className="flex items-center gap-1 font-semibold underline">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
            Fetching live places, food, stays &amp; weather near <strong>{name}</strong>…
            <p className="text-xs mt-1 text-slate-400">First search can take a few seconds.</p>
          </div>
        )}

        {data && !loading && lat && lon && (
          <>
            {/* Summary + weather */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                {data.summary?.image && (
                  <img src={data.summary.image} alt={name} className="sm:w-56 h-48 sm:h-auto object-cover" />
                )}
                <div className="p-6 flex-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">{name}</h2>
                  {data.summary ? (
                    <>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-5">{data.summary.extract}</p>
                      {data.summary.url && (
                        <a href={data.summary.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 mt-3">
                          Read more on Wikipedia <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 mt-2">
                      Showing everything within {radius} km of this location.
                    </p>
                  )}
                </div>
              </div>

              {w ? (
                <div className="bg-gradient-to-br from-sky-500 via-brand-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-sky-200 font-semibold">Live weather now</span>
                      <div className="text-4xl font-extrabold">{w.temperature}°C</div>
                      <div className="text-xs text-sky-100">{w.condition} · feels {w.feelsLike}°</div>
                    </div>
                    <CloudSun className="w-10 h-10 text-amber-200" />
                  </div>
                  <div className="flex gap-4 text-xs mt-3 text-sky-100">
                    <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" />{w.humidity}%</span>
                    <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" />{w.windSpeedKmH} km/h</span>
                    <span>☔ {w.rainProbability}%</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mt-4">
                    {w.forecast.map((f) => (
                      <div key={f.date} className="rounded-xl bg-white/10 p-1.5 text-center">
                        <div className="text-[10px] text-sky-200">{prettyDate(f.date).split(',')[0]}</div>
                        <div className="text-xs font-bold">{f.tempMax}°</div>
                        <div className="text-[10px] text-sky-200">{f.tempMin}°</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 text-sm text-slate-500">
                  Live weather is unavailable right now.
                </div>
              )}
            </div>

            {/* Radius + tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border transition ${
                      tab === t.id
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    {t.icon} {t.label}
                    <span className={`text-xs px-1.5 rounded-full ${tab === t.id ? 'bg-white/20' : 'bg-slate-100'}`}>{t.count}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-sm">
                {tab === 'food' && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
                    <Leaf className="w-4 h-4 text-emerald-600" /> Veg only
                  </label>
                )}
                <select
                  value={radius}
                  onChange={(e) => changeRadius(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-full px-3 py-2 text-sm font-medium"
                >
                  {[5, 10, 20, 30].map((r) => (
                    <option key={r} value={r}>Within {r} km</option>
                  ))}
                </select>
                <button onClick={loadNearby} title="Refresh live data" className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Map */}
            <LiveMap
              center={[data.center.latitude, data.center.longitude]}
              radiusKm={data.center.radiusKm}
              attractions={data.attractions}
              food={data.food}
              stays={data.stays}
              show={{ attractions: tab === 'attractions', food: tab === 'food', stays: tab === 'stays' }}
              focus={focus}
            />

            {/* Cards */}
            {list.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                Nothing found in this category within {radius} km. Try a bigger radius.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((p) => (
                  <PoiCard key={p.id} poi={p} onShow={() => { setFocus(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                ))}
              </div>
            )}

            <p className="text-center text-xs text-slate-400">
              Live data from {data.sources.join(', ')} · updated {new Date(data.fetchedAt).toLocaleTimeString('en-IN')}.
              Opening hours and details come from community-maintained OpenStreetMap, so please confirm before you go.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const PoiCard: React.FC<{ poi: LivePoi; onShow: () => void }> = ({ poi, onShow }) => {
  const icon =
    poi.kind === 'attraction' ? <Landmark className="w-5 h-5" /> : poi.kind === 'food' ? <Utensils className="w-5 h-5" /> : <HotelIcon className="w-5 h-5" />;
  const tint =
    poi.kind === 'attraction' ? 'bg-sky-50 text-sky-600' : poi.kind === 'food' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${tint}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 leading-snug">{poi.name}</h3>
          <p className="text-xs text-slate-500 capitalize">{poi.subtype}</p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">{poi.distanceKm} km</span>
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        {poi.cuisine && <p>🍽 {poi.cuisine}</p>}
        {poi.vegetarian === 'only' && <p className="text-emerald-700 font-semibold">🌿 Pure vegetarian</p>}
        {poi.stars && <p>⭐ {poi.stars}-star</p>}
        {poi.fee && <p>🎟 Entry fee: {poi.fee === 'no' ? 'Free' : poi.fee === 'yes' ? 'Paid' : poi.fee}</p>}
        {poi.address && <p className="flex gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />{poi.address}</p>}
        {poi.openingHours && <p className="flex gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />{poi.openingHours}</p>}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
        >
          <Navigation className="w-3.5 h-3.5" /> Directions
        </a>
        <button onClick={onShow} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200">
          Show on map
        </button>
        {poi.phone && (
          <a href={`tel:${poi.phone.split(';')[0].replace(/\s/g, '')}`} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
        )}
        {poi.website && /^https?:\/\//.test(poi.website) && (
          <a href={poi.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" /> Website
          </a>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
