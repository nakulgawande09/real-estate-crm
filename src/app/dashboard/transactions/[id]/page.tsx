'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaArrowLeft, FaFileDownload, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaHourglassHalf } from 'react-icons/fa';

interface TransactionDetail {
  id: string;
  date: string;
  type: string;
  status: string;
  amount: number;
  property: {
    id: string;
    name: string;
    type: string;
    address: string;
    features: string[];
    pricing: {
      listPrice: number;
      soldPrice?: number;
      pricePerSqFt: number;
    };
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  details: {
    contractNumber?: string;
    paymentMethod: string;
    downPayment?: number;
    mortgageDetails?: {
      lender: string;
      amount: number;
      term: number;
      interestRate: number;
    };
  };
  timeline: {
    date: string;
    status: string;
    description: string;
  }[];
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Mock data for transaction detail
        const mockTransaction: TransactionDetail = {
          id: 'trans1',
          date: '2024-03-15T10:30:00Z',
          type: 'SALE',
          status: 'COMPLETED',
          amount: 1225000,
          property: {
            id: 'prop1',
            name: 'Luxury Suite 1201',
            type: 'CONDO',
            address: 'Unit 1201, 123 River St, Austin, TX',
            features: [
              'River View',
              'Corner Unit',
              'Private Balcony',
              'Smart Home Technology',
              'High-end Appliances'
            ],
            pricing: {
              listPrice: 1250000,
              soldPrice: 1225000,
              pricePerSqFt: 556.82
            }
          },
          customer: {
            id: 'cust1',
            name: 'John Thompson',
            email: 'john@example.com',
            phone: '(512) 555-0123',
            address: {
              street: '789 Park Avenue',
              city: 'Austin',
              state: 'TX',
              zipCode: '78701',
              country: 'USA'
            }
          },
          details: {
            contractNumber: 'RH-2023-1201',
            paymentMethod: 'MORTGAGE',
            downPayment: 245000,
            mortgageDetails: {
              lender: 'Austin First Bank',
              amount: 980000,
              term: 30,
              interestRate: 4.5
            }
          },
          timeline: [
            {
              date: '2024-03-14T10:30:00Z',
              status: 'INITIATED',
              description: 'Transaction initiated'
            },
            {
              date: '2024-03-14T14:45:00Z',
              status: 'PROCESSING',
              description: 'Processing payment'
            },
            {
              date: '2024-03-15T10:30:00Z',
              status: 'COMPLETED',
              description: 'Transaction completed successfully'
            }
          ]
        };

        setTransaction(mockTransaction);
      } catch (err) {
        console.error('Error fetching transaction detail:', err);
        setError('Failed to load transaction details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [params.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <FaHourglassHalf className="h-5 w-5 text-yellow-500" />;
      default:
        return <FaExclamationCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'FAILED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error || 'Transaction not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
        </div>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaFileDownload className="mr-2" />
          Export Receipt
        </button>
      </div>

      {/* Transaction Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <p className="text-sm text-gray-500">Transaction ID</p>
            <p className="text-lg font-semibold">{transaction.id}</p>
            <p className="text-sm text-gray-500 mt-4">Date</p>
            <p className="text-lg">{format(new Date(transaction.date), 'MMM d, yyyy HH:mm')}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-2xl font-bold">${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-gray-500 mt-4">Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {getStatusIcon(transaction.status)}
              <span className="ml-2">{transaction.status}</span>
            </span>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">Type</p>
            <p className="text-lg">{transaction.type}</p>
            <p className="text-sm text-gray-500 mt-4">Payment Method</p>
            <p className="text-lg">{transaction.details.paymentMethod}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Property Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Property Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Property Name</p>
              <Link href={`/dashboard/properties/${transaction.property.id}`} className="text-blue-600 hover:text-blue-800">
                {transaction.property.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p>{transaction.property.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p>{transaction.property.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">List Price</p>
              <p>${transaction.property.pricing.listPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            {transaction.property.pricing.soldPrice && (
              <div>
                <p className="text-sm text-gray-500">Sold Price</p>
                <p>${transaction.property.pricing.soldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <Link href={`/dashboard/customers/${transaction.customer.id}`} className="text-blue-600 hover:text-blue-800">
                {transaction.customer.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{transaction.customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{transaction.customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p>
                {transaction.customer.address.street}, {transaction.customer.address.city}, {transaction.customer.address.state} {transaction.customer.address.zipCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {transaction.type === 'SALE' && transaction.details.mortgageDetails && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Down Payment</p>
              <p className="text-lg font-medium">${transaction.details.downPayment?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mortgage Amount</p>
              <p className="text-lg font-medium">${transaction.details.mortgageDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lender</p>
              <p className="text-lg font-medium">{transaction.details.mortgageDetails.lender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Terms</p>
              <p className="text-lg font-medium">{transaction.details.mortgageDetails.term} years @ {transaction.details.mortgageDetails.interestRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Transaction Timeline</h2>
        <div className="relative">
          {transaction.timeline.map((event, index) => (
            <div key={index} className="mb-8 flex">
              <div className="flex flex-col items-center mr-4">
                <div className="rounded-full h-8 w-8 flex items-center justify-center bg-blue-500 text-white">
                  {index + 1}
                </div>
                {index < transaction.timeline.length - 1 && (
                  <div className="h-full w-0.5 bg-blue-200"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-medium">{event.status}</h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(event.date), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 