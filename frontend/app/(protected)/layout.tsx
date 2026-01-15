'use client';

import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/providers/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Missions', href: '/missions' },
    { name: 'Rewards', href: '/rewards' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-indigo-600">
                    Reliability Score
                  </h1>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'border-indigo-500 text-slate-900'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-slate-600 mr-4">{user?.email}</span>
                <button
                  onClick={logout}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="sm:hidden bg-white border-b border-slate-200">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
