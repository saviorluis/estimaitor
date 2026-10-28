import { WINDOW_CLEANING } from '../../constants';
import type { WindowCustomerType, WindowServiceSides } from '../../types';
import type { LineItemRule, ProposalJob, ProposalTokens, ServiceProposalTemplate, TemplateText } from '../types';

const SIDES: Record<WindowServiceSides, { label: string; short: string; scope: string; labelEs: string; scopeEs: string }> = {
  exterior: {
    label: 'Exterior Only',
    short: 'Exterior glass',
    scope: 'Clean the exterior side of each window only.',
    labelEs: 'Solo exterior',
    scopeEs: 'Limpiar solo el lado exterior de cada ventana.',
  },
  interior: {
    label: 'Interior Only',
    short: 'Interior glass',
    scope: 'Clean the interior side of each window only.',
    labelEs: 'Solo interior',
    scopeEs: 'Limpiar solo el lado interior de cada ventana.',
  },
  interior_exterior: {
    label: 'Interior + Exterior',
    short: 'Interior and exterior glass',
    scope: 'Clean both the interior and exterior side of each window.',
    labelEs: 'Interior y exterior',
    scopeEs: 'Limpiar el lado interior y el lado exterior de cada ventana.',
  },
};

const CUSTOMER_TYPES: Record<WindowCustomerType, { label: string; labelEs: string }> = {
  residential: { label: 'Residential', labelEs: 'Residencial' },
  commercial: { label: 'Commercial / Storefront', labelEs: 'Comercial / Local comercial' },
};

function sides(job: ProposalJob) {
  const value = job.formData.windowServiceSides;
  return value && value in SIDES ? SIDES[value] : null;
}

function customerType(job: ProposalJob) {
  const value = job.formData.windowCustomerType;
  return value && value in CUSTOMER_TYPES ? CUSTOMER_TYPES[value] : null;
}

const includesInterior = (job: ProposalJob) =>
  job.formData.windowServiceSides === 'interior' || job.formData.windowServiceSides === 'interior_exterior';
const includesExterior = (job: ProposalJob) =>
  job.formData.windowServiceSides === 'exterior' || job.formData.windowServiceSides === 'interior_exterior';
const hasHighAccess = (job: ProposalJob) => job.windows.highAccess > 0;
const isResidential = (job: ProposalJob) => job.formData.windowCustomerType === 'residential';
const isCommercial = (job: ProposalJob) => job.formData.windowCustomerType === 'commercial';
const urgency = (job: ProposalJob) => job.estimateData.urgencyMultiplier || 1;
const isPriority = (job: ProposalJob) => urgency(job) > 1;

const when = (text: string, predicate: (job: ProposalJob) => boolean): TemplateText => ({ text, when: predicate });

