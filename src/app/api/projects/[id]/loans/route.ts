import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Loan from '@/models/Loan';
import Project from '@/models/Project';
import { UserRole } from '@/lib/enums';
import { findLoansByProjectId, findProjectById, mockApiResponse, mockLoans } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// GET all loans for a project
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
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Get loans for this project
      const loans = findLoansByProjectId(id);
      
      return mockApiResponse(loans);
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Build query
    const query: Record<string, any> = { projectId: id };
    
    if (status) {
      query.status = status;
    }
    
    // Fetch loans with filters
    const loans = await Loan.find(query).sort({ startDate: -1 });
    
    // Return the loans
    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching project loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project loans' },
      { status: 500 }
    );
  }
}

// CREATE a new loan for a project
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
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Parse request body
      const data = await request.json();
      
      // Calculate required fields
      const principalAmount = Number(data.principalAmount);
      const interestRate = Number(data.interestRate);
      const termMonths = Number(data.termMonths);
      const startDate = data.startDate;
      
      // Calculate monthly payment
      const monthlyRate = interestRate / 100 / 12;
      const paymentAmount = (principalAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
      
      // Calculate total interest
      const totalInterest = (paymentAmount * termMonths) - principalAmount;
      
      // Calculate end date
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + termMonths);
      
      // Create new loan with mock ID
      const newLoan = {
        _id: `mock_loan_${Date.now()}`,
        projectId: id,
        lenderName: data.lenderName,
        principalAmount,
        interestRate,
        termMonths,
        startDate,
        endDate: endDate.toISOString(),
        paymentFrequency: data.paymentFrequency || 'monthly',
        paymentAmount: Math.round(paymentAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, we would add this to the mockLoans array
      // For now, just return the new loan
      return mockApiResponse(newLoan, 201);
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.lenderName || !data.amount || !data.interestRate || !data.startDate) {
      return NextResponse.json(
        { error: 'Lender name, amount, interest rate, and start date are required fields' },
        { status: 400 }
      );
    }
    
    // Create new loan
    const loan = new Loan({
      ...data,
      projectId: id,
      createdBy: session.user.id
    });
    
    // Generate amortization schedule if needed
    if (data.loanType === 'amortized' && data.term && data.paymentFrequency) {
      loan.generateAmortizationSchedule();
    }
    
    // Save the loan
    await loan.save();
    
    // Return the created loan
    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error('Error creating project loan:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project loan' },
      { status: 500 }
    );
  }
} 