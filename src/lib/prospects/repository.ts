import { SAMPLE_PROSPECTS } from './sampleData';
import type { Prospect } from './types';

/**
 * Screens load prospects only through this module, so a real data source can replace the
 * sample set later without changing the UI.
 */
export async function loadProspects(): Promise<Prospect[]> {
  return SAMPLE_PROSPECTS;
}
