'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Bookmark, Building2, HardHat, Home, Maximize2, Minus, Plus } from 'lucide-react';
import type { MapAdapterProps, MarkerTone } from '@/lib/maps/MapAdapter';
import { TONE_LABELS, TONE_MARKER } from '../styles';

/**
 * Vendor-free placeholder map: a schematic of the NC Triad with prospect markers. No tiles,
 * keys, or network calls. A licensed map can replace it through the same MapAdapterProps.
 */

const BOUNDS = { minLat: 35.86, maxLat: 36.21, minLng: -80.42, maxLng: -79.38 };
const LNG_SCALE = Math.cos((36 * Math.PI) / 180);
const PADDING = 32;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const TOWNS: { name: string; lat: number; lng: number; major?: boolean }[] = [
  { name: 'Winston-Salem', lat: 36.0999, lng: -80.2442, major: true },
  { name: 'Greensboro', lat: 36.0726, lng: -79.792, major: true },
  { name: 'High Point', lat: 35.9557, lng: -80.0053, major: true },
  { name: 'Burlington', lat: 36.0957, lng: -79.4378 },
  { name: 'Kernersville', lat: 36.1199, lng: -80.0737 },
  { name: 'Jamestown', lat: 35.9943, lng: -79.935 },
  { name: 'Oak Ridge', lat: 36.1735, lng: -79.9889 },
  { name: 'Thomasville', lat: 35.8826, lng: -80.082 },
  { name: 'Clemmons', lat: 36.0215, lng: -80.382 },
];

/** Schematic connectors between towns; not real road geometry. */
const CONNECTORS: [string, string][] = [
  ['Clemmons', 'Winston-Salem'],
  ['Winston-Salem', 'Kernersville'],
  ['Kernersville', 'Greensboro'],
  ['Greensboro', 'Burlington'],
  ['Thomasville', 'High Point'],
  ['High Point', 'Jamestown'],
  ['Jamestown', 'Greensboro'],
  ['High Point', 'Kernersville'],
  ['Greensboro', 'Oak Ridge'],
  ['Winston-Salem', 'Thomasville'],
];

const MARKER_GAP = 30;

/**
 * Nudges markers that would overlap on screen onto a small spiral around their true spot,
 * so every marker stays clickable. Returns screen positions keyed by marker id.
 */
function spreadMarkers(points: { id: string; x: number; y: number }[]) {
  const result = new Map<string, { x: number; y: number; moved: boolean }>();
  const taken: { x: number; y: number }[] = [];
  const clear = (x: number, y: number) => taken.every((t) => Math.hypot(t.x - x, t.y - y) >= MARKER_GAP);
  for (const p of points) {
    let spot = { x: p.x, y: p.y };
    for (let k = 1; !clear(spot.x, spot.y) && k <= 40; k++) {
      const angle = k * 2.399963;
      const radius = MARKER_GAP * 0.75 + k * 3;
      spot = { x: p.x + Math.cos(angle) * radius, y: p.y + Math.sin(angle) * radius };
    }
    taken.push(spot);
    result.set(p.id, { ...spot, moved: spot.x !== p.x || spot.y !== p.y });
  }
  return result;
}

const TONE_ICON: Record<MarkerTone, typeof Building2> = {
  commercial: Building2,
  residential: Home,
  construction: HardHat,
};

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

