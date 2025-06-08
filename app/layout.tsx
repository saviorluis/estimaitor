import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EstimAItor - AI-Powered Cleaning Estimator',
  description: 'Professional cleaning cost estimation powered by AI',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/icons/apple-touch-icon-precomposed.png',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" href="/icons/apple-touch-icon-precomposed.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
} 