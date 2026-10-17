import type { ComponentType } from 'react';

/**
 * The only contract the Prospects page has with a map. A vendor map (e.g. Mapbox, once approved)
 * implements these props; records only ever store plain latitude/longitude, never vendor objects.
 */
export type MarkerTone = 'commercial' | 'residential' | 'construction';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Accessible name, e.g. "Quillmark Medical Pavilion, Greensboro" */
  label: string;
  tone: MarkerTone;
  /** Shown with a ring so saved leads stand out. */
  saved?: boolean;
  /** 'manual' for prospects you entered; sample markers are drawn differently so the two never blur. */
  origin?: 'sample' | 'manual';
}

export interface MapAdapterProps {
  markers: MapMarker[];
  selectedId: string | null;
  highlightedId: string | null;
  onSelect: (id: string) => void;
  onHighlight: (id: string | null) => void;
  /** Visible map name for screen readers, e.g. "Sample map of prospects" */
  ariaLabel: string;
}

export type MapAdapter = ComponentType<MapAdapterProps>;
