import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Investment from '@/models/Investment';
import Project from '@/models/Project';
import FinancialTransaction from '@/models/FinancialTransaction';
import { TransactionType, UserRole } from '@/lib/enums';
import { findInvestmentById, findProjectById, findInvestorById, mockApiResponse, calculateInvestmentROI } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// GET a specific investment
export async function GET(request: NextRequest, { params }: { params: { id: string, investmentId: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, investmentId } = params;
    
    if (!isValidObjectId(id) || !isValidObjectId(investmentId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Find the investment
      const investment = findInvestmentById(investmentId);
      
      if (!investment || investment.projectId !== id) {
        return mockApiResponse({ error: 'Investment not found' }, 404);
      }
      
      // Find the investor
      const investor = findInvestorById(investment.investorId);
      
      // Calculate ROI
      const roiData = calculateInvestmentROI(investment);
      
      // Return investment with ROI and investor data
      return mockApiResponse({
        ...investment,
        investor: investor ? {
          name: investor.name,
          email: investor.email,
          type: investor.type
        } : null,
        roi: roiData
      });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Fetch the investment
    const investment = await Investment.findOne({ _id: investmentId, projectId: id });
    
    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    
    // Return the investment
    return NextResponse.json(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment' },
      { status: 500 }
    );
  }
}

// UPDATE an investment
export async function PUT(request: NextRequest, { params }: { params: { id: string, investmentId: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, investmentId } = params;
    
    if (!isValidObjectId(id) || !isValidObjectId(investmentId)) {
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
      
      // Find the investment
      const investment = findInvestmentById(investmentId);
      
      if (!investment || investment.projectId !== id) {
        return mockApiResponse({ error: 'Investment not found' }, 404);
      }
      
      // Update investment status (only status can be updated)
      const updatedInvestment = {
        ...investment,
        status: data.status || investment.status,
        updatedAt: new Date().toISOString()
      };
      
      // Calculate ROI
      const roiData = calculateInvestmentROI(updatedInvestment);
      
      return mockApiResponse({
        ...updatedInvestment,
        roi: roiData
      });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Verify investment exists
    const existingInvestment = await Investment.findOne({ _id: investmentId, projectId: id });
    if (!existingInvestment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    
    // Update the investment
    const updatedInvestment = await Investment.findByIdAndUpdate(
      investmentId,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    // Return the updated investment
    return NextResponse.json(updatedInvestment);
  } catch (error) {
    console.error('Error updating investment:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update investment' },
      { status: 500 }
    );
  }
}

// DELETE an investment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has appropriate role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow CEO and admin to delete investments
    const user = session.user as { id: string; role: string };
    if (user.role !== UserRole.CEO && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You do not have permission to delete investments' },
        { status: 403 }
      );
    }
    
    // Extract params from URL path
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.length - 3];
    const investmentId = pathParts[pathParts.length - 1];
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(investmentId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Verify investment exists
    const investment = await Investment.findOne({ _id: investmentId, projectId: id });
    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    
    // Check if there are related financial transactions
    const relatedTransactions = await FinancialTransaction.find({
      relatedEntityId: investmentId,
      relatedEntityType: 'investment'
    });
    
    if (relatedTransactions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete investment with associated transactions. Please delete transactions first.' },
        { status: 400 }
      );
    }
    
    // Delete the investment
    await Investment.deleteOne({ _id: investmentId });
    
    // Return success
    return NextResponse.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    return NextResponse.json(
      { error: 'Failed to delete investment' },
      { status: 500 }
    );
  }
}

// POST to record a distribution on an investment
export async function POST(request: NextRequest, { params }: { params: { id: string, investmentId: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, investmentId } = params;
    
    if (!isValidObjectId(id) || !isValidObjectId(investmentId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Parse request body
    const data = await request.json();
    
    if (!data.amount || !data.type) {
      return NextResponse.json(
        { error: 'Amount and distribution type are required' },
        { status: 400 }
      );
    }
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Find the investment
      const investment = findInvestmentById(investmentId);
      
      if (!investment || investment.projectId !== id) {
        return mockApiResponse({ error: 'Investment not found' }, 404);
      }
      
      // Create a new distribution
      const newDistribution = {
        date: data.date || new Date().toISOString(),
        amount: Number(data.amount),
        type: data.type
      };
      
      // Add the distribution to the investment (in a real app, we would modify the array)
      const updatedInvestment = {
        ...investment,
        distributions: [...investment.distributions, newDistribution],
        updatedAt: new Date().toISOString()
      };
      
      // Calculate updated ROI
      const roiData = calculateInvestmentROI(updatedInvestment);
      
      // Return the updated investment with ROI data
      return mockApiResponse({
        ...updatedInvestment,
        roi: roiData
      });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Verify investment exists
    const investment = await Investment.findOne({ _id: investmentId, projectId: id });
    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    
    // Create a new distribution entry
    const newDistribution = {
      date: new Date(data.date),
      amount: Number(data.amount),
      type: data.type
    };
    
    // Add to distributions array
    investment.distributions.push(newDistribution);
    
    // Update total distributed
    investment.totalDistributed += Number(data.amount);
    
    // Calculate ROI metrics
    if (investment.amount > 0) {
      investment.actualROI = (investment.totalDistributed / investment.amount) * 100;
    }
    
    // Save the updated investment
    await investment.save();
    
    // Create a financial transaction record
    const transaction = new FinancialTransaction({
      projectId: id,
      relatedEntityId: investmentId,
      relatedEntityType: 'investment',
      date: new Date(data.date),
      amount: Number(data.amount),
      type: TransactionType.INVESTOR_DISTRIBUTION,
      description: `Investment distribution to ${investment.investorName}`,
      payee: investment.investorName,
      payeeId: investment.investorId,
      payeeType: 'investor',
      referenceNumber: `INV-${investmentId}-DIST-${investment.distributions.length}`
    });
    
    await transaction.save();
    
    // Return the updated investment
    return NextResponse.json({
      investment,
      transaction,
      message: 'Distribution recorded successfully'
    });
  } catch (error) {
    console.error('Error recording investment distribution:', error);
    return NextResponse.json(
      { error: 'Failed to record investment distribution' },
      { status: 500 }
    );
  }
}

// Helper function to check if an ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
} 