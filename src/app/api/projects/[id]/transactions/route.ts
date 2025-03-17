import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import FinancialTransaction from '@/models/FinancialTransaction';
import Project from '@/models/Project';
import { UserRole } from '@/lib/enums';
import { findTransactionsByProjectId, findProjectById, mockApiResponse } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// GET all transactions for a project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Get transactions for this project
      let transactions = findTransactionsByProjectId(id);
      
      // Apply filters
      if (type) {
        transactions = transactions.filter(t => t.type === type);
      }
      
      if (category) {
        transactions = transactions.filter(t => t.category === category);
      }
      
      if (startDate) {
        const start = new Date(startDate);
        transactions = transactions.filter(t => new Date(t.date) >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        transactions = transactions.filter(t => new Date(t.date) <= end);
      }
      
      // Sort by date, newest first
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return mockApiResponse({
        transactions,
        summary: {
          totalIncome,
          totalExpenses,
          netCashflow: totalIncome - totalExpenses,
          transactionCount: transactions.length
        }
      });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Build query
    const query: Record<string, any> = { projectId: id };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Fetch transactions with filters
    const transactions = await FinancialTransaction.find(query).sort({ date: -1 });
    
    // Return the transactions
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching project transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project transactions' },
      { status: 500 }
    );
  }
}

// POST a new transaction for a project
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.amount || !data.type || !data.category || !data.description) {
      return NextResponse.json(
        { error: 'Amount, type, category, and description are required fields' },
        { status: 400 }
      );
    }
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Create new transaction with mock ID
      const newTransaction = {
        _id: `mock_transaction_${Date.now()}`,
        projectId: id,
        amount: Number(data.amount),
        date: data.date || new Date().toISOString(),
        type: data.type,
        category: data.category,
        description: data.description,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, we would add this to the mockTransactions array
      // For now, just return the new transaction
      return mockApiResponse(newTransaction, 201);
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Only allow CEO and admin to create transactions
    const user = session.user as { id: string; role: string };
    if (user.role !== UserRole.CEO && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You do not have permission to create transactions' },
        { status: 403 }
      );
    }
    
    // Create new transaction
    const transaction = new FinancialTransaction({
      ...data,
      projectId: id,
      createdBy: user.id,
      date: new Date(data.date)
    });
    
    // Save the transaction
    await transaction.save();
    
    // Return the created transaction
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating project transaction:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project transaction' },
      { status: 500 }
    );
  }
} 