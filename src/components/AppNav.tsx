'use client';

import { usePathname } from 'next/navigation';
import { Calculator, MapPinned } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Estimator', icon: Calculator },
  { href: '/prospects', label: 'Prospects', icon: MapPinned },
];

export default function AppNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="mb-6 flex justify-end">
      <ul className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href}>
              {/* Full page loads: the estimator and Prospects are separate bundles that keep their state in localStorage. */}
              <a
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
