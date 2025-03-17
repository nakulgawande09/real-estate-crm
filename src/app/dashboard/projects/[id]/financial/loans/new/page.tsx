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
  FaUniversity,
  FaPercentage,
  FaCalendarAlt,
  FaCreditCard
} from 'react-icons/fa';
import { LoanType, PaymentFrequency } from '@/lib/enums';

// Form validation schema
const loanSchema = z.object({
  lenderName: z.string().nonempty('Lender name is required'),
  amount: z.coerce.number().positive('Loan amount must be greater than 0'),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  startDate: z.string().nonempty('Start date is required'),
  endDate: z.string().nonempty('End date is required'),
  type: z.enum([
    LoanType.CONSTRUCTION,
    LoanType.MORTGAGE,
    LoanType.BRIDGE,
    LoanType.MEZZANINE,
    LoanType.HARD_MONEY,
    LoanType.PRIVATE
  ], {
    required_error: 'Loan type is required',
  }),
  paymentFrequency: z.enum([
    PaymentFrequency.MONTHLY,
    PaymentFrequency.QUARTERLY,
    PaymentFrequency.SEMI_ANNUALLY,
    PaymentFrequency.ANNUALLY,
    PaymentFrequency.BULLET
  ], {
    required_error: 'Payment frequency is required',
  }),
  loanNumber: z.string().optional(),
  lenderContactInfo: z.string().optional(),
  notes: z.string().optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

export default function NewLoan() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate loan term in months based on start and end date
  const [loanTermMonths, setLoanTermMonths] = useState<number>(0);
  
  // Initialize form with default values
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      type: LoanType.CONSTRUCTION,
      paymentFrequency: PaymentFrequency.MONTHLY,
      interestRate: 5.0,
    }
  });
  
  // Watch start and end date to calculate term
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  
  // Update loan term when dates change
  React.useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end >= start) {
        const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + 
                           (end.getMonth() - start.getMonth());
        setLoanTermMonths(diffInMonths);
      } else {
        setLoanTermMonths(0);
        // Optionally set end date to be after start date
        // setValue('endDate', new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString().split('T')[0]);
      }
    }
  }, [startDate, endDate, setValue]);
  
  // Calculate monthly payment for mortgage-type loans
  const calculateMonthlyPayment = () => {
    const amount = watch('amount') || 0;
    const interestRate = (watch('interestRate') || 0) / 100; // Convert to decimal
    const term = loanTermMonths;
    const paymentFrequency = watch('paymentFrequency');
    
    // If bullet payment, no regular payments
    if (paymentFrequency === PaymentFrequency.BULLET) {
      return 'Balloon payment at maturity';
    }
    
    // Payments per year based on frequency
    let paymentsPerYear = 12; // Default for monthly
    
    switch(paymentFrequency) {
      case PaymentFrequency.MONTHLY:
        paymentsPerYear = 12;
        break;
      case PaymentFrequency.QUARTERLY:
        paymentsPerYear = 4;
        break;
      case PaymentFrequency.SEMI_ANNUALLY:
        paymentsPerYear = 2;
        break;
      case PaymentFrequency.ANNUALLY:
        paymentsPerYear = 1;
        break;
    }
    
    // Total number of payments
    const totalPayments = (term / 12) * paymentsPerYear;
    
    // Interest rate per period
    const ratePerPeriod = interestRate / paymentsPerYear;
    
    if (interestRate === 0 || totalPayments === 0) {
      return amount > 0 ? 
        `$${(amount / totalPayments).toFixed(2)} per payment (principal only)` : 
        '$0.00';
    }
    
    // Calculate payment using formula: P = r*PV / (1 - (1+r)^-n)
    const payment = (ratePerPeriod * amount) / (1 - Math.pow(1 + ratePerPeriod, -totalPayments));
    
    return `$${payment.toFixed(2)} per ${paymentFrequency.toLowerCase().replace('_', ' ')} payment`;
  };
  
  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          loanTermMonths: loanTermMonths
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create loan');
      }
      
      const result = await response.json();
      
      toast.success('Loan created successfully');
      router.push(`/dashboard/projects/${projectId}/financial`);
    } catch (error: any) {
      console.error('Error creating loan:', error);
      toast.error(error.message || 'Failed to create loan');
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
        <h1 className="text-2xl font-bold text-gray-900">Add New Loan</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Type */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.values(LoanType).map((type) => (
                    <div 
                      key={type}
                      className={`
                        flex items-center justify-center p-3 rounded-md cursor-pointer border
                        ${watch('type') === type 
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-300 hover:bg-gray-50'}
                      `}
                      onClick={() => setValue('type', type as LoanType)}
                    >
                      <div className="text-center">
                        <FaCreditCard className="mx-auto h-5 w-5 mb-1 text-blue-500" />
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
              
              {/* Lender Name */}
              <div>
                <label htmlFor="lenderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Lender Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUniversity className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lenderName"
                    type="text"
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.lenderName ? 'border-red-300' : ''
                    }`}
                    placeholder="Bank or Lender Name"
                    {...register('lenderName')}
                  />
                </div>
                {errors.lenderName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lenderName.message}</p>
                )}
              </div>
              
              {/* Loan Number */}
              <div>
                <label htmlFor="loanNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Number (Optional)
                </label>
                <input
                  id="loanNumber"
                  type="text"
                  className="block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  placeholder="Reference or account number"
                  {...register('loanNumber')}
                />
              </div>
              
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount ($)
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
              
              {/* Interest Rate */}
              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.interestRate ? 'border-red-300' : ''
                    }`}
                    placeholder="5.0"
                    {...register('interestRate')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaPercentage className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.interestRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.interestRate.message}</p>
                )}
              </div>
              
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="startDate"
                    type="date"
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.startDate ? 'border-red-300' : ''
                    }`}
                    {...register('startDate')}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
              
              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="endDate"
                    type="date"
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                      errors.endDate ? 'border-red-300' : ''
                    }`}
                    {...register('endDate')}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
              
              {/* Loan Term (Calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term
                </label>
                <div className="block w-full rounded-md bg-gray-100 py-2 px-3 text-gray-700 text-sm">
                  {loanTermMonths > 0 ? (
                    <>
                      {loanTermMonths} months 
                      {loanTermMonths >= 12 ? ` (${(loanTermMonths / 12).toFixed(1)} years)` : ''}
                    </>
                  ) : (
                    <span className="text-red-500">Invalid dates (end date must be after start date)</span>
                  )}
                </div>
              </div>
              
              {/* Payment Frequency */}
              <div>
                <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Frequency
                </label>
                <select
                  id="paymentFrequency"
                  className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                    errors.paymentFrequency ? 'border-red-300' : ''
                  }`}
                  {...register('paymentFrequency')}
                >
                  {Object.values(PaymentFrequency).map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </option>
                  ))}
                </select>
                {errors.paymentFrequency && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentFrequency.message}</p>
                )}
              </div>
              
              {/* Estimated Payment (Calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Payment
                </label>
                <div className="block w-full rounded-md bg-gray-100 py-2 px-3 text-gray-700 text-sm">
                  {calculateMonthlyPayment()}
                </div>
              </div>
              
              {/* Lender Contact Info */}
              <div className="col-span-2">
                <label htmlFor="lenderContactInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  Lender Contact Information (Optional)
                </label>
                <textarea
                  id="lenderContactInfo"
                  rows={2}
                  className="block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  placeholder="Contact name, phone, email, etc."
                  {...register('lenderContactInfo')}
                />
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
                  placeholder="Any additional details about this loan"
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
                {isSubmitting ? 'Saving...' : 'Save Loan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 