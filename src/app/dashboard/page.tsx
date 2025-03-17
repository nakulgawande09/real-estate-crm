'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaBuilding, FaUsers, FaFileAlt, FaTasks, FaChartLine, FaRegClock } from 'react-icons/fa';
import { format } from 'date-fns';

interface DashboardStats {
  properties: number;
  projects: number;
  clients: number;
  transactions: number;
  documents: number;
  tasks: number;
}

interface RecentTransaction {
  id: string;
  amount: number;
  date: string;
  propertyId: string;
  type: string;
  status: string;
}

interface RecentProject {
  id: string;
  name: string;
  type: string;
  status: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    properties: 124,
    projects: 32,
    clients: 38,
    transactions: 56,
    documents: 128,
    tasks: 15
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([
    {
      id: '1',
      name: 'Riverfront Heights',
      type: 'Multi-Family',
      status: 'Construction',
      updatedAt: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    // Fetch recent transactions
    const fetchRecentTransactions = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockTransactions = [
          {
            id: 'trans1',
            amount: 1225000,
            date: '2024-03-15T10:30:00Z',
            propertyId: 'prop1',
            type: 'SALE',
            status: 'COMPLETED'
          },
          {
            id: 'trans2',
            amount: 25000,
            date: '2024-03-14T15:45:00Z',
            propertyId: 'prop2',
            type: 'RESERVATION',
            status: 'PENDING'
          },
          {
            id: 'trans3',
            amount: 50000,
            date: '2024-03-13T09:15:00Z',
            propertyId: 'prop3',
            type: 'PAYMENT',
            status: 'COMPLETED'
          }
        ];
        
        setRecentTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
      }
    };

    fetchRecentTransactions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your real estate projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/properties" className="transform transition-all hover:scale-105">
          <div className="bg-blue-50 rounded-lg p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Properties</p>
                <p className="text-2xl font-bold text-blue-900">{stats.properties}</p>
              </div>
              <FaBuilding className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/projects" className="transform transition-all hover:scale-105">
          <div className="bg-purple-50 rounded-lg p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Projects</p>
                <p className="text-2xl font-bold text-purple-900">{stats.projects}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/clients" className="transform transition-all hover:scale-105">
          <div className="bg-green-50 rounded-lg p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Clients</p>
                <p className="text-2xl font-bold text-green-900">{stats.clients}</p>
              </div>
              <FaUsers className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/transactions" className="transform transition-all hover:scale-105">
          <div className="bg-yellow-50 rounded-lg p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Transactions</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.transactions}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/documents" className="transform transition-all hover:scale-105">
          <div className="bg-red-50 rounded-lg p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Documents</p>
                <p className="text-2xl font-bold text-red-900">{stats.documents}</p>
              </div>
              <FaFileAlt className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/tasks" className="transform transition-all hover:scale-105">
          <div className="bg-indigo-50 rounded-lg p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Tasks Due</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.tasks}</p>
              </div>
              <FaTasks className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {project.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <Link key={transaction.id} href={`/dashboard/transactions/${transaction.id}`}>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">
                      ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-600">Property #{transaction.propertyId}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 