'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  FaArrowLeft, 
  FaSave, 
  FaTimesCircle,
  FaUserTie,
  FaPercent,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';
import { InvestmentType, InvestorType } from '@/lib/enums';

// Form validation schema
const investmentSchema = z.object({
  investorName: z.string().nonempty('Investor name is required'),
  investorType: z.enum([
    InvestorType.INDIVIDUAL, 
    InvestorType.COMPANY, 
    InvestorType.TRUST, 
    InvestorType.FAMILY_OFFICE
  ], {
    required_error: 'Investor type is required',
  }),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  equityPercentage: z.coerce.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100'),
  investmentDate: z.string().nonempty('Investment date is required'),
  expectedROI: z.coerce.number().min(0, 'Expected ROI cannot be negative'),
  type: z.enum([
    InvestmentType.EQUITY,
    InvestmentType.PREFERRED_EQUITY,
    InvestmentType.SILENT_PARTNER,
    InvestmentType.JOINT_VENTURE,
    InvestmentType.SYNDICATION
  ], {
    required_error: 'Investment type is required',
  }),
  notes: z.string().optional(),
  investorEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  investorPhone: z.string().optional(),
  investmentTermMonths: z.coerce.number().min(0, 'Term cannot be negative').optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export default function NewInvestment() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      investmentDate: new Date().toISOString().split('T')[0],
      type: InvestmentType.EQUITY,
      investorType: InvestorType.INDIVIDUAL,
      equityPercentage: 0,
      expectedROI: 10,
      investmentTermMonths: 60, // 5 years default
    }
  });
  
  // Watch the investment amount to calculate expected returns
  const watchAmount = watch('amount');
  const watchExpectedROI = watch('expectedROI');
  const watchEquityPercentage = watch('equityPercentage');
  const watchType = watch('type');
  
  // Calculate expected returns
  const calculateExpectedReturns = () => {
    if (!watchAmount || !watchExpectedROI) return '$0.00';
    
    const amount = parseFloat(watchAmount.toString());
    const roi = parseFloat(watchExpectedROI.toString()) / 100;
    
    const returns = amount * roi;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(returns);
  };
  
  const onSubmit = async (data: InvestmentFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/investments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create investment');
      }
      
      const result = await response.json();
      
      toast.success('Investment created successfully');
      router.push(`/dashboard/projects/${projectId}/financial`);
    } catch (error: any) {
      console.error('Error creating investment:', error);
      toast.error(error.message || 'Failed to create investment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link 
          href={`/dashboard/projects/${projectId}/financial`}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Investment</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Investment Type */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.values(InvestmentType).map((type) => (
                    <div 
                      key={type}
                      className={`
                        flex items-center justify-center p-3 rounded-md cursor-pointer border
                        ${watchType === type 
                          ? 'bg-green-50 border-green-500 ring-2 ring-green-200' 
                          : 'border-gray-300 hover:bg-gray-50'}
                      `}
                      onClick={() => setValue('type', type as InvestmentType)}
                    >
                      <div className="text-center">
                        <FaChartLine className="mx-auto h-5 w-5 mb-1 text-green-500" />
                        <span className="text-sm">
                          {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register('type')}
                />
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
              
              {/* Investor Name */}
              <div>
                <label htmlFor="investorName" className="block text-sm font-medium text-gray-700 mb-1">
                  Investor Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserTie className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="investorName"
                    type="text"
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.investorName ? 'border-red-300' : ''
                    }`}
                    placeholder="Full name or business name"
                    {...register('investorName')}
                  />
                </div>
                {errors.investorName && (
                  <p className="mt-1 text-sm text-red-600">{errors.investorName.message}</p>
                )}
              </div>
              
              {/* Investor Type */}
              <div>
                <label htmlFor="investorType" className="block text-sm font-medium text-gray-700 mb-1">
                  Investor Type
                </label>
                <select
                  id="investorType"
                  className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                    errors.investorType ? 'border-red-300' : ''
                  }`}
                  {...register('investorType')}
                >
                  {Object.values(InvestorType).map((type) => (
                    <option key={type} value={type}>
                      {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </option>
                  ))}
                </select>
                {errors.investorType && (
                  <p className="mt-1 text-sm text-red-600">{errors.investorType.message}</p>
                )}
              </div>
              
              {/* Investor Email */}
              <div>
                <label htmlFor="investorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Investor Email (Optional)
                </label>
                <input
                  id="investorEmail"
                  type="email"
                  className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                    errors.investorEmail ? 'border-red-300' : ''
                  }`}
                  placeholder="Email address"
                  {...register('investorEmail')}
                />
                {errors.investorEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.investorEmail.message}</p>
                )}
              </div>
              
              {/* Investor Phone */}
              <div>
                <label htmlFor="investorPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Investor Phone (Optional)
                </label>
                <input
                  id="investorPhone"
                  type="tel"
                  className="block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  placeholder="Phone number"
                  {...register('investorPhone')}
                />
              </div>
              
              {/* Investment Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Amount ($)
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                    errors.amount ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  {...register('amount')}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>
              
              {/* Equity Percentage */}
              <div>
                <label htmlFor="equityPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                  Equity Percentage (%)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="equityPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.equityPercentage ? 'border-red-300' : ''
                    }`}
                    placeholder="0.00"
                    {...register('equityPercentage')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaPercent className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.equityPercentage && (
                  <p className="mt-1 text-sm text-red-600">{errors.equityPercentage.message}</p>
                )}
              </div>
              
              {/* Investment Date */}
              <div>
                <label htmlFor="investmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Date
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="investmentDate"
                    type="date"
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.investmentDate ? 'border-red-300' : ''
                    }`}
                    {...register('investmentDate')}
                  />
                </div>
                {errors.investmentDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.investmentDate.message}</p>
                )}
              </div>
              
              {/* Expected ROI */}
              <div>
                <label htmlFor="expectedROI" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected ROI (%)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="expectedROI"
                    type="number"
                    step="0.1"
                    min="0"
                    className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.expectedROI ? 'border-red-300' : ''
                    }`}
                    placeholder="10.0"
                    {...register('expectedROI')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaPercent className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.expectedROI && (
                  <p className="mt-1 text-sm text-red-600">{errors.expectedROI.message}</p>
                )}
              </div>
              
              {/* Investment Term */}
              <div>
                <label htmlFor="investmentTermMonths" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Term (Months)
                </label>
                <input
                  id="investmentTermMonths"
                  type="number"
                  min="0"
                  className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                    errors.investmentTermMonths ? 'border-red-300' : ''
                  }`}
                  placeholder="60"
                  {...register('investmentTermMonths')}
                />
                {errors.investmentTermMonths && (
                  <p className="mt-1 text-sm text-red-600">{errors.investmentTermMonths.message}</p>
                )}
              </div>
              
              {/* Expected Returns (Calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Returns
                </label>
                <div className="block w-full rounded-md bg-gray-100 py-2 px-3 text-gray-700 text-sm">
                  {calculateExpectedReturns()} per year
                </div>
              </div>
              
              {/* Notes */}
              <div className="col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  placeholder="Any additional details about this investment"
                  {...register('notes')}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Link
                href={`/dashboard/projects/${projectId}/financial`}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaTimesCircle className="mr-2 h-5 w-5 text-gray-400" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaSave className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Saving...' : 'Save Investment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 