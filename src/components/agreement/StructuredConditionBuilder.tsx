import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Clock3, Loader2, MapPin, Navigation } from 'lucide-react';
import { createLocationCondition, createTimeCondition } from '../../api/agreementConditionEndpoints';
import { MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '../../lib/locationUtils';

interface Props {
  agreementId: string;
  obligationId: string;
  authHeader?: string;
  onCreated?: () => void;
}

type Mode = 'LOCATION' | 'TIME';

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1a1a1a]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a1f]/25';

function AgreementLocationMap({
  latitude,
  longitude,
  radiusMetres,
  onPinChange,
}: {
  latitude: number | null;
  longitude: number | null;
  radiusMetres: number;
  onPinChange: (latitude: number, longitude: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const onPinChangeRef = useRef(onPinChange);

  useEffect(() => { onPinChangeRef.current = onPinChange; }, [onPinChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [latitude ?? -1.286389, longitude ?? 36.817223],
      zoom: latitude != null && longitude != null ? 16 : 11,
      zoomControl: true,
    });
    L.tileLayer(MAP_TILE_URL, { attribution: MAP_TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
    map.on('click', (event: L.LeafletMouseEvent) => {
      onPinChangeRef.current(event.latlng.lat, event.latlng.lng);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // map instance owns its lifecycle

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markerRef.current?.remove();
    circleRef.current?.remove();
    markerRef.current = null;
    circleRef.current = null;
    if (latitude == null || longitude == null) return;

    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const point = marker.getLatLng();
      onPinChangeRef.current(point.lat, point.lng);
    });
    const circle = L.circle([latitude, longitude], { radius: radiusMetres }).addTo(map);
    markerRef.current = marker;
    circleRef.current = circle;
    map.setView([latitude, longitude], Math.max(map.getZoom(), 16));
  }, [latitude, longitude, radiusMetres]);

  return (
    <div
      ref={containerRef}
      aria-label="Agreement location map"
      className="h-[260px] w-full overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f3f4f1]"
    />
  );
}

function toIso(localValue: string): string | null {
  if (!localValue) return null;
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function StructuredConditionBuilder({ agreementId, obligationId, authHeader, onCreated }: Props) {
  const [mode, setMode] = useState<Mode>('LOCATION');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radiusMetres, setRadiusMetres] = useState(20);
  const [accuracyThresholdMetres, setAccuracyThresholdMetres] = useState(50);
  const [freshnessMinutes, setFreshnessMinutes] = useState(20);
  const [locating, setLocating] = useState(false);

  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('This device cannot provide location. You can still place the pin on the map.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError('Location permission was not granted. Place the pin on the map instead.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const createLocation = async () => {
    if (latitude == null || longitude == null) {
      setError('Place the agreed location pin before saving.');
      return;
    }
    if (radiusMetres <= 0 || accuracyThresholdMetres <= 0 || freshnessMinutes <= 0) {
      setError('Distance, GPS accuracy and freshness must all be greater than zero.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createLocationCondition(
        agreementId,
        obligationId,
        {
          expectedLatitude: latitude,
          expectedLongitude: longitude,
          radiusMetres,
          accuracyThresholdMetres,
          maxAgeSeconds: freshnessMinutes * 60,
          ...(locationLabel.trim() ? { locationLabel: locationLabel.trim() } : {}),
        },
        true,
        authHeader,
      );
      if (!result.ok || !result.data) {
        setError(result.error || 'Could not save this location condition.');
        return;
      }
      setSuccess('Agreed location saved to this obligation.');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  };

  const createTime = async () => {
    const startIso = toIso(windowStart);
    const endIso = toIso(windowEnd);
    if (!startIso || !endIso) {
      setError('Choose both the start and end of the agreed time window.');
      return;
    }
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setError('The end of the time window must be after the start.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createTimeCondition(
        agreementId,
        obligationId,
        { windowStart: startIso, windowEnd: endIso },
        true,
        authHeader,
      );
      if (!result.ok || !result.data) {
        setError(result.error || 'Could not save this time condition.');
        return;
      }
      setSuccess('Agreed time window saved to this obligation.');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1a1a1a]/8 bg-white p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#1a1a1a]/85">Add where or when</p>
        <p className="text-xs text-[#1a1a1a]/45 mt-0.5 leading-relaxed">
          Record a structured condition on this obligation. SecurePay evaluates the condition later; saving it here does not mean it has been satisfied.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f5f6f2] p-1">
        <button type="button" onClick={() => { setMode('LOCATION'); setError(null); setSuccess(null); }}
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === 'LOCATION' ? 'bg-white shadow-sm text-[#3a7a1f]' : 'text-[#1a1a1a]/50'}`}>
          <MapPin size={13} className="inline mr-1.5" />Where
        </button>
        <button type="button" onClick={() => { setMode('TIME'); setError(null); setSuccess(null); }}
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === 'TIME' ? 'bg-white shadow-sm text-[#3a7a1f]' : 'text-[#1a1a1a]/50'}`}>
          <Clock3 size={13} className="inline mr-1.5" />When
        </button>
      </div>

      {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
      {success && <p className="text-xs text-[#3a7a1f] font-medium" role="status">{success}</p>}

      {mode === 'LOCATION' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1.5">Place name</label>
            <input value={locationLabel} onChange={e => setLocationLabel(e.target.value)}
              placeholder="e.g. Plot 54, Varsityville Estate" className={inputCls} />
          </div>

          <AgreementLocationMap
            latitude={latitude}
            longitude={longitude}
            radiusMetres={radiusMetres}
            onPinChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); setError(null); }}
          />

          <button type="button" onClick={useCurrentLocation} disabled={locating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#3a7a1f]/25 px-3.5 py-2 text-xs font-semibold text-[#3a7a1f] disabled:opacity-40">
            {locating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
            {locating ? 'Finding location…' : 'Use current location'}
          </button>

          {latitude != null && longitude != null && (
            <p className="text-[11px] text-[#1a1a1a]/40">Pin: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-[#1a1a1a]/55">Allowed distance (m)
              <input type="number" min="1" value={radiusMetres} onChange={e => setRadiusMetres(Number(e.target.value))} className={`${inputCls} mt-1.5`} />
            </label>
            <label className="text-xs text-[#1a1a1a]/55">Required GPS accuracy (m)
              <input type="number" min="1" value={accuracyThresholdMetres} onChange={e => setAccuracyThresholdMetres(Number(e.target.value))} className={`${inputCls} mt-1.5`} />
            </label>
            <label className="text-xs text-[#1a1a1a]/55">Location freshness (minutes)
              <input type="number" min="1" value={freshnessMinutes} onChange={e => setFreshnessMinutes(Number(e.target.value))} className={`${inputCls} mt-1.5`} />
            </label>
          </div>

          <p className="text-[11px] text-[#1a1a1a]/40 leading-relaxed">
            The pin and limits become the agreed condition. A participant's later device location is only a claim; the backend decides whether it is within range, accurate enough and fresh enough.
          </p>

          <button type="button" onClick={createLocation} disabled={submitting}
            className="w-full rounded-xl bg-[#3a7a1f] py-2.5 text-xs font-semibold text-white disabled:opacity-40">
            {submitting ? 'Saving…' : 'Save agreed location'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-[#1a1a1a]/55">Window starts
              <input type="datetime-local" value={windowStart} onChange={e => setWindowStart(e.target.value)} className={`${inputCls} mt-1.5`} />
            </label>
            <label className="text-xs text-[#1a1a1a]/55">Window ends
              <input type="datetime-local" value={windowEnd} onChange={e => setWindowEnd(e.target.value)} className={`${inputCls} mt-1.5`} />
            </label>
          </div>
          <p className="text-[11px] text-[#1a1a1a]/40 leading-relaxed">
            The selected local times are stored as exact instants. When checked, SecurePay uses backend server time rather than the participant's device clock.
          </p>
          <button type="button" onClick={createTime} disabled={submitting}
            className="w-full rounded-xl bg-[#3a7a1f] py-2.5 text-xs font-semibold text-white disabled:opacity-40">
            {submitting ? 'Saving…' : 'Save agreed time window'}
          </button>
        </div>
      )}
    </div>
  );
}
