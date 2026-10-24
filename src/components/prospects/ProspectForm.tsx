'use client';

import { forwardRef, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, ChevronDown } from 'lucide-react';
import { US_STATES } from '@/lib/salesTax';
import { prospectName } from '@/lib/prospects/filters';
import {
  LIMITS,
  findDuplicateAddresses,
  localIsoDate,
  validateDraft,
  type DraftErrors,
  type DraftField,
  type ManualProspectFields,
  type ProspectDraft,
} from '@/lib/prospects/manualProspectForm';
import {
  COUNT_CONFIDENCES,
  MANUAL_PROPERTY_TYPES,
  MANUAL_SOURCE_LABELS,
  MANUAL_SOURCE_TYPES,
  PROSPECT_STATUSES,
  PROSPECT_STATUS_LABELS,
  type AnyProspect,
} from '@/lib/prospects/types';
import type { SaveResult } from './useManualProspects';
import { TONE_LABELS } from './styles';

const INPUT =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400';
const INPUT_OK = 'border-slate-300 dark:border-slate-600';
const INPUT_ERROR = 'border-red-600 dark:border-red-400';
const LABEL = 'block text-sm font-medium text-slate-800 dark:text-slate-100';
const HINT = 'mt-1 text-xs text-slate-600 dark:text-slate-300';
const ERROR_TEXT = 'mt-1 text-sm text-red-700 dark:text-red-300';
const WARNING_TEXT = 'mt-1 text-sm text-amber-800 dark:text-amber-200';
const SUBHEAD = 'text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300';

const MAIN_FIELDS: DraftField[] = ['name', 'propertyType', 'street', 'city', 'state', 'zip', 'windowCount', 'sourceType', 'sourceUrl', 'sourceNote'];
const DETAIL_FIELDS: DraftField[] = [
  'countConfidence', 'researchedAt', 'status', 'followUpAt', 'internalNotes', 'stories', 'squareFootage', 'accessNotes',
  'exteriorScope', 'interiorScope', 'priceLow', 'priceHigh', 'referenceUrls', 'lat', 'lng',
];
const FIELD_ORDER = [...MAIN_FIELDS, ...DETAIL_FIELDS];

const fieldId = (field: DraftField) => `pf-${field}`;
const errorId = (field: DraftField) => `pf-${field}-error`;

interface ProspectFormProps {
  mode: 'new' | 'edit';
  initialDraft: ProspectDraft;
  editingId?: string;
  existing: AnyProspect[];
  onSave: (fields: ManualProspectFields) => SaveResult;
  onSaved: (id: string) => void;
  onCancel: () => void;
  /** 'coords' opens More details with the latitude field focused, for adding a map position. */
  initialFocus?: 'coords';
}

