import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProspectsExplorer from '@/components/prospects/ProspectsExplorer';
import { LoadingState } from '@/components/prospects/StateViews';

export const metadata: Metadata = {
  title: 'Prospects · EstimAItor',
  description: 'Browse commercial, residential and construction prospects (sample data).',
};

export default function ProspectsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProspectsExplorer />
    </Suspense>
  );
}
