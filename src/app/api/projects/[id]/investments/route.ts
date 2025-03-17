import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Investment from '@/models/Investment';
import Project from '@/models/Project';
import Client from '@/models/Client';
import { UserRole } from '@/lib/enums';
import { findInvestmentsByProjectId, findProjectById, findInvestorById, mockApiResponse } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// GET all investments for a project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Get investments for this project
      const investments = findInvestmentsByProjectId(id);
      
      // Enhance investments with investor data
      const enhancedInvestments = investments.map(investment => {
        const investor = findInvestorById(investment.investorId);
        return {
          ...investment,
          investor: investor ? {
            name: investor.name,
            email: investor.email,
            type: investor.type
          } : null
        };
      });
      
      return mockApiResponse(enhancedInvestments);
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error fetching project investments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project investments' },
      { status: 500 }
    );
  }
}

// POST a new investment for a project
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }
    
    // Parse request body
    const data = await request.json();
    
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Check if investor exists
      const investor = findInvestorById(data.investorId);
      
      if (!investor) {
        return mockApiResponse({ error: 'Investor not found' }, 404);
      }
      
      // Create new investment with mock ID
      const newInvestment = {
        _id: `mock_investment_${Date.now()}`,
        projectId: id,
        investorId: data.investorId,
        amount: Number(data.amount),
        equityPercentage: Number(data.equityPercentage),
        investmentDate: data.investmentDate || new Date().toISOString(),
        expectedROI: Number(data.expectedROI),
        status: data.status || 'active',
        distributions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, we would add this to the mockInvestments array
      // For now, just return the new investment with investor info
      return mockApiResponse({
        ...newInvestment,
        investor: {
          name: investor.name,
          email: investor.email,
          type: investor.type
        }
      }, 201);
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error creating project investment:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project investment' },
      { status: 500 }
    );
  }
}

// Helper function to check if an ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
} 