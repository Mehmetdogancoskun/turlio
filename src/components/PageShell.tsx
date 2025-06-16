/* src/components/PageShell.tsx  – server component  */
import { ReactNode } from 'react';

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800
                     dark:bg-gray-900 dark:text-gray-100
                     px-4 sm:px-6 lg:px-8 py-10">
      {children}
    </main>
  );
}
