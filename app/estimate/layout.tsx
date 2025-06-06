import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimate - Big Brother Property Solutions',
  description: 'Get an instant estimate for your cleaning project',
};

export default function EstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 