import { FormData } from './types';

export function isPressureWashingJob(formData: FormData): boolean {
  return formData.cleaningType === 'pressure_washing';
}

const SERVICE_LABELS: Record<string, string> = {
  soft_wash: 'Soft wash',
  roof_wash: 'Roof wash',
  driveway: 'Driveway wash',
  deck: 'Deck / Trex wash',
  daily_rate: 'Daily rate (reference)',
};

export function getPressureWashingServiceLabel(type?: string): string {
  return SERVICE_LABELS[type || ''] || 'Pressure washing';
}

export function getPressureWashingScopeLines(formData: FormData): string[] {
  const area = Math.max(0, formData.pressureWashingArea || 0);
  const service = getPressureWashingServiceLabel(formData.pressureWashingType);
  const lines = [
    `${service} of ${area.toLocaleString()} sq ft washable exterior surface (walls/siding/specified surface — not lot size).`,
    'Includes labor, equipment, water, chemicals as specified, and travel as quoted.',
    'Protect adjacent surfaces, rinse thoroughly, and leave the site reasonably clean of wash residue.',
  ];
  if (formData.needsChimneyWash && (formData.chimneyCount || 0) > 0) {
    const count = formData.chimneyCount || 0;
    lines.push(
      `Exterior chimney wash: ${count} chimney${count === 1 ? '' : 's'}.`
    );
  }
  return lines;
}

export function getPressureWashingScopeText(formData: FormData): string {
  return getPressureWashingScopeLines(formData).join('\n');
}

export function getPressureWashingLineTitle(formData: FormData): string {
  const area = Math.max(0, formData.pressureWashingArea || 0);
  return `${getPressureWashingServiceLabel(formData.pressureWashingType)} — ${area.toLocaleString()} sq ft`;
}
