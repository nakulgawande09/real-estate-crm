import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { findLoanById, findProjectById, mockApiResponse, calculateLoanSchedule } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// Helper function to check if an ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET specific loan details
export async function GET(request: NextRequest, { params }: { params: { id: string, loanId: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, loanId } = params;
    
    if (!isValidObjectId(id) || !isValidObjectId(loanId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Check if schedule is requested
    const { searchParams } = new URL(request.url);
    const includeSchedule = searchParams.get('schedule') === 'true';
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Find the loan
      const loan = findLoanById(loanId);
      
      if (!loan || loan.projectId !== id) {
        return mockApiResponse({ error: 'Loan not found' }, 404);
      }
      
      // Return loan with or without schedule
      if (includeSchedule) {
        const schedule = calculateLoanSchedule(loan);
        return mockApiResponse({
          ...loan,
          paymentSchedule: schedule
        });
      } else {
        return mockApiResponse(loan);
      }
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error fetching loan details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan details' },
      { status: 500 }
    );
  }
}

// UPDATE a loan
export async function PUT(request: NextRequest, { params }: { params: { id: string, loanId: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, loanId } = params;
    
    if (!isValidObjectId(id) || !isValidObjectId(loanId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Parse request body
    const data = await request.json();
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Find the loan
      const loan = findLoanById(loanId);
      
      if (!loan || loan.projectId !== id) {
        return mockApiResponse({ error: 'Loan not found' }, 404);
      }
      
      // Update loan (only status can be updated)
      const updatedLoan = {
        ...loan,
        status: data.status || loan.status,
        updatedAt: new Date().toISOString()
      };
      
      return mockApiResponse(updatedLoan);
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error updating loan:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

// DELETE a loan
export async function DELETE(request: NextRequest, { params }: { params: { id: string, loanId: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, loanId } = params;
    
    if (!isValidObjectId(id) || !isValidObjectId(loanId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Find the loan
      const loan = findLoanById(loanId);
      
      if (!loan || loan.projectId !== id) {
        return mockApiResponse({ error: 'Loan not found' }, 404);
      }
      
      // In a real implementation, we would remove the loan from the array
      // For now, just return success
      return mockApiResponse({ message: 'Loan deleted successfully' });
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { error: 'Failed to delete loan' },
      { status: 500 }
    );
  }
} 