function listPhrase(parts: string[], and: string): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} ${and} ${parts[parts.length - 1]}`;
}

const count = (n: number) => n.toLocaleString('en-US');

function breakdown(job: ProposalJob): string {
  const { standard, large, highAccess } = job.windows;
  const parts = [
    standard > 0 ? `${count(standard)} standard` : '',
    large > 0 ? `${count(large)} large` : '',
    highAccess > 0 ? `${count(highAccess)} high-access` : '',
  ].filter(Boolean);
  return parts.length > 0 ? listPhrase(parts, 'and') : 'no windows entered';
}

function breakdownEs(job: ProposalJob): string {
  const { standard, large, highAccess } = job.windows;
  const parts = [
    standard > 0 ? `${count(standard)} estándar` : '',
    large > 0 ? `${count(large)} ${large === 1 ? 'grande' : 'grandes'}` : '',
    highAccess > 0 ? `${count(highAccess)} de difícil acceso` : '',
  ].filter(Boolean);
  return parts.length > 0 ? listPhrase(parts, 'y') : 'sin ventanas indicadas';
}

function tokens(job: ProposalJob): ProposalTokens {
  const { total, highAccess } = job.windows;
  return {
    windowTotal: `${count(total)} ${total === 1 ? 'window' : 'windows'}`,
    breakdown: breakdown(job),
    highAccessPhrase: `${count(highAccess)} high-access ${highAccess === 1 ? 'window' : 'windows'}`,
    sidesScope: sides(job)?.scope ?? '',
    urgencyLevel: String(job.formData.urgencyLevel),
    windowTotalEs: `${count(total)} ${total === 1 ? 'ventana' : 'ventanas'}`,
    breakdownEs: breakdownEs(job),
    highAccessPhraseEs: `${count(highAccess)} ${highAccess === 1 ? 'ventana' : 'ventanas'} de difícil acceso`,
    sidesScopeEs: sides(job)?.scopeEs ?? '',
  };
}

const perWindowCost = (multiplier: number) => (n: number, job: ProposalJob) =>
  n * WINDOW_CLEANING.COST_PER_WINDOW * multiplier * urgency(job);

const standardCost = perWindowCost(1);
const largeCost = perWindowCost(WINDOW_CLEANING.LARGE_WINDOW_MULTIPLIER);
const highAccessCost = perWindowCost(WINDOW_CLEANING.HIGH_ACCESS_MULTIPLIER);

const sidesDetail = (job: ProposalJob) => sides(job)?.short;

const lineItems: LineItemRule[] = [
  {
    id: 'standard_windows',
    description: 'Standard windows',
    detail: sidesDetail,
    quantity: (job) => job.windows.standard,
    unit: 'windows',
    costBasis: (job) => standardCost(job.windows.standard, job),
    omitWhenZero: true,
  },
  {
    id: 'large_windows',
    description: 'Large windows',
    detail: sidesDetail,
    quantity: (job) => job.windows.large,
    unit: 'windows',
    costBasis: (job) => largeCost(job.windows.large, job),
    omitWhenZero: true,
  },
  {
    id: 'high_access_windows',
    description: 'High-access windows',
    detail: (job) => [sides(job)?.short, 'ladder or extension-pole access'].filter(Boolean).join(', '),
    quantity: (job) => job.windows.highAccess,
    unit: 'windows',
    costBasis: (job) => highAccessCost(job.windows.highAccess, job),
    omitWhenZero: true,
  },
  {
    id: 'minimum_charge',
    description: 'Minimum service charge',
    detail: () => 'Brings window cleaning up to the job minimum',
    costBasis: (job) => job.estimateData.mobilizationFee || 0,
    omitWhenZero: true,
  },
  {
    id: 'travel_scheduling',
    description: 'Travel and scheduling',
    costBasis: (job) =>
      (job.estimateData.travelCost || 0) * urgency(job) +
      (job.estimateData.schedulingFee || 0) +
      (job.estimateData.invoicingFee || 0),
    absorbsRounding: true,
  },
  {
    id: 'overnight',
    description: 'Overnight lodging and per diem',
    costBasis: (job) => (job.estimateData.overnightCost || 0) * urgency(job),
    omitWhenZero: true,
  },
  {
    id: 'display_cases',
    description: 'Display case cleaning',
    costBasis: (job) => (job.estimateData.displayCaseCost || 0) * urgency(job),
    omitWhenZero: true,
  },
  {
    id: 'painting',
    description: 'Painting',
    costBasis: (job) => (job.estimateData.paintingCost || 0) * urgency(job),
    omitWhenZero: true,
  },
];

const scopeOfWork: TemplateText[] = [
  'Clean the glass of {windowTotal} ({breakdown}).',
  when('{sidesScope}', (job) => sides(job) !== null),
  'Wipe down window sills that can be reached safely.',
  when('Use ladders or extension poles to reach the {highAccessPhrase} listed.', hasHighAccess),
  when('Place towels or drop cloths under each interior window to protect sills and floors.', includesInterior),
  when('Priority scheduling (urgency level {urgencyLevel}/10) is included in this price.', isPriority),
];

const excluded: TemplateText[] = [
  'Window screens and window tracks.',
  'Hard-water stain and mineral-deposit removal.',
  'Paint, adhesive, sticker, and construction-debris removal.',
  'Post-construction detailing.',
  'Ladder, pole, or lift access for any window not listed as high-access.',
  'Repairs to glass, seals, frames, screens, or caulking.',
  when('Interior glass.', (job) => job.formData.windowServiceSides === 'exterior'),
  when('Exterior glass.', (job) => job.formData.windowServiceSides === 'interior'),
];

const scopeOfWorkEs: TemplateText[] = [
  'Limpiar el vidrio de {windowTotalEs} ({breakdownEs}).',
  when('{sidesScopeEs}', (job) => sides(job) !== null),
  'Limpiar los alféizares que se puedan alcanzar de forma segura.',
  when('Usar escaleras o pértigas extensibles para las {highAccessPhraseEs} indicadas.', hasHighAccess),
  when('Colocar toallas o lonas debajo de cada ventana interior para proteger alféizares y pisos.', includesInterior),
  when('Programación prioritaria (nivel de urgencia {urgencyLevel}/10).', isPriority),
];

const excludedEs: TemplateText[] = [
  'Mosquiteros y rieles de ventanas.',
  'Eliminación de manchas de agua dura y depósitos minerales.',
  'Eliminación de pintura, adhesivos, calcomanías y residuos de construcción.',
  'Detallado de limpieza post-construcción.',
  'Acceso con escalera, pértiga o elevador para ventanas que no estén indicadas como de difícil acceso.',
  'Reparaciones de vidrios, sellos, marcos, mosquiteros o masilla.',
  when('Vidrio interior.', (job) => job.formData.windowServiceSides === 'exterior'),
  when('Vidrio exterior.', (job) => job.formData.windowServiceSides === 'interior'),
];

const windowsFact = (job: ProposalJob) => `${breakdown(job)} (${count(job.windows.total)} total)`;
const windowsFactEs = (job: ProposalJob) => `${breakdownEs(job)} (${count(job.windows.total)} en total)`;
const hoursFact = (job: ProposalJob) =>
  job.estimateData.estimatedHours > 0 ? `${job.estimateData.estimatedHours.toFixed(1)} hours` : null;
const hoursFactEs = (job: ProposalJob) =>
  job.estimateData.estimatedHours > 0 ? `${job.estimateData.estimatedHours.toFixed(1)} horas` : null;

export const windowCleaningTemplate: ServiceProposalTemplate = {
  serviceType: 'window_cleaning',
  templateVersion: 1,
  displayName: 'Window Cleaning',
  documentTitle: 'Window Cleaning Proposal',
  coverTitle: ['WINDOW CLEANING', 'PROPOSAL'],
  projectFacts: [
    { label: 'Service', value: () => 'Window Cleaning' },
    { label: 'Customer Type', value: (job) => customerType(job)?.label ?? null },
    { label: 'Sides Cleaned', value: (job) => sides(job)?.label ?? null },
    { label: 'Windows', value: windowsFact },
    { label: 'Scheduling', value: (job) => (isPriority(job) ? `Priority (level ${job.formData.urgencyLevel}/10)` : null) },
  ],
  scopeOfWork,
  included: [
    'Glass cleaning and accessible sill wipe-down for the windows listed above.',
    'All labor, cleaning solutions, and standard equipment.',
    when('Ladders and extension poles for the {highAccessPhrase} listed.', hasHighAccess),
    'Travel to and from the project address.',
  ],
  excludedTitle: 'Not Included Unless Separately Selected and Priced',
  excluded,
  assumptions: [
    'This price is for the window counts listed above. If the count or window sizes on site differ, we will confirm a revised price with you before starting.',
    when('Large windows are oversized panes or units.', ({ windows }) => windows.large > 0),
    when('High-access windows are windows that need a ladder or extension pole to reach.', hasHighAccess),
    when('Gates are unlocked and pets are secured on the service day.', isResidential),
    when(
      'An adult is home to let us in, blinds are open, and fragile items are moved away from the windows.',
      (job) => isResidential(job) && includesInterior(job)
    ),
    when(
      'Work is scheduled during your normal business hours unless another time is agreed, and we work around customers and foot traffic.',
      isCommercial
    ),
    when(
      'Displays, signage, and merchandise are moved away from interior glass before we arrive.',
      (job) => isCommercial(job) && includesInterior(job)
    ),
    when(
      'Exterior work is scheduled for dry weather. Rain, freezing temperatures, or high wind may move the appointment.',
      includesExterior
    ),
    'Existing scratches, etching, fogged or failed seals, and damaged screens are not caused by cleaning and will be pointed out if found.',
  ],
  lineItems,
  pricingNote: 'Price includes labor, cleaning solutions, standard equipment, and travel as quoted.',
  quoteNotes: '',
  terms: [
    'Payment: Payment is due on completion. If invoiced, payment is due within 15 days of the invoice date. A late fee of 10% of the invoice total may be added after the due date.',
    "Cancellation: Please give 48 hours' notice to cancel or reschedule without charge.",
    'Access: If we arrive and cannot safely reach the quoted windows (locked access, unsafe conditions, or the site not ready), a minimum return-trip fee of $250 applies.',
    'Scope: This proposal covers only the windows and sides listed. Additional windows or services are quoted separately.',
    'Weather: Weather delays are rescheduled at no charge and are not a cancellation by either party.',
    'Care: We take reasonable care with your property. We are not responsible for glass, seals, frames, or screens that are already damaged, loose, or deteriorated.',
    'Validity: This proposal is valid for 30 days from the date issued.',
  ],
  invoicePaymentTerms:
    'Payment is due on completion. If invoiced, payment is due within 15 days of the invoice date. A late fee of 10% of the invoice total may be added after the due date.',
  documents: ['quote', 'work_order', 'work_order_es', 'purchase_order', 'invoice', 'change_order'],
  showCapabilityStatement: false,
  crew: {
    en: {
      serviceLabel: 'Window Cleaning',
      facts: [
        { label: 'Service', value: () => 'Window Cleaning' },
        { label: 'Customer Type', value: (job) => customerType(job)?.label ?? null },
        { label: 'Sides', value: (job) => sides(job)?.label ?? 'Not specified - confirm with supervisor' },
        { label: 'Windows', value: windowsFact },
        { label: 'Estimated Time', value: hoursFact },
      ],
      scopeOfWork,
      excludedTitle: 'Not Included - Do Not Perform Without an Approved Change Order',
      excluded,
      sections: [
        {
          title: 'Quality Check',
          lines: [
            'Before leaving, walk every quoted window with the supervisor or customer and correct any streaks during the same visit.',
          ],
        },
      ],
    },
    es: {
      serviceLabel: 'Limpieza de Ventanas',
      facts: [
        { label: 'Servicio', value: () => 'Limpieza de Ventanas' },
        { label: 'Tipo de Cliente', value: (job) => customerType(job)?.labelEs ?? null },
        { label: 'Lados', value: (job) => sides(job)?.labelEs ?? 'No indicado - confirmar con el supervisor' },
        { label: 'Ventanas', value: windowsFactEs },
        { label: 'Tiempo Estimado', value: hoursFactEs },
      ],
      scopeOfWork: scopeOfWorkEs,
      excludedTitle: 'No Incluido - No Realizar Sin una Orden de Cambio Aprobada',
      excluded: excludedEs,
      sections: [
        {
          title: 'Revisión de Calidad',
          lines: [
            'Antes de salir, revisar cada ventana cotizada con el supervisor o el cliente y corregir cualquier raya en la misma visita.',
          ],
        },
      ],
    },
  },
  tokens,
  missingInputs: (job) =>
    [
      sides(job) ? '' : 'Service sides (Exterior Only, Interior Only, or Interior + Exterior)',
      customerType(job) ? '' : 'Customer type (Residential or Commercial / Storefront)',
      job.windows.total > 0 ? '' : 'At least one window',
    ].filter(Boolean),
};
