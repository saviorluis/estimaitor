import Link from 'next/link';
import EmbeddableEstimator from '../components/EmbeddableEstimator';

export default function EstimatePage() {
  return (
    <div className="container mx-auto py-8 relative">
      <h1 className="text-3xl font-bold mb-6">Get an Estimate</h1>
      <EmbeddableEstimator
        initialTab="commercial"
        containerClassName="max-w-4xl mx-auto"
        showTitle={true}
        showSyncStatus={true}
        mode="client"
        markup={50}
      />
      {/* Subtle Admin button in the top-right corner */}
      <Link
        href="/admin"
        className="absolute top-4 right-4 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded shadow opacity-50 hover:opacity-80 transition-opacity"
        title="Admin Login"
      >
        Admin
      </Link>
    </div>
  );
} 