export default function SampleMap({ markers, selectedId, highlightedId, onSelect, onHighlight, ariaLabel }: MapAdapterProps) {
  const [ref, { width, height }] = useSize<HTMLDivElement>();
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ pointerId: number; x: number; y: number; moved: boolean } | null>(null);

  // The Triad view widens to fit any entered coordinates outside it, so no marker lands off-map.
  const bounds = markers.reduce(
    (b, m) => ({
      minLat: Math.min(b.minLat, m.lat),
      maxLat: Math.max(b.maxLat, m.lat),
      minLng: Math.min(b.minLng, m.lng),
      maxLng: Math.max(b.maxLng, m.lng),
    }),
    BOUNDS
  );
  const worldW = (bounds.maxLng - bounds.minLng) * LNG_SCALE;
  const worldH = bounds.maxLat - bounds.minLat;
  const scale = Math.max(0, Math.min((width - PADDING * 2) / worldW, (height - PADDING * 2) / worldH));
  const offsetX = (width - worldW * scale) / 2;
  const offsetY = (height - worldH * scale) / 2;
  const projectBase = (lat: number, lng: number) => ({
    x: offsetX + (lng - bounds.minLng) * LNG_SCALE * scale,
    y: offsetY + (bounds.maxLat - lat) * scale,
  });
  const project = (lat: number, lng: number) => {
    const p = projectBase(lat, lng);
    return { x: (p.x - width / 2) * zoom + width / 2 + pan.x, y: (p.y - height / 2) * zoom + height / 2 + pan.y };
  };
  const clampPan = (next: { x: number; y: number }, z: number) => {
    const maxX = ((z - 1) * width) / 2 + width / 4;
    const maxY = ((z - 1) * height) / 2 + height / 4;
    return z === MIN_ZOOM
      ? { x: 0, y: 0 }
      : { x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) };
  };
  const centerOn = (id: string | null, z: number) => {
    const m = id ? markers.find((x) => x.id === id) : undefined;
    if (!m || z === MIN_ZOOM) return clampPan({ x: 0, y: 0 }, z);
    const p = projectBase(m.lat, m.lng);
    return clampPan({ x: -(p.x - width / 2) * z, y: -(p.y - height / 2) * z }, z);
  };
  const zoomTo = (z: number) => {
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
    setZoom(next);
    setPan(selectedId ? centerOn(selectedId, next) : clampPan({ x: (pan.x / zoom) * next, y: (pan.y / zoom) * next }, next));
  };

  useEffect(() => {
    if (selectedId && zoom > MIN_ZOOM) setPan(centerOn(selectedId, zoom));
    // Re-center only when the selection changes, not on every pan or zoom.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom === MIN_ZOOM || (e.target as HTMLElement).closest('button')) return;
    drag.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved = true;
    setPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }, zoom));
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId === e.pointerId) drag.current = null;
  };
  const town = (name: string) => {
    const t = TOWNS.find((x) => x.name === name)!;
    return project(t.lat, t.lng);
  };
  const ready = width > 0 && height > 0;
  const placed = ready ? spreadMarkers(markers.map((m) => ({ id: m.id, ...project(m.lat, m.lng) }))) : new Map();

  return (
    <div
      ref={ref}
      role="region"
      aria-label={ariaLabel}
      className={`relative h-full min-h-[320px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 ${
        zoom > MIN_ZOOM ? 'cursor-grab touch-none active:cursor-grabbing' : ''
      }`}
      data-testid="sample-map"
      data-zoom={zoom}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {ready && (
        <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false">
          <defs>
            <pattern id="sample-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#sample-map-grid)" />
          {CONNECTORS.map(([a, b]) => {
            const p = town(a);
            const q = town(b);
            return (
              <line
                key={`${a}-${b}`}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                className="stroke-white dark:stroke-slate-700"
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
          {markers.map((m) => {
            const spot = placed.get(m.id);
            if (!spot?.moved) return null;
            const origin = project(m.lat, m.lng);
            return (
              <g key={`leader-${m.id}`}>
                <line x1={origin.x} y1={origin.y} x2={spot.x} y2={spot.y} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth={1.5} />
                <circle cx={origin.x} cy={origin.y} r={2.5} className="fill-slate-500 dark:fill-slate-400" />
              </g>
            );
          })}
          {TOWNS.map((t) => {
            const p = project(t.lat, t.lng);
            return (
              <g key={t.name}>
                <circle cx={p.x} cy={p.y} r={t.major ? 5 : 3} className="fill-slate-400 dark:fill-slate-500" />
                <text
                  x={p.x + 8}
                  y={p.y - 8}
                  paintOrder="stroke"
                  strokeWidth={4}
                  strokeLinejoin="round"
                  className={`fill-slate-600 stroke-slate-100 dark:fill-slate-300 dark:stroke-slate-900 ${t.major ? 'text-sm font-semibold' : 'text-xs'}`}
                >
                  {t.name}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {ready &&
        markers.map((m) => {
          const { x, y } = placed.get(m.id) ?? project(m.lat, m.lng);
          const selected = m.id === selectedId;
          const highlighted = m.id === highlightedId;
          const Icon = TONE_ICON[m.tone];
          const colors = TONE_MARKER[m.tone];
          const size = selected ? 38 : highlighted ? 34 : 28;
          const manual = m.origin === 'manual';
          const name = `${m.label}${manual ? ' (your data)' : ''}${m.saved ? ' (saved lead)' : ''}`;
          return (
            <div
              key={m.id}
              className="absolute"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: selected ? 30 : highlighted ? 20 : 10 }}
            >
              <button
                type="button"
                aria-label={name}
                aria-pressed={selected}
                data-marker-id={m.id}
                data-origin={manual ? 'manual' : 'sample'}
                data-highlighted={highlighted ? 'true' : undefined}
                onClick={() => onSelect(m.id)}
                onMouseEnter={() => onHighlight(m.id)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(m.id)}
                onBlur={() => onHighlight(null)}
                className={`relative flex items-center justify-center ${manual ? 'rounded-md' : 'rounded-full'} border-2 border-white shadow-md transition-all motion-reduce:transition-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-primary)] dark:border-slate-900 ${
                  selected ? 'ring-4 ring-[var(--brand-primary)]' : ''
                }`}
                style={{ width: size, height: size, backgroundColor: colors.fill }}
              >
                <Icon className="h-4 w-4" style={{ color: colors.icon }} aria-hidden="true" />
                {m.saved && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white ring-2 ring-white dark:bg-white dark:text-slate-900 dark:ring-slate-900">
                    <Bookmark className="h-2.5 w-2.5" aria-hidden="true" />
                  </span>
                )}
              </button>
              {(selected || highlighted) && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow dark:bg-white dark:text-slate-900"
                >
                  {m.label}
                </span>
              )}
            </div>
          );
        })}

      <div className="absolute right-3 top-3 z-40 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {[
          { label: 'Zoom in', icon: Plus, onClick: () => zoomTo(zoom + 1), disabled: zoom >= MAX_ZOOM },
          { label: 'Zoom out', icon: Minus, onClick: () => zoomTo(zoom - 1), disabled: zoom <= MIN_ZOOM },
          { label: 'Show all', icon: Maximize2, onClick: () => zoomTo(MIN_ZOOM), disabled: zoom === MIN_ZOOM },
        ].map(({ label, icon: ControlIcon, onClick, disabled }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className="flex h-9 w-9 items-center justify-center border-b border-slate-200 text-slate-700 last:border-b-0 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:text-slate-500"
          >
            <ControlIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-40 rounded-lg bg-white/95 px-3 py-2 text-xs shadow-sm dark:bg-slate-800/95">
        <p className="font-semibold text-slate-800 dark:text-slate-100">Schematic map · not to scale</p>
        <ul className="mt-1 flex flex-wrap gap-3">
          {markers.some((m) => m.origin === 'manual') && (
            <li className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-700 dark:bg-slate-200" aria-hidden="true" />
              Square: your data
            </li>
          )}
          {(Object.keys(TONE_LABELS) as MarkerTone[]).map((tone) => (
            <li key={tone} className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TONE_MARKER[tone].fill }} aria-hidden="true" />
              {TONE_LABELS[tone]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
