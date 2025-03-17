'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { PropertyType, ProjectStatus } from '@/lib/enums';

// Define the form input types
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
  notes?: string;
}

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Initialize the form
  const { 
    register, 
    handleSubmit, 
    control,
    watch,
    setValue,
    formState: { errors } 
  } = useForm<ProjectFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      location: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      propertyType: PropertyType.RESIDENTIAL,
      status: ProjectStatus.PLANNING,
      acquisitionDate: new Date().toISOString().split('T')[0],
      totalBudget: 0,
      costBreakdown: {
        land: 0,
        construction: 0,
        permits: 0,
        marketing: 0,
        legal: 0,
        financing: 0,
        other: 0
      },
      projectManager: '',
      notes: ''
    }
  });
  
  // Watch cost breakdown fields to calculate total
  const costBreakdown = watch('costBreakdown');
  
  // Calculate total budget based on cost breakdown
  const calculateTotalBudget = () => {
    const total = Object.values(costBreakdown).reduce((sum, cost) => sum + (Number(cost) || 0), 0);
    setValue('totalBudget', total);
    return total;
  };
  
  // Form submission handler
  const onSubmit: SubmitHandler<ProjectFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project');
      }
      
      // Navigate to the newly created project
      router.push(`/dashboard/projects/${result._id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the project');
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard/projects"
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information Section */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Project Name*
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                    {...register('name', { required: 'Project name is required' })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700">
                    Acquisition Date*
                  </label>
                  <input
                    id="acquisitionDate"
                    type="date"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.acquisitionDate ? 'border-red-500' : ''}`}
                    {...register('acquisitionDate', { required: 'Acquisition date is required' })}
                  />
                  {errors.acquisitionDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.acquisitionDate.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                    Property Type*
                  </label>
                  <select
                    id="propertyType"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.propertyType ? 'border-red-500' : ''}`}
                    {...register('propertyType', { required: 'Property type is required' })}
                  >
                    {Object.values(PropertyType).map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType && (
                    <p className="mt-1 text-sm text-red-500">{errors.propertyType.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status*
                  </label>
                  <select
                    id="status"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.status ? 'border-red-500' : ''}`}
                    {...register('status', { required: 'Status is required' })}
                  >
                    {Object.values(ProjectStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description*
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.description ? 'border-red-500' : ''}`}
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
            
            {/* Location Section */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Location</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                    Address*
                  </label>
                  <input
                    id="location.address"
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.location?.address ? 'border-red-500' : ''}`}
                    {...register('location.address', { required: 'Address is required' })}
                  />
                  {errors.location?.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.location.address.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                    City*
                  </label>
                  <input
                    id="location.city"
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.location?.city ? 'border-red-500' : ''}`}
                    {...register('location.city', { required: 'City is required' })}
                  />
                  {errors.location?.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.location.city.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
                    State*
                  </label>
                  <input
                    id="location.state"
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.location?.state ? 'border-red-500' : ''}`}
                    {...register('location.state', { required: 'State is required' })}
                  />
                  {errors.location?.state && (
                    <p className="mt-1 text-sm text-red-500">{errors.location.state.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="location.zipCode" className="block text-sm font-medium text-gray-700">
                    Zip Code*
                  </label>
                  <input
                    id="location.zipCode"
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.location?.zipCode ? 'border-red-500' : ''}`}
                    {...register('location.zipCode', { required: 'Zip code is required' })}
                  />
                  {errors.location?.zipCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.location.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Cost Breakdown Section */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Cost Breakdown</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="costBreakdown.land" className="block text-sm font-medium text-gray-700">
                    Land
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Controller
                      name="costBreakdown.land"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0"
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotalBudget();
                          }}
                          value={field.value}
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="costBreakdown.construction" className="block text-sm font-medium text-gray-700">
                    Construction
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Controller
                      name="costBreakdown.construction"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0"
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotalBudget();
                          }}
                          value={field.value}
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="costBreakdown.permits" className="block text-sm font-medium text-gray-700">
                    Permits
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Controller
                      name="costBreakdown.permits"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0"
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotalBudget();
                          }}
                          value={field.value}
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="costBreakdown.marketing" className="block text-sm font-medium text-gray-700">
                    Marketing
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Controller
                      name="costBreakdown.marketing"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0"
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotalBudget();
                          }}
                          value={field.value}
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="costBreakdown.legal" className="block text-sm font-medium text-gray-700">
                    Legal
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Controller
                      name="costBreakdown.legal"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0"
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotalBudget();
                          }}
                          value={field.value}
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="costBreakdown.financing" className="block text-sm font-medium text-gray-700">
                    Financing
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Controller
                      name="costBreakdown.financing"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0"
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotalBudget();
                          }}
                          value={field.value}
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="costBreakdown.other" className="block text-sm font-medium text-gray-700">
                    Other
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Controller
                      name="costBreakdown.other"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0"
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotalBudget();
                          }}
                          value={field.value}
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-900">Total Budget</h3>
                  <p className="text-lg font-bold text-indigo-600">
                    ${watch('totalBudget').toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="estimatedCompletionDate" className="block text-sm font-medium text-gray-700">
                    Estimated Completion Date
                  </label>
                  <input
                    id="estimatedCompletionDate"
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    {...register('estimatedCompletionDate')}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="projectManager" className="block text-sm font-medium text-gray-700">
                    Project Manager*
                  </label>
                  <input
                    id="projectManager"
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.projectManager ? 'border-red-500' : ''}`}
                    {...register('projectManager', { required: 'Project manager is required' })}
                  />
                  {errors.projectManager && (
                    <p className="mt-1 text-sm text-red-500">{errors.projectManager.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...register('notes')}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaTimes className="mr-2" /> Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 