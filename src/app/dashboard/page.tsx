'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FaBuilding, FaUsers, FaFileAlt, FaTasks, FaChartLine, FaRegClock, FaCheckCircle, FaExchangeAlt, FaCalendarAlt, FaMapMarkerAlt, FaFlag } from 'react-icons/fa';
import { format, subDays, subMonths } from 'date-fns';
import dynamic from 'next/dynamic';

export const runtime = 'edge';

// Dynamically import charts to improve initial load time (client-side only)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
  propertyName: string;
  type: string;
  status: string;
}

interface RecentProject {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  revenue: number;
  budget: number;
  updatedAt: string;
}

interface ProjectMilestone {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'DELAYED';
  dueDate: string;
  completedAt?: string;
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<DashboardStats>({
    properties: 124,
    projects: 32,
    clients: 38,
    transactions: 56,
    documents: 128,
    tasks: 15
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

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
            propertyName: 'Luxury Suite 1201',
            type: 'SALE',
            status: 'COMPLETED'
          },
          {
            id: 'trans2',
            amount: 25000,
            date: '2024-03-14T15:45:00Z',
            propertyId: 'prop2',
            propertyName: 'Skyline Tower 1501',
            type: 'RESERVATION',
            status: 'PENDING'
          },
          {
            id: 'trans3',
            amount: 50000,
            date: '2024-03-13T09:15:00Z',
            propertyId: 'prop3',
            propertyName: 'Villa 101',
            type: 'PAYMENT',
            status: 'COMPLETED'
          }
        ];
        
        setRecentTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
      }
    };
    
    // Fetch recent projects with financial data
    const fetchRecentProjects = async () => {
      try {
        // Mock data for projects
        const mockProjects = [
          {
            id: 'proj1',
            name: 'Riverfront Heights',
            type: 'Multi-Family',
            status: 'IN_PROGRESS',
            progress: 65,
            revenue: 2750000,
            budget: 3500000,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'proj2',
            name: 'Skyview Condos',
            type: 'Condominium',
            status: 'PLANNING',
            progress: 25,
            revenue: 450000,
            budget: 1850000,
            updatedAt: subDays(new Date(), 3).toISOString()
          },
          {
            id: 'proj3',
            name: 'Downtown Office Park',
            type: 'Commercial',
            status: 'COMPLETED',
            progress: 100,
            revenue: 4800000,
            budget: 4500000,
            updatedAt: subDays(new Date(), 15).toISOString()
          }
        ];
        
        setRecentProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      }
    };
    
    // Fetch project milestones
    const fetchProjectMilestones = async () => {
      try {
        // Mock data for project milestones
        const mockMilestones = [
          {
            id: 'ms1',
            projectId: 'proj1',
            projectName: 'Riverfront Heights',
            title: 'Land Acquisition',
            description: 'Complete purchase of land parcel',
            status: 'COMPLETED' as const,
            dueDate: subDays(new Date(), 60).toISOString(),
            completedAt: subDays(new Date(), 58).toISOString()
          },
          {
            id: 'ms2',
            projectId: 'proj1',
            projectName: 'Riverfront Heights',
            title: 'Permits Approval',
            description: 'Obtain all necessary building permits',
            status: 'COMPLETED' as const,
            dueDate: subDays(new Date(), 30).toISOString(),
            completedAt: subDays(new Date(), 28).toISOString()
          },
          {
            id: 'ms3',
            projectId: 'proj1',
            projectName: 'Riverfront Heights',
            title: 'Foundation Construction',
            description: 'Complete foundation and basement',
            status: 'IN_PROGRESS' as const,
            dueDate: subDays(new Date(), -5).toISOString()
          },
          {
            id: 'ms4',
            projectId: 'proj2',
            projectName: 'Skyview Condos',
            title: 'Zoning Approval',
            description: 'Get zoning variances approved',
            status: 'IN_PROGRESS' as const,
            dueDate: subDays(new Date(), -10).toISOString()
          },
          {
            id: 'ms5',
            projectId: 'proj3',
            projectName: 'Downtown Office Park',
            title: 'Final Inspection',
            description: 'Complete final building inspection',
            status: 'COMPLETED' as const,
            dueDate: subDays(new Date(), 20).toISOString(),
            completedAt: subDays(new Date(), 22).toISOString()
          }
        ];
        
        setProjectMilestones(mockMilestones);
      } catch (error) {
        console.error('Error fetching project milestones:', error);
      }
    };

    fetchRecentTransactions();
    fetchRecentProjects();
    fetchProjectMilestones();
  }, []);

  // Calculate revenue and budget data
  const revenueData = recentProjects.reduce(
    (acc, project) => ({
      revenue: acc.revenue + project.revenue,
      budget: acc.budget + project.budget
    }),
    { revenue: 0, budget: 0 }
  );
  
  // Format the revenue percentage
  const revenuePercentage = Math.round((revenueData.revenue / revenueData.budget) * 100);
  
  // Prepare monthly revenue chart data
  const getMonthlyRevenueData = () => {
    // Mock monthly revenue data for the past 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return format(date, 'MMM');
    }).reverse();
    
    return {
      options: {
        chart: {
          id: 'monthly-revenue',
          toolbar: {
            show: false
          }
        },
        xaxis: {
          categories: months
        },
        colors: ['#6366F1', '#A855F7'],
        stroke: {
          curve: 'smooth',
          width: 2
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right'
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },
      series: [
        {
          name: 'Revenue',
          data: [150000, 220000, 310000, 480000, 520000, 710000]
        },
        {
          name: 'Expenses',
          data: [120000, 180000, 250000, 350000, 420000, 550000]
        }
      ]
    };
  };
  
  // Prepare project status chart data
  const getProjectStatusData = () => {
    const statusCounts = {
      'PLANNING': 0,
      'IN_PROGRESS': 0, 
      'COMPLETED': 0,
      'ON_HOLD': 0
    };
    
    recentProjects.forEach(project => {
      if (statusCounts.hasOwnProperty(project.status)) {
        statusCounts[project.status as keyof typeof statusCounts]++;
      }
    });
    
    return {
      options: {
        chart: {
          id: 'project-status',
          type: 'donut',
        },
        labels: ['Planning', 'In Progress', 'Completed', 'On Hold'],
        colors: ['#60A5FA', '#FBBF24', '#34D399', '#F87171'],
        legend: {
          position: 'bottom'
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              height: 250
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },
      series: [
        statusCounts.PLANNING,
        statusCounts.IN_PROGRESS,
        statusCounts.COMPLETED,
        statusCounts.ON_HOLD
      ]
    };
  };

  // Helper function to get milestone status color
  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'UPCOMING':
        return 'bg-gray-100 text-gray-800';
      case 'DELAYED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your real estate projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Link href="/dashboard/properties" className="transform transition-all hover:scale-105">
          <div className="bg-blue-50 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-600">Properties</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.properties}</p>
              </div>
              <FaBuilding className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/projects" className="transform transition-all hover:scale-105">
          <div className="bg-purple-50 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-600">Active Projects</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{stats.projects}</p>
              </div>
              <FaChartLine className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/clients" className="transform transition-all hover:scale-105">
          <div className="bg-green-50 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-600">Active Clients</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.clients}</p>
              </div>
              <FaUsers className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/transactions" className="transform transition-all hover:scale-105">
          <div className="bg-yellow-50 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-600">Transactions</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-900">{stats.transactions}</p>
              </div>
              <FaExchangeAlt className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/documents" className="transform transition-all hover:scale-105">
          <div className="bg-red-50 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-red-600">Documents</p>
                <p className="text-xl sm:text-2xl font-bold text-red-900">{stats.documents}</p>
              </div>
              <FaFileAlt className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/tasks" className="transform transition-all hover:scale-105">
          <div className="bg-indigo-50 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-indigo-600">Tasks Due</p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-900">{stats.tasks}</p>
              </div>
              <FaTasks className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" />
            </div>
          </div>
        </Link>
      </div>

      {/* Revenue Overview */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
          <div className="text-sm text-gray-500">
            Total Budget: ${revenueData.budget.toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div className="bg-indigo-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base font-medium text-indigo-700 mb-2">Current Revenue</h3>
              <div className="flex items-end">
                <span className="text-2xl sm:text-3xl font-bold text-indigo-900">
                  ${revenueData.revenue.toLocaleString()}
                </span>
                <span className={`ml-2 text-sm font-medium px-2 py-1 rounded-full ${revenuePercentage >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {revenuePercentage}% of budget
                </span>
              </div>
              
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {revenuePercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div 
                      style={{ width: `${revenuePercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {isClient && (
              <div className="h-64 sm:h-72">
                <Chart
                  options={getMonthlyRevenueData().options}
                  series={getMonthlyRevenueData().series}
                  type="line"
                  height="100%"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Project Status and Milestone Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Project Status Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Status</h2>
          </div>
          {isClient && (
            <div className="h-64">
              <Chart
                options={getProjectStatusData().options}
                series={getProjectStatusData().series}
                type="donut"
                height="100%"
              />
            </div>
          )}
        </div>
        
        {/* Project Milestones */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Milestones</h2>
            <Link href="/dashboard/projects" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <div className="align-middle inline-block min-w-full">
                <div className="overflow-hidden border-b border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Milestone
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Project
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projectMilestones.slice(0, 4).map((milestone) => (
                        <tr key={milestone.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                                <FaFlag className="h-4 w-4" />
                              </div>
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {milestone.title}
                                </div>
                                <div className="text-xs text-gray-500 hidden sm:block">
                                  {milestone.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">{milestone.projectName}</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMilestoneStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <div className="flex items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <span className="flex items-center text-xs text-gray-600">
                        <FaBuilding className="mr-1 h-3 w-3 text-gray-400" />
                        {project.type}
                      </span>
                      <span className="flex items-center text-xs text-gray-600">
                        <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                        Updated {format(new Date(project.updatedAt), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {project.status.replace('_', ' ')}
                    </span>
                    <div className="flex flex-col items-end mt-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{project.progress}% complete</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <Link key={transaction.id} href={`/dashboard/transactions/${transaction.id}`}>
                <div className="flex items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">
                      ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <span className="flex items-center text-xs text-gray-600">
                        <FaMapMarkerAlt className="mr-1 h-3 w-3 text-gray-400" />
                        {transaction.propertyName}
                      </span>
                      <span className="flex items-center text-xs text-gray-600">
                        <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                        {format(new Date(transaction.date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.type}
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
} 