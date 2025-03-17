import { NextRequest } from 'next/server';
import { mockPropertyTransactions, mockApiResponse, paginateData } from '@/lib/mockData';
import { findPropertyById, findCustomerById } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const propertyId = searchParams.get('propertyId') || '';
    const customerId = searchParams.get('customerId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'date';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    // Get transactions and enrich with property and customer data
    let transactions = [...mockPropertyTransactions].map(transaction => {
      const property = findPropertyById(transaction.propertyId);
      const customer = findCustomerById(transaction.customerId);
      
      return {
        id: transaction._id,
        date: transaction.date,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        propertyId: transaction.propertyId,
        propertyName: property ? property.name : 'Unknown Property',
        customer: customer ? {
          id: customer._id,
          name: customer.name,
          email: customer.email
        } : {
          id: 'unknown',
          name: 'Unknown Customer',
          email: 'unknown@example.com'
        },
        paymentMethod: transaction.details.paymentMethod,
        reference: transaction.details.contractNumber || `TX-${transaction._id}`
      };
    });

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      transactions = transactions.filter(transaction => 
        transaction.propertyName.toLowerCase().includes(searchLower) ||
        transaction.customer.name.toLowerCase().includes(searchLower) ||
        transaction.reference.toLowerCase().includes(searchLower)
      );
    }

    if (type) {
      transactions = transactions.filter(transaction => transaction.type === type);
    }

    if (status) {
      transactions = transactions.filter(transaction => transaction.status === status);
    }

    if (propertyId) {
      transactions = transactions.filter(transaction => transaction.propertyId === propertyId);
    }

    if (customerId) {
      transactions = transactions.filter(transaction => transaction.customer.id === customerId);
    }

    // Sort transactions
    transactions.sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      return 0;
    });

    // Paginate results
    const { data, pagination } = paginateData(transactions, page, limit);

    return mockApiResponse({
      transactions: data,
      pagination
    });
  } catch (error) {
    console.error('Error in transactions API route:', error);
    return mockApiResponse(
      { error: 'Failed to fetch transactions' },
      500
    );
  }
} 