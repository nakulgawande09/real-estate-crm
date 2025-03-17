'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaPlus, FaSearch, FaFilter, FaBuilding, FaProjectDiagram, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { ProjectStatus, PropertyType } from '@/lib/enums';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVirtualizer } from '@tanstack/react-virtual';
import { use } from 'react';

export const runtime = 'edge';

interface Project {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: string;
  propertyType: string;
  totalBudget: number;
  acquisitionDate?: string;
  startDate?: string;
  createdAt: string;
}

// Skeleton loader component for the project list
const ProjectSkeletonLoader = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="space-y-4 p-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-7 gap-4">
          <div className="col-span-2">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="col-span-1">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="col-span-1">
            <div className="h-5 bg-gray-200 rounded-full w-20 mx-auto"></div>
          </div>
          <div className="col-span-1">
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
          <div className="col-span-1">
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>
          <div className="col-span-1">
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Empty state component
const EmptyStateProjects = ({ hasFilters, onCreate }: { hasFilters: boolean; onCreate: () => void }) => (
  <div className="bg-white rounded-lg shadow-md p-8 text-center">
    <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
      <FaProjectDiagram className="h-12 w-12 text-indigo-500" />
    </div>
    <h3 className="text-xl font-semibold mb-2">No projects found</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your search or filters to find what you\'re looking for'
        : 'Create your first real estate project to start tracking properties, financials, and more'}
    </p>
    <button
      onClick={onCreate}
      className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md transition-colors shadow-sm"
    >
      <FaPlus className="mr-2" /> Create Project
    </button>
  </div>
);

// ProjectCard component
const ProjectCard = ({ project, formatCurrency }: { project: Project; formatCurrency: (amount: number) => string }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow p-1 mb-4">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{project.description}</p>
            
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center text-sm text-gray-600">
                <FaMapMarkerAlt className="mr-1 text-gray-400" />
                <span>{project.location.city}, {project.location.state}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <FaBuilding className="mr-1 text-gray-400" />
                <span>{project.propertyType.replace('_', ' ')}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <FaDollarSign className="mr-1 text-gray-400" />
                <span>{formatCurrency(project.totalBudget)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <FaCalendarAlt className="mr-1 text-gray-400" />
                <span>
                  {(project.acquisitionDate || project.startDate) ? 
                    format(new Date(project.acquisitionDate || project.startDate), 'MMM d, yyyy') 
                    : 'Not set'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="ml-4 flex flex-col items-end">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
            
            <div className="mt-3 space-x-2 flex">
              <Link
                href={`/dashboard/projects/${project._id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
              >
                View
              </Link>
              <Link
                href={`/dashboard/projects/${project._id}/edit`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ProjectsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInputValue, setSearchInputValue] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState(searchParams.get('propertyType') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Memoize the fetchProjects function to avoid recreation on each render
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (propertyTypeFilter) params.append('propertyType', propertyTypeFilter);
      params.append('page', page.toString());
      params.append('limit', '10');

      // Use AbortController for request cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`/api/projects?${params.toString()}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache' // Ensure fresh data
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data.projects);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, propertyTypeFilter, page]);

  // Debounce search to avoid too many requests
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== searchInputValue) {
        setSearch(searchInputValue);
        setPage(1);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status, page, statusFilter, propertyTypeFilter, search, fetchProjects]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInputValue);
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const navigateToCreateProject = () => {
    router.push('/dashboard/projects/create');
  };

  // Determine if we have any filters active
  const hasActiveFilters = useMemo(() => {
    return Boolean(search || statusFilter || propertyTypeFilter);
  }, [search, statusFilter, propertyTypeFilter]);

  if (status === 'loading') {
    return <ProjectSkeletonLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real Estate Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your development projects
          </p>
        </div>
        <Link
          href="/dashboard/projects/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center shadow-sm"
        >
          <FaPlus className="mr-2" /> New Project
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-indigo-500 text-white p-1 rounded-md hover:bg-indigo-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Status Filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              <select
                className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilterChange();
                }}
              >
                <option value="">All Statuses</option>
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Property Type Filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              <select
                className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={propertyTypeFilter}
                onChange={(e) => {
                  setPropertyTypeFilter(e.target.value);
                  handleFilterChange();
                }}
              >
                <option value="">All Property Types</option>
                {Object.values(PropertyType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <FaBuilding className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex">
            <button
              className={`px-3 py-2 border-t border-l border-b rounded-l-md ${
                viewMode === 'card' 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-300' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('card')}
            >
              Cards
            </button>
            <button
              className={`px-3 py-2 border rounded-r-md ${
                viewMode === 'table' 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-300' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <ProjectSkeletonLoader />
      ) : !projects || projects.length === 0 ? (
        <EmptyStateProjects hasFilters={hasActiveFilters} onCreate={navigateToCreateProject} />
      ) : viewMode === 'card' ? (
        <div className="space-y-4">
          {projects.map(project => (
            <ProjectCard key={project._id} project={project} formatCurrency={formatCurrency} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{project.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{project.location.city}, {project.location.state}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{project.location.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {project.propertyType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        project.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'ON_HOLD' ? 'bg-orange-100 text-orange-800' :
                        project.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(project.totalBudget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(project.acquisitionDate || project.startDate) ? 
                        format(new Date(project.acquisitionDate || project.startDate), 'MMM d, yyyy') 
                        : 'Not set'
                      }
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/projects/${project._id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/projects/${project._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaChevronLeft className="mr-1 h-3 w-3" /> Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next <FaChevronRight className="ml-1 h-3 w-3" />
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <FaChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <FaChevronRight className="h-3 w-3" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  );
} 