const ProspectForm = forwardRef<HTMLHeadingElement, ProspectFormProps>(function ProspectForm(
  { mode, initialDraft, editingId, existing, onSave, onSaved, onCancel, initialFocus },
  headingRef
) {
  const [draft, setDraft] = useState(initialDraft);
  const [submitted, setSubmitted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(initialFocus === 'coords');
  useEffect(() => {
    if (initialFocus !== 'coords') return;
    const frame = requestAnimationFrame(() => {
      const lat = document.getElementById(fieldId('lat'));
      lat?.scrollIntoView({ block: 'center' });
      lat?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [initialFocus]);
  const [duplicateAck, setDuplicateAck] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const duplicateRef = useRef<HTMLInputElement>(null);

  const today = localIsoDate();
  const validation = useMemo(() => validateDraft(draft, today), [draft, today]);
  const errors: DraftErrors = submitted ? validation.errors : {};
  const warnings = validation.warnings;

  const duplicates = useMemo(() => {
    if (!draft.street.trim() || !draft.city.trim() || !draft.state) return [];
    return findDuplicateAddresses(
      { line1: draft.street, city: draft.city, state: draft.state, zip: draft.zip.trim() },
      existing,
      editingId
    );
  }, [draft.street, draft.city, draft.state, draft.zip, existing, editingId]);
  const duplicateKey = duplicates.map((d) => d.prospect.id).join(',');
  const [ackKey, setAckKey] = useState('');
  const duplicateBlocking = duplicates.length > 0 && !(duplicateAck && ackKey === duplicateKey);

  const dirty = (Object.keys(draft) as DraftField[]).some((k) => draft[k] !== initialDraft[k]);
  const filledDetails = DETAIL_FIELDS.filter((f) => {
    if (f === 'status') return draft.status !== 'new';
    if (f === 'researchedAt') return draft.researchedAt !== today;
    return draft[f].trim() !== '';
  }).length;
  const needsConfidence = draft.windowCount.trim() !== '' && !draft.countConfidence;

  const set = (field: DraftField) => (value: string) => {
    setDraft((d) => ({ ...d, [field]: value }));
    setSaveError(null);
    setConfirmDiscard(false);
  };

  const describedBy = (field: DraftField, hintId?: string) =>
    [hintId, errors[field] ? errorId(field) : null, warnings[field] ? `pf-${field}-warning` : null].filter(Boolean).join(' ') || undefined;

  const inputProps = (field: DraftField, hintId?: string) => ({
    id: fieldId(field),
    name: field,
    value: draft[field],
    onChange: (e: { target: { value: string } }) => set(field)(e.target.value),
    'aria-invalid': errors[field] ? (true as const) : undefined,
    'aria-describedby': describedBy(field, hintId),
    className: `${INPUT} ${errors[field] ? INPUT_ERROR : INPUT_OK}`,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validation.fields) {
      // Errors inside the collapsed section must be visible for the summary links to reach them.
      if (DETAIL_FIELDS.some((f) => validation.errors[f])) setDetailsOpen(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (duplicateBlocking) {
      requestAnimationFrame(() => duplicateRef.current?.focus());
      return;
    }
    const result = onSave(validation.fields);
    if (result.ok) onSaved(result.prospect.id);
    else setSaveError(result.error);
  };

  const cancel = () => {
    if (dirty && !confirmDiscard) setConfirmDiscard(true);
    else onCancel();
  };

  const errorList = FIELD_ORDER.filter((f) => errors[f]);

  return (
    <form noValidate onSubmit={submit} className="space-y-4" aria-labelledby="prospect-form-heading" data-testid="prospect-form">
      <button
        type="button"
        onClick={cancel}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {mode === 'new' ? 'Back to prospects' : 'Back to prospect'}
      </button>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="prospect-form-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-slate-900 focus:outline-none dark:text-white">
          {mode === 'new' ? 'Add prospect' : 'Edit prospect'}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          <span aria-hidden="true">* </span>Required
        </p>
      </div>

      {submitted && errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
          data-testid="form-error-summary"
        >
          <p className="font-semibold">
            Fix {errorList.length} {errorList.length === 1 ? 'field' : 'fields'} before saving:
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {errorList.map((f) => (
              <li key={f}>
                <a href={`#${fieldTarget(f)}`} className="underline">
                  {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <Field field="name" label="Property name" error={errors.name}>
          <input {...inputProps('name')} maxLength={LIMITS.name} autoComplete="off" />
        </Field>

        <ChoiceGroup
          field="propertyType"
          legend="Property type"
          required
          error={errors.propertyType}
          value={draft.propertyType}
          onChange={set('propertyType')}
          options={MANUAL_PROPERTY_TYPES.map((t) => ({ value: t, label: TONE_LABELS[t] }))}
        />

        <Field field="street" label="Street" required error={errors.street} warning={warnings.street}>
          <input {...inputProps('street')} maxLength={LIMITS.street} autoComplete="off" placeholder="123 Main St" />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_6rem_8rem]">
          <Field field="city" label="City" required error={errors.city} className="col-span-2 sm:col-span-1">
            <input {...inputProps('city')} maxLength={LIMITS.city} autoComplete="off" />
          </Field>
          <Field field="state" label="State" required error={errors.state}>
            <select {...inputProps('state')}>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}
                </option>
              ))}
            </select>
          </Field>
          <Field field="zip" label="ZIP" required error={errors.zip}>
            <input {...inputProps('zip')} inputMode="numeric" maxLength={10} autoComplete="off" />
          </Field>
        </div>

        {duplicates.length > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100" data-testid="duplicate-warning">
            <p className="flex items-center gap-2 font-semibold" role="status">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Possible duplicate address
            </p>
            <ul className="mt-1 space-y-0.5">
              {duplicates.map(({ prospect, match }) => (
                <li key={prospect.id}>
                  <span className="font-medium">{prospectName(prospect)}</span>, {prospect.address.line1}, {prospect.address.city}
                  {' · '}
                  {prospect.dataOrigin === 'sample' ? 'Sample data' : 'Your data'}
                  {match === 'similar' ? ' · same building, different unit or suite' : ' · same address'}
                </li>
              ))}
            </ul>
            <p className="mt-1">Nothing will be merged or overwritten.</p>
            <label className="mt-2 flex items-start gap-2 font-medium">
              <input
                ref={duplicateRef}
                type="checkbox"
                checked={duplicateAck && ackKey === duplicateKey}
                onChange={(e) => {
                  setDuplicateAck(e.target.checked);
                  setAckKey(duplicateKey);
                }}
                aria-describedby={submitted && duplicateBlocking ? 'pf-duplicate-error' : undefined}
                className="mt-0.5 h-4 w-4 rounded border-slate-400"
              />
              This is a different prospect. Save it as a separate record.
            </label>
            {submitted && duplicateBlocking && (
              <p id="pf-duplicate-error" className={ERROR_TEXT}>
                Confirm this is a different prospect, or cancel and edit the existing record.
              </p>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            field="windowCount"
            label="Window count"
            hint={needsConfidence ? 'Set its confidence under More details.' : undefined}
            error={errors.windowCount}
          >
            <input {...inputProps('windowCount', needsConfidence ? 'pf-windowCount-hint' : undefined)} inputMode="numeric" autoComplete="off" />
          </Field>
          <Field field="sourceType" label="Source" required error={errors.sourceType}>
            <select {...inputProps('sourceType')}>
              <option value="">Choose…</option>
              {MANUAL_SOURCE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {MANUAL_SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field field="sourceUrl" label="Source link" error={errors.sourceUrl}>
            <input {...inputProps('sourceUrl', 'pf-source-hint')} type="url" inputMode="url" autoComplete="off" placeholder="https://" />
          </Field>
          <Field field="sourceNote" label="Source note" error={errors.sourceNote}>
            <input {...inputProps('sourceNote', 'pf-source-hint')} maxLength={LIMITS.shortNote} autoComplete="off" />
          </Field>
        </div>
        <p id="pf-source-hint" className="-mt-2 text-xs text-slate-600 dark:text-slate-300">
          Add a link, a note, or both.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          aria-expanded={detailsOpen}
          aria-controls="prospect-more-details"
          onClick={() => setDetailsOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] dark:text-white dark:hover:bg-slate-700/50"
        >
          <span>
            More details
            {filledDetails > 0 && <span className="ml-2 font-normal text-slate-600 dark:text-slate-300">{filledDetails} filled</span>}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${detailsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {/* Kept mounted while collapsed so nothing typed here is lost. */}
        <div id="prospect-more-details" hidden={!detailsOpen} className="space-y-5 border-t border-slate-200 px-4 pb-4 pt-4 dark:border-slate-700">
          <section className="space-y-3" aria-label="Research">
            <h3 className={SUBHEAD}>Research</h3>
            <ChoiceGroup
              field="countConfidence"
              legend="Count confidence"
              required={draft.windowCount.trim() !== ''}
              error={errors.countConfidence}
              value={draft.countConfidence}
              onChange={set('countConfidence')}
              columns={4}
              options={COUNT_CONFIDENCES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
              hint="Choose Verified only if you counted on site or the owner confirmed it."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field field="researchedAt" label="Research date" error={errors.researchedAt}>
                <input {...inputProps('researchedAt')} type="date" max={today} />
              </Field>
              <Field field="status" label="Status" error={errors.status}>
                <select {...inputProps('status')}>
                  {PROSPECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {PROSPECT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field field="followUpAt" label="Follow-up" error={errors.followUpAt}>
                <input {...inputProps('followUpAt')} type="date" />
              </Field>
            </div>
            <Field field="internalNotes" label="Internal notes" error={errors.internalNotes}>
              <textarea {...inputProps('internalNotes')} rows={2} maxLength={LIMITS.longNote} />
            </Field>
          </section>

          <section className="space-y-3" aria-label="Building and scope">
            <h3 className={SUBHEAD}>Building and scope</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field field="stories" label="Stories" error={errors.stories}>
                <input {...inputProps('stories')} inputMode="numeric" autoComplete="off" />
              </Field>
              <Field field="squareFootage" label="Square feet" error={errors.squareFootage}>
                <input {...inputProps('squareFootage')} inputMode="numeric" autoComplete="off" />
              </Field>
            </div>
            <Field field="accessNotes" label="Access / job complexity" error={errors.accessNotes}>
              <textarea {...inputProps('accessNotes')} rows={2} maxLength={LIMITS.longNote} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field field="exteriorScope" label="Exterior scope" error={errors.exteriorScope}>
                <textarea {...inputProps('exteriorScope')} rows={2} maxLength={LIMITS.longNote} />
              </Field>
              <Field field="interiorScope" label="Interior scope" error={errors.interiorScope}>
                <textarea {...inputProps('interiorScope')} rows={2} maxLength={LIMITS.longNote} />
              </Field>
            </div>
          </section>

          <section className="space-y-3" aria-label="Pricing and references">
            <h3 className={SUBHEAD}>Pricing and references</h3>
            <fieldset aria-describedby="pf-price-hint">
              <legend className={LABEL}>Preliminary price range</legend>
              <p id="pf-price-hint" className={HINT}>
                Not a customer quote. The estimator sets the price.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Field field="priceLow" label="Low ($)" error={errors.priceLow}>
                  <input {...inputProps('priceLow')} inputMode="decimal" autoComplete="off" />
                </Field>
                <Field field="priceHigh" label="High ($)" error={errors.priceHigh}>
                  <input {...inputProps('priceHigh')} inputMode="decimal" autoComplete="off" />
                </Field>
              </div>
            </fieldset>
            <Field field="referenceUrls" label="Photo / reference links" hint={`One per line, up to ${LIMITS.referenceUrls}.`} error={errors.referenceUrls}>
              <textarea {...inputProps('referenceUrls', 'pf-referenceUrls-hint')} rows={2} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field field="lat" label="Latitude" error={errors.lat}>
                <input {...inputProps('lat', 'pf-coords-hint')} inputMode="decimal" autoComplete="off" />
              </Field>
              <Field field="lng" label="Longitude" error={errors.lng}>
                <input {...inputProps('lng', 'pf-coords-hint')} inputMode="decimal" autoComplete="off" />
              </Field>
            </div>
            <p id="pf-coords-hint" className="-mt-1 text-xs text-slate-600 dark:text-slate-300">
              Without coordinates the prospect is listed but not mapped.
            </p>
          </section>
        </div>
      </div>

      {saveError && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
          {saveError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          {mode === 'new' ? 'Save prospect' : 'Save changes'}
        </button>
        {confirmDiscard ? (
          <span className="flex flex-wrap items-center gap-2 text-sm text-slate-800 dark:text-slate-100" role="group" aria-label="Discard changes?">
            Discard your changes?
            <button type="button" onClick={onCancel} className="rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-800 hover:bg-red-50 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-950">
              Discard
            </button>
            <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium dark:border-slate-600">
              Keep editing
            </button>
          </span>
        ) : (
          <button type="button" onClick={cancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
});

export default ProspectForm;

const CHOICE_FIELDS: DraftField[] = ['propertyType', 'countConfidence'];
/** Radio groups are linked by their first option, since the group itself is not focusable. */
const fieldTarget = (field: DraftField) =>
  CHOICE_FIELDS.includes(field)
    ? `${fieldId(field)}-${field === 'propertyType' ? MANUAL_PROPERTY_TYPES[0] : COUNT_CONFIDENCES[0]}`
    : fieldId(field);

function RequiredMark() {
  return (
    <>
      <span className="text-red-700 dark:text-red-300" aria-hidden="true">
        {' '}*
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

interface FieldProps {
  field: DraftField;
  label: string;
  hint?: string;
  error?: string;
  warning?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

function Field({ field, label, hint, error, warning, required, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={fieldId(field)} className={LABEL}>
        {label}
        {required && <RequiredMark />}
      </label>
      <div className="mt-1">{children}</div>
      {hint && (
        <p id={`${fieldId(field)}-hint`} className={HINT}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId(field)} className={ERROR_TEXT}>
          {error}
        </p>
      )}
      {!error && warning && (
        <p id={`${fieldId(field)}-warning`} className={WARNING_TEXT}>
          {warning}
        </p>
      )}
    </div>
  );
}

interface ChoiceGroupProps {
  field: DraftField;
  legend: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  columns?: 3 | 4;
  options: { value: string; label: string }[];
}

function ChoiceGroup({ field, legend, required, error, hint, value, onChange, columns = 3, options }: ChoiceGroupProps) {
  const hintId = hint ? `${fieldId(field)}-hint` : null;
  const described = [hintId, error ? errorId(field) : null].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset aria-describedby={described} aria-invalid={error ? true : undefined}>
      <legend className={LABEL}>
        {legend}
        {required && <RequiredMark />}
      </legend>
      <div className={`mt-1 grid grid-cols-2 gap-2 ${columns === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        {options.map((o) => {
          const id = `${fieldId(field)}-${o.value}`;
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm font-medium text-slate-900 dark:text-white ${
                checked
                  ? 'border-[var(--brand-primary)] bg-slate-50 dark:bg-slate-900'
                  : error
                    ? INPUT_ERROR
                    : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              <input id={id} type="radio" name={field} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="h-4 w-4" />
              {o.label}
            </label>
          );
        })}
      </div>
      {hint && (
        <p id={hintId!} className={HINT}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId(field)} className={ERROR_TEXT}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
