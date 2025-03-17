'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaBuilding, 
  FaCalendarAlt, 
  FaUser, 
  FaDollarSign,
  FaMapMarkerAlt,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import { PropertyType, ProjectStatus } from '@/lib/enums';

// Define project interface
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
  propertyType: string;
  status: string;
  acquisitionDate: string;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
  financialSummary?: {
    totalInvestments: number;
    totalLoans: number;
    totalExpenses: number;
    totalRevenue: number;
    netIncome: number;
    roi: number;
  };
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const router = useRouter();
  const { id } = params;
  
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/projects/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found');
          }
          throw new Error('Failed to fetch project details');
        }
        
        const data = await response.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching project details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusColor = (status: ProjectStatus) => {
    const statusColors: Record<ProjectStatus, string> = {
      [ProjectStatus.PLANNING]: 'bg-blue-100 text-blue-800',
      [ProjectStatus.ACQUISITION]: 'bg-purple-100 text-purple-800',
      [ProjectStatus.DEVELOPMENT]: 'bg-yellow-100 text-yellow-800',
      [ProjectStatus.MARKETING]: 'bg-green-100 text-green-800',
      [ProjectStatus.SOLD]: 'bg-indigo-100 text-indigo-800',
      [ProjectStatus.COMPLETED]: 'bg-teal-100 text-teal-800',
      [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };
  
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      router.push('/dashboard/projects');
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the project');
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md flex items-start">
          <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <div className="mt-3">
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaArrowLeft className="mr-2" />
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 p-4 rounded-md flex items-start">
          <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Project Not Found</h3>
            <p className="mt-1 text-sm text-yellow-700">The project you're looking for doesn't exist or has been deleted.</p>
            <div className="mt-3">
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaArrowLeft className="mr-2" />
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link
            href="/dashboard/projects"
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <span className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status as ProjectStatus)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/projects/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaEdit className="mr-2" />
            Edit
          </Link>
          
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              confirmDelete 
                ? 'text-white bg-red-600 hover:bg-red-700' 
                : 'text-red-700 bg-red-100 hover:bg-red-200'
            } ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {deleteLoading ? (
              <FaSpinner className="animate-spin h-5 w-5" />
            ) : (
              <>
                <FaTrash className="mr-2" />
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Project Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{project.description}</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {project.location.address}<br />
                {project.location.city}, {project.location.state} {project.location.zipCode}<br />
                {project.location.country}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Property Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{project.propertyType}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status as ProjectStatus)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Acquisition Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(project.acquisitionDate)}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Total Budget</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(project.totalBudget)}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(project.createdAt)}</dd>
            </div>
          </dl>
        </div>
        
        {project.financialSummary && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Financial Summary</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Total Investments</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(project.financialSummary.totalInvestments)}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Total Loans</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(project.financialSummary.totalLoans)}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Total Expenses</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(project.financialSummary.totalExpenses)}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Total Revenue</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(project.financialSummary.totalRevenue)}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Net Income</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(project.financialSummary.netIncome)}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">ROI</dt>
                  <dd className="mt-1 text-sm text-gray-900">{project.financialSummary.roi.toFixed(2)}%</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 