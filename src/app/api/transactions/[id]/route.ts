import { NextRequest } from 'next/server';
import { 
  mockApiResponse, 
  mockPropertyTransactions,
  findPropertyById,
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
    
    // Find transaction by ID
    const transaction = mockPropertyTransactions.find(t => t._id === id);

    if (!transaction) {
      return mockApiResponse(
        { error: 'Transaction not found' },
        404
      );
    }

    // Get related property and customer data
    const property = findPropertyById(transaction.propertyId);
    const customer = findCustomerById(transaction.customerId);

    // Format transaction data for response
    const formattedTransaction = {
      id: transaction._id,
      date: transaction.date,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      property: property ? {
        id: property._id,
        name: property.name,
        type: property.type,
        address: property.details.unitNumber 
          ? `Unit ${property.details.unitNumber}, ${property.location?.address || ''}`
          : property.location?.address || '',
        features: property.details.features,
        pricing: property.pricing
      } : null,
      customer: customer ? {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      } : null,
      details: transaction.details,
      timeline: [
        {
          date: new Date(new Date(transaction.createdAt).getTime() - 86400000).toISOString(), // 1 day before
          status: 'INITIATED',
          description: 'Transaction initiated'
        },
        {
          date: transaction.createdAt,
          status: 'PROCESSING',
          description: 'Processing payment'
        },
        {
          date: transaction.updatedAt,
          status: transaction.status,
          description: transaction.status === 'COMPLETED' 
            ? 'Transaction completed successfully' 
            : transaction.status === 'PENDING'
              ? 'Awaiting final confirmation'
              : 'Transaction status updated'
        }
      ]
    };

    return mockApiResponse({
      transaction: formattedTransaction
    });
  } catch (error) {
    console.error('Error in transaction details API route:', error);
    return mockApiResponse(
      { error: 'Failed to fetch transaction details' },
      500
    );
  }
} 