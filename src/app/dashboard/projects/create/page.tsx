'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FaSave, 
  FaTimes, 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaHome, 
  FaMapMarkerAlt 
} from 'react-icons/fa';
import Link from 'next/link';
import { PropertyType, ProjectStatus } from '@/lib/enums';

// Define the validation schema using Zod
const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  propertyType: z.nativeEnum(PropertyType, {
    errorMap: () => ({ message: 'Please select a valid property type' }),
  }),
  status: z.nativeEnum(ProjectStatus, {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  location: z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'Zip code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  acquisitionDate: z.string().min(1, 'Acquisition date is required'),
  estimatedCompletionDate: z.string().optional(),
  costBreakdown: z.object({
    land: z.number().min(0, 'Land cost cannot be negative'),
    construction: z.number().min(0, 'Construction cost cannot be negative'),
    permits: z.number().min(0, 'Permits cost cannot be negative'),
    marketing: z.number().min(0, 'Marketing cost cannot be negative'),
    legal: z.number().min(0, 'Legal cost cannot be negative'),
    financing: z.number().min(0, 'Financing cost cannot be negative'),
    other: z.number().min(0, 'Other costs cannot be negative'),
  }),
  financials: z.object({
    totalLoans: z.number().min(0, 'Total loans cannot be negative'),
    totalInvestments: z.number().min(0, 'Total investments cannot be negative'),
    directInvestments: z.number().min(0, 'Direct investments cannot be negative'),
  }),
  notes: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function CreateProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      propertyType: undefined,
      status: ProjectStatus.PLANNING,
      location: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      },
      acquisitionDate: new Date().toISOString().split('T')[0],
      estimatedCompletionDate: '',
      costBreakdown: {
        land: 0,
        construction: 0,
        permits: 0,
        marketing: 0,
        legal: 0,
        financing: 0,
        other: 0,
      },
      financials: {
        totalLoans: 0,
        totalInvestments: 0,
        directInvestments: 0,
      },
      notes: '',
    },
  });

  // Calculate total budget from cost breakdown
  const costBreakdown = watch('costBreakdown');
  const totalBudget = Object.values(costBreakdown).reduce((sum, cost) => sum + (cost || 0), 0);

  // Calculate total funding from financials
  const financials = watch('financials');
  const totalFunding = Object.values(financials).reduce((sum, amount) => sum + (amount || 0), 0);

  // Calculate funding gap
  const fundingGap = totalBudget - totalFunding;

  // Handle form submission
  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    if (status !== 'authenticated') {
      setServerError('You must be logged in to create a project');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project');
      }

      // Redirect to the project details page
      router.push(`/dashboard/projects/${result.project._id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setServerError(error.message || 'An error occurred while creating the project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Projects
        </Link>
        <h1 className="text-2xl font-bold mt-4">Create New Project</h1>
      </div>

      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaHome className="mr-2 text-blue-500" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name*
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full p-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type*
              </label>
              <Controller
                control={control}
                name="propertyType"
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full p-2 border rounded-md ${
                      errors.propertyType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Property Type</option>
                    {Object.values(PropertyType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.propertyType && (
                <p className="mt-1 text-xs text-red-500">{errors.propertyType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Status*
              </label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full p-2 border rounded-md ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {Object.values(ProjectStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.status && (
                <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acquisition Date*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    {...register('acquisitionDate')}
                    className={`w-full pl-10 p-2 border rounded-md ${
                      errors.acquisitionDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.acquisitionDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.acquisitionDate.message}</p>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Completion
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    {...register('estimatedCompletionDate')}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Description*
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className={`w-full p-2 border rounded-md ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" /> Location Details
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address*
              </label>
              <input
                type="text"
                {...register('location.address')}
                className={`w-full p-2 border rounded-md ${
                  errors.location?.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location?.address && (
                <p className="mt-1 text-xs text-red-500">{errors.location.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City*
              </label>
              <input
                type="text"
                {...register('location.city')}
                className={`w-full p-2 border rounded-md ${
                  errors.location?.city ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location?.city && (
                <p className="mt-1 text-xs text-red-500">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province*
              </label>
              <input
                type="text"
                {...register('location.state')}
                className={`w-full p-2 border rounded-md ${
                  errors.location?.state ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location?.state && (
                <p className="mt-1 text-xs text-red-500">{errors.location.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code*
              </label>
              <input
                type="text"
                {...register('location.zipCode')}
                className={`w-full p-2 border rounded-md ${
                  errors.location?.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location?.zipCode && (
                <p className="mt-1 text-xs text-red-500">{errors.location.zipCode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country*
              </label>
              <input
                type="text"
                {...register('location.country')}
                className={`w-full p-2 border rounded-md ${
                  errors.location?.country ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location?.country && (
                <p className="mt-1 text-xs text-red-500">{errors.location.country.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaMoneyBillWave className="mr-2 text-blue-500" /> Cost Breakdown
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Land Cost ($)
              </label>
              <Controller
                control={control}
                name="costBreakdown.land"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.costBreakdown?.land && (
                <p className="mt-1 text-xs text-red-500">{errors.costBreakdown.land.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Construction Cost ($)
              </label>
              <Controller
                control={control}
                name="costBreakdown.construction"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.costBreakdown?.construction && (
                <p className="mt-1 text-xs text-red-500">{errors.costBreakdown.construction.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permits & Fees ($)
              </label>
              <Controller
                control={control}
                name="costBreakdown.permits"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="100"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.costBreakdown?.permits && (
                <p className="mt-1 text-xs text-red-500">{errors.costBreakdown.permits.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marketing Cost ($)
              </label>
              <Controller
                control={control}
                name="costBreakdown.marketing"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="100"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.costBreakdown?.marketing && (
                <p className="mt-1 text-xs text-red-500">{errors.costBreakdown.marketing.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Legal Cost ($)
              </label>
              <Controller
                control={control}
                name="costBreakdown.legal"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="100"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.costBreakdown?.legal && (
                <p className="mt-1 text-xs text-red-500">{errors.costBreakdown.legal.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financing Cost ($)
              </label>
              <Controller
                control={control}
                name="costBreakdown.financing"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="100"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.costBreakdown?.financing && (
                <p className="mt-1 text-xs text-red-500">{errors.costBreakdown.financing.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Costs ($)
              </label>
              <Controller
                control={control}
                name="costBreakdown.other"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="100"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.costBreakdown?.other && (
                <p className="mt-1 text-xs text-red-500">{errors.costBreakdown.other.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium mb-2">Project Budget Summary</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Total Project Budget: <span className="font-semibold">${totalBudget.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaMoneyBillWave className="mr-2 text-blue-500" /> Project Funding
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Loans ($)
              </label>
              <Controller
                control={control}
                name="financials.totalLoans"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.financials?.totalLoans && (
                <p className="mt-1 text-xs text-red-500">{errors.financials.totalLoans.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Investments ($)
              </label>
              <Controller
                control={control}
                name="financials.totalInvestments"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.financials?.totalInvestments && (
                <p className="mt-1 text-xs text-red-500">{errors.financials.totalInvestments.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direct Investments ($)
              </label>
              <Controller
                control={control}
                name="financials.directInvestments"
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                )}
              />
              {errors.financials?.directInvestments && (
                <p className="mt-1 text-xs text-red-500">{errors.financials.directInvestments.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <div className={`p-4 rounded-md ${fundingGap > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <h3 className="text-md font-medium mb-2">Funding Summary</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Total Funding: <span className="font-semibold">${totalFunding.toLocaleString()}</span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Budget Gap: <span className={`font-semibold ${fundingGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(fundingGap).toLocaleString()} {fundingGap > 0 ? 'Shortfall' : 'Surplus'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="Any additional notes about the project..."
            className="w-full p-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>

        <div className="flex justify-between p-6">
          <Link
            href="/dashboard/projects"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md flex items-center"
          >
            <FaTimes className="mr-2" /> Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
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