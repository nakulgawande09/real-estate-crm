'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { FaHome, FaUsers, FaBuilding, FaChartLine, FaSignOutAlt, FaTasks, FaProjectDiagram, FaExchangeAlt } from 'react-icons/fa';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut, isAdmin, isAgent } = useAuth();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: FaHome },
    { href: '/dashboard/properties', label: 'Properties', icon: FaBuilding },
    { href: '/dashboard/leads', label: 'Leads', icon: FaUsers },
    { href: '/dashboard/tasks', label: 'Tasks', icon: FaTasks },
    { href: '/dashboard/transactions', label: 'Transactions', icon: FaExchangeAlt },
  ];

  // Admin-only links
  if (isAdmin) {
    navLinks.push({ href: '/dashboard/analytics', label: 'Analytics', icon: FaChartLine });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-semibold text-gray-800">Real Estate CRM</h1>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500">
                  <span className="text-sm font-medium leading-none text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-xs font-medium text-gray-500">{user?.role || 'role'}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? 'text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/dashboard/projects"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname.startsWith('/dashboard/projects')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FaProjectDiagram
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    pathname.startsWith('/dashboard/projects')
                      ? 'text-indigo-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                Projects
              </Link>
              <button
                onClick={() => signOut()}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
              >
                <FaSignOutAlt className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
} 