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
  FaMoneyBillWave
} from 'react-icons/fa';
import { TransactionType, TransactionCategory } from '@/lib/enums';

// Form validation schema
const transactionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().nonempty('Date is required'),
  type: z.enum([
    TransactionType.EXPENSE,
    TransactionType.REVENUE,
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.INTEREST_PAYMENT,
    TransactionType.PRINCIPAL_PAYMENT,
    TransactionType.INVESTOR_DISTRIBUTION,
    TransactionType.DIVIDEND
  ], {
    required_error: 'Transaction type is required',
  }),
  category: z.enum([
    TransactionCategory.CONSTRUCTION,
    TransactionCategory.MATERIALS,
    TransactionCategory.LABOR,
    TransactionCategory.PERMITS,
    TransactionCategory.INSURANCE,
    TransactionCategory.LEGAL,
    TransactionCategory.MARKETING,
    TransactionCategory.RENTAL_INCOME,
    TransactionCategory.SALE_PROCEEDS,
    TransactionCategory.FINANCING,
    TransactionCategory.TAXES,
    TransactionCategory.UTILITIES,
    TransactionCategory.MAINTENANCE,
    TransactionCategory.OTHER
  ], {
    required_error: 'Category is required',
  }),
  description: z.string().nonempty('Description is required'),
  referenceNumber: z.string().optional(),
  payee: z.string().optional(),
  relatedEntityType: z.enum(['loan', 'investment', 'property', 'none']).optional(),
  relatedEntityId: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function NewTransaction() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Categories filtered by transaction type
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Initialize form with default values
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.EXPENSE,
      category: TransactionCategory.CONSTRUCTION,
      relatedEntityType: 'none',
    }
  });
  
  // Watch the transaction type to filter categories
  const transactionType = watch('type');
  
  // Update available categories when transaction type changes
  React.useEffect(() => {
    let categories: string[] = [];
    
    switch (transactionType) {
      case TransactionType.EXPENSE:
        categories = [
          TransactionCategory.CONSTRUCTION,
          TransactionCategory.MATERIALS,
          TransactionCategory.LABOR,
          TransactionCategory.PERMITS,
          TransactionCategory.INSURANCE,
          TransactionCategory.LEGAL,
          TransactionCategory.MARKETING,
          TransactionCategory.TAXES,
          TransactionCategory.UTILITIES,
          TransactionCategory.MAINTENANCE,
          TransactionCategory.OTHER
        ];
        break;
        
      case TransactionType.REVENUE:
        categories = [
          TransactionCategory.RENTAL_INCOME,
          TransactionCategory.SALE_PROCEEDS,
          TransactionCategory.OTHER
        ];
        break;
        
      case TransactionType.DEPOSIT:
      case TransactionType.WITHDRAWAL:
        categories = [
          TransactionCategory.FINANCING,
          TransactionCategory.OTHER
        ];
        break;
        
      case TransactionType.INTEREST_PAYMENT:
      case TransactionType.PRINCIPAL_PAYMENT:
        categories = [
          TransactionCategory.FINANCING,
        ];
        break;
        
      case TransactionType.INVESTOR_DISTRIBUTION:
      case TransactionType.DIVIDEND:
        categories = [
          TransactionCategory.FINANCING,
        ];
        break;
        
      default:
        categories = Object.values(TransactionCategory);
    }
    
    setAvailableCategories(categories);
    
    // Set default category if current category is not in the filtered list
    if (!categories.includes(watch('category'))) {
      setValue('category', categories[0] as TransactionCategory);
    }
  }, [transactionType, setValue, watch]);
  
  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }
      
      const result = await response.json();
      
      toast.success('Transaction created successfully');
      router.push(`/dashboard/projects/${projectId}/financial`);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(error.message || 'Failed to create transaction');
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
        <h1 className="text-2xl font-bold text-gray-900">Add New Transaction</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Type */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.values(TransactionType).map((type) => (
                    <div 
                      key={type}
                      className={`
                        flex items-center justify-center p-3 rounded-md cursor-pointer border
                        ${transactionType === type 
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' 
                          : 'border-gray-300 hover:bg-gray-50'}
                      `}
                      onClick={() => setValue('type', type as TransactionType)}
                    >
                      <div className="text-center">
                        <FaMoneyBillWave 
                          className={`mx-auto h-5 w-5 mb-1 ${
                            ['EXPENSE', 'INTEREST_PAYMENT', 'PRINCIPAL_PAYMENT', 'WITHDRAWAL'].includes(type)
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`} 
                        />
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
              
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
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
              
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                    errors.date ? 'border-red-300' : ''
                  }`}
                  {...register('date')}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                    errors.category ? 'border-red-300' : ''
                  }`}
                  {...register('category')}
                >
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
              
              {/* Related Entity Type */}
              <div>
                <label htmlFor="relatedEntityType" className="block text-sm font-medium text-gray-700 mb-1">
                  Related To (Optional)
                </label>
                <select
                  id="relatedEntityType"
                  className="block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  {...register('relatedEntityType')}
                >
                  <option value="none">Not Related</option>
                  <option value="loan">Loan</option>
                  <option value="investment">Investment</option>
                  <option value="property">Property</option>
                </select>
              </div>
              
              {/* Related Entity ID */}
              {watch('relatedEntityType') !== 'none' && (
                <div>
                  <label htmlFor="relatedEntityId" className="block text-sm font-medium text-gray-700 mb-1">
                    {watch('relatedEntityType')} ID
                  </label>
                  <input
                    id="relatedEntityId"
                    type="text"
                    className="block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                    placeholder="Enter ID"
                    {...register('relatedEntityId')}
                  />
                </div>
              )}
              
              {/* Description */}
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                  placeholder="Brief description of the transaction"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              
              {/* Reference Number */}
              <div>
                <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number (Optional)
                </label>
                <input
                  id="referenceNumber"
                  type="text"
                  className="block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  placeholder="Invoice or reference number"
                  {...register('referenceNumber')}
                />
              </div>
              
              {/* Payee */}
              <div>
                <label htmlFor="payee" className="block text-sm font-medium text-gray-700 mb-1">
                  Payee/Payer (Optional)
                </label>
                <input
                  id="payee"
                  type="text"
                  className="block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  placeholder="Name of payee or payer"
                  {...register('payee')}
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
                  placeholder="Any additional details about this transaction"
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
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 