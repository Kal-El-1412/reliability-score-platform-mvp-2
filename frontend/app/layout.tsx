import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './providers/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
import { ToastProvider } from './providers/ToastContext';

export const metadata: Metadata = {
  title: 'Reliability Score Platform',
  description: 'Track your reliability score, complete missions, and earn rewards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
