'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { 
  FaArrowLeft, 
  FaSave, 
  FaSpinner,
  FaExclamationTriangle 
} from 'react-icons/fa';
import { PropertyType, ProjectStatus } from '@/lib/enums';

// Define form input types
interface ProjectFormInputs {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  propertyType: PropertyType;
  status: ProjectStatus;
  acquisitionDate: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  totalBudget: number;
  costBreakdown: {
    land: number;
    construction: number;
    permits: number;
    marketing: number;
    legal: number;
    financing: number;
    other: number;
  };
  projectManager: string;
  team?: string[];
  clients?: string[];
  notes?: string;
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [clients, setClients] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  
  const router = useRouter();
  const { id } = params;
  
  const { 
    control, 
    register, 
    handleSubmit, 
    reset, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<ProjectFormInputs>();
  
  const costBreakdown = watch('costBreakdown');
  
  useEffect(() => {
    const calculateTotalBudget = () => {
      if (!costBreakdown) return;
      
      const total = 
        (costBreakdown.land || 0) +
        (costBreakdown.construction || 0) +
        (costBreakdown.permits || 0) +
        (costBreakdown.marketing || 0) +
        (costBreakdown.legal || 0) +
        (costBreakdown.financing || 0) +
        (costBreakdown.other || 0);
      
      setValue('totalBudget', total);
    };
    
    calculateTotalBudget();
  }, [costBreakdown, setValue]);
  
  // Fetch project data, users and clients
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch project data
        const projectResponse = await fetch(`/api/projects/${id}`);
        
        if (!projectResponse.ok) {
          if (projectResponse.status === 404) {
            throw new Error('Project not found');
          }
          throw new Error('Failed to fetch project details');
        }
        
        const projectData = await projectResponse.json();
        
        // Format dates for form inputs
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        // Map project data to form values
        const formData: ProjectFormInputs = {
          name: projectData.name,
          description: projectData.description,
          location: projectData.location,
          propertyType: projectData.propertyType,
          status: projectData.status,
          acquisitionDate: formatDateForInput(projectData.acquisitionDate),
          estimatedCompletionDate: formatDateForInput(projectData.estimatedCompletionDate || ''),
          actualCompletionDate: formatDateForInput(projectData.actualCompletionDate || ''),
          totalBudget: projectData.totalBudget,
          costBreakdown: projectData.costBreakdown,
          projectManager: projectData.projectManager?._id || '',
          team: projectData.team?.map(member => member._id) || [],
          clients: projectData.clients?.map(client => client._id) || [],
          notes: projectData.notes || ''
        };
        
        // Reset form with project data
        reset(formData);
        
        // Fetch users for project manager and team selection
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
        // Fetch clients
        const clientsResponse = await fetch('/api/clients');
        if (!clientsResponse.ok) {
          throw new Error('Failed to fetch clients');
        }
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, reset]);
  
  const onSubmit = async (data: ProjectFormInputs) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }
      
      router.push(`/dashboard/projects/${id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the project');
      setSubmitting(false);
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
                href={`/dashboard/projects/${id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaArrowLeft className="mr-2" />
                Back to Project Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <Link
          href={`/dashboard/projects/${id}`}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  There was an error with your submission
                </h3>
                <p className="mt-2 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Basic Information Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-6">
            <div className="md:col-span-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name*
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Project name is required' })}
                className={`mt-1 block w-full rounded-md ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div className="md:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description*
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description', { required: 'Description is required' })}
                className={`mt-1 block w-full rounded-md ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            <div className="md:col-span-3">
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                Property Type*
              </label>
              <select
                id="propertyType"
                {...register('propertyType', { required: 'Property type is required' })}
                className={`mt-1 block w-full rounded-md ${errors.propertyType ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              >
                {Object.values(PropertyType).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
              {errors.propertyType && (
                <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
              )}
            </div>
            
            <div className="md:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                id="status"
                {...register('status', { required: 'Status is required' })}
                className={`mt-1 block w-full rounded-md ${errors.status ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              >
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700">
                Acquisition Date*
              </label>
              <input
                type="date"
                id="acquisitionDate"
                {...register('acquisitionDate', { required: 'Acquisition date is required' })}
                className={`mt-1 block w-full rounded-md ${errors.acquisitionDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              />
              {errors.acquisitionDate && (
                <p className="mt-1 text-sm text-red-600">{errors.acquisitionDate.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="estimatedCompletionDate" className="block text-sm font-medium text-gray-700">
                Estimated Completion Date
              </label>
              <input
                type="date"
                id="estimatedCompletionDate"
                {...register('estimatedCompletionDate')}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm sm:text-sm"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="actualCompletionDate" className="block text-sm font-medium text-gray-700">
                Actual Completion Date
              </label>
              <input
                type="date"
                id="actualCompletionDate"
                {...register('actualCompletionDate')}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Location Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Location</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-6">
            <div className="md:col-span-6">
              <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                Address*
              </label>
              <input
                type="text"
                id="location.address"
                {...register('location.address', { required: 'Address is required' })}
                className={`mt-1 block w-full rounded-md ${errors.location?.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              />
              {errors.location?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
              )}
            </div>
            
            <div className="md:col-span-3">
              <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                City*
              </label>
              <input
                type="text"
                id="location.city"
                {...register('location.city', { required: 'City is required' })}
                className={`mt-1 block w-full rounded-md ${errors.location?.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              />
              {errors.location?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
              )}
            </div>
            
            <div className="md:col-span-3">
              <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
                State/Province*
              </label>
              <input
                type="text"
                id="location.state"
                {...register('location.state', { required: 'State is required' })}
                className={`mt-1 block w-full rounded-md ${errors.location?.state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              />
              {errors.location?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="location.zipCode" className="block text-sm font-medium text-gray-700">
                Zip/Postal Code*
              </label>
              <input
                type="text"
                id="location.zipCode"
                {...register('location.zipCode', { required: 'Zip code is required' })}
                className={`mt-1 block w-full rounded-md ${errors.location?.zipCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              />
              {errors.location?.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.location.zipCode.message}</p>
              )}
            </div>
            
            <div className="md:col-span-4">
              <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
                Country*
              </label>
              <input
                type="text"
                id="location.country"
                {...register('location.country', { required: 'Country is required' })}
                className={`mt-1 block w-full rounded-md ${errors.location?.country ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} shadow-sm sm:text-sm`}
              />
              {errors.location?.country && (
                <p className="mt-1 text-sm text-red-600">{errors.location.country.message}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Cost Breakdown Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Cost Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="mb-6 bg-indigo-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium text-indigo-900">Total Budget</h3>
                <p className="text-2xl font-bold text-indigo-600">
                  ${watch('totalBudget', 0).toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-indigo-700 mt-1">
                The total budget is calculated automatically from the cost breakdown below
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-3">
              <div>
                <label htmlFor="costBreakdown.land" className="block text-sm font-medium text-gray-700">
                  Land Cost
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    id="costBreakdown.land"
                    {...register('costBreakdown.land', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                {errors.costBreakdown?.land && (
                  <p className="mt-1 text-sm text-red-600">{errors.costBreakdown.land.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="costBreakdown.construction" className="block text-sm font-medium text-gray-700">
                  Construction Cost
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    id="costBreakdown.construction"
                    {...register('costBreakdown.construction', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                {errors.costBreakdown?.construction && (
                  <p className="mt-1 text-sm text-red-600">{errors.costBreakdown.construction.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="costBreakdown.permits" className="block text-sm font-medium text-gray-700">
                  Permits Cost
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    id="costBreakdown.permits"
                    {...register('costBreakdown.permits', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                {errors.costBreakdown?.permits && (
                  <p className="mt-1 text-sm text-red-600">{errors.costBreakdown.permits.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="costBreakdown.marketing" className="block text-sm font-medium text-gray-700">
                  Marketing Cost
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    id="costBreakdown.marketing"
                    {...register('costBreakdown.marketing', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                {errors.costBreakdown?.marketing && (
                  <p className="mt-1 text-sm text-red-600">{errors.costBreakdown.marketing.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="costBreakdown.legal" className="block text-sm font-medium text-gray-700">
                  Legal Cost
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    id="costBreakdown.legal"
                    {...register('costBreakdown.legal', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                {errors.costBreakdown?.legal && (
                  <p className="mt-1 text-sm text-red-600">{errors.costBreakdown.legal.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="costBreakdown.financing" className="block text-sm font-medium text-gray-700">
                  Financing Cost
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    id="costBreakdown.financing"
                    {...register('costBreakdown.financing', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                {errors.costBreakdown?.financing && (
                  <p className="mt-1 text-sm text-red-600">{errors.costBreakdown.financing.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="costBreakdown.other" className="block text-sm font-medium text-gray-700">
                  Other Costs
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    id="costBreakdown.other"
                    {...register('costBreakdown.other', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                {errors.costBreakdown?.other && (
                  <p className="mt-1 text-sm text-red-600">{errors.costBreakdown.other.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Information Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-6">
            <div className="md:col-span-3">
              <label htmlFor="projectManager" className="block text-sm font-medium text-gray-700">
                Project Manager
              </label>
              <select
                id="projectManager"
                {...register('projectManager')}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm sm:text-sm"
              >
                <option value="">Select a project manager</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                Team Members
              </label>
              <Controller
                name="team"
                control={control}
                render={({ field }) => (
                  <select
                    id="team"
                    multiple
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm sm:text-sm"
                    value={field.value}
                    onChange={(e) => {
                      const options = e.target.options;
                      const values = [];
                      for (let i = 0; i < options.length; i++) {
                        if (options[i].selected) {
                          values.push(options[i].value);
                        }
                      }
                      field.onChange(values);
                    }}
                  >
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              />
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl or Cmd to select multiple team members</p>
            </div>
            
            <div className="md:col-span-6">
              <label htmlFor="clients" className="block text-sm font-medium text-gray-700">
                Associated Clients
              </label>
              <Controller
                name="clients"
                control={control}
                render={({ field }) => (
                  <select
                    id="clients"
                    multiple
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm sm:text-sm"
                    value={field.value}
                    onChange={(e) => {
                      const options = e.target.options;
                      const values = [];
                      for (let i = 0; i < options.length; i++) {
                        if (options[i].selected) {
                          values.push(options[i].value);
                        }
                      }
                      field.onChange(values);
                    }}
                  >
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                )}
              />
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl or Cmd to select multiple clients</p>
            </div>
            
            <div className="md:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                {...register('notes')}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href={`/dashboard/projects/${id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 