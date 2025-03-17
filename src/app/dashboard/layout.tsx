'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { FaHome, FaUsers, FaBuilding, FaChartLine, FaSignOutAlt, FaTasks, FaProjectDiagram, FaExchangeAlt, FaBars, FaTimes } from 'react-icons/fa';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut, isAdmin, isAgent } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration issues by setting mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: FaHome },
    { href: '/dashboard/properties', label: 'Properties', icon: FaBuilding },
    { href: '/dashboard/leads', label: 'Leads', icon: FaUsers },
    { href: '/dashboard/tasks', label: 'Tasks', icon: FaTasks },
    { href: '/dashboard/transactions', label: 'Transactions', icon: FaExchangeAlt },
    { href: '/dashboard/projects', label: 'Projects', icon: FaProjectDiagram },
  ];

  // Admin-only links
  if (isAdmin) {
    navLinks.push({ href: '/dashboard/analytics', label: 'Analytics', icon: FaChartLine });
  }

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const renderNavLinks = () => {
    return navLinks.map((link) => {
      const isActive = pathname === link.href || 
                       (link.href !== '/dashboard' && pathname.startsWith(link.href));
      const Icon = link.icon;
      
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`group flex items-center px-2 py-3 md:py-2 text-base md:text-sm font-medium rounded-md ${
            isActive
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Icon
            className={`mr-3 flex-shrink-0 h-6 w-6 md:h-5 md:w-5 ${
              isActive
                ? 'text-indigo-500'
                : 'text-gray-400 group-hover:text-gray-500'
            }`}
          />
          {link.label}
        </Link>
      );
    });
  };

  if (!mounted) {
    return <div className="flex h-screen bg-gray-50">
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 md:px-8">
          {children}
        </main>
      </div>
    </div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 flex items-center p-4 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 p-2 rounded-md bg-white shadow-sm"
        >
          <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
          {isMobileMenuOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-5 overflow-y-auto">
          <div className="flex items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-800">Real Estate CRM</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            >
              <span className="sr-only">Close menu</span>
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500">
                  <span className="text-base font-medium leading-none text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-sm font-medium text-gray-500">{user?.role || 'role'}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {renderNavLinks()}
              <button
                onClick={() => signOut()}
                className="group flex items-center px-2 py-3 md:py-2 text-base md:text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
              >
                <FaSignOutAlt className="mr-3 flex-shrink-0 h-6 w-6 md:h-5 md:w-5 text-gray-400 group-hover:text-gray-500" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
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
              {renderNavLinks()}
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
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 md:px-8 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
} 