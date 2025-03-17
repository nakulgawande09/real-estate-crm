import { NextRequest } from 'next/server';
import { 
  mockApiResponse, 
  findPropertyById, 
  findTransactionsByPropertyId,
  findCustomerById
} from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const property = findPropertyById(id);

    if (!property) {
      return mockApiResponse(
        { error: 'Property not found' },
        404
      );
    }

    // Get related transactions
    const transactions = findTransactionsByPropertyId(id);

    // Enrich transactions with customer data
    const enrichedTransactions = transactions.map(transaction => {
      const customer = findCustomerById(transaction.customerId);
      return {
        ...transaction,
        customer: customer ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        } : null
      };
    });

    return mockApiResponse({
      property,
      transactions: enrichedTransactions
    });
  } catch (error) {
    console.error('Error in property details API route:', error);
    return mockApiResponse(
      { error: 'Failed to fetch property details' },
      500
    );
  }
} 