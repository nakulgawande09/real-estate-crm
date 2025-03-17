import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { findProjectById, mockApiResponse } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// Helper function to check if an ID is valid
function isValidObjectId(id: string): boolean {
  if (USE_MOCK_DATA) {
    // For mock data, accept any non-empty string
    return typeof id === 'string' && id.length > 0;
  }
  return mongoose.Types.ObjectId.isValid(id);
}

// GET a specific project
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
      // Find project in mock data
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Transform project to match frontend interface
      const transformedProject = {
        _id: project._id,
        name: project.name,
        description: project.description,
        location: project.location,
        status: project.status,
        propertyType: project.propertyType,
        acquisitionDate: project.acquisitionDate,
        totalBudget: project.totalBudget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        financialSummary: {
          totalInvestments: project.financialSummary?.totalInvestments || 0,
          totalLoans: project.financialSummary?.totalLoans || 0,
          totalExpenses: project.financialSummary?.totalExpenses || 0,
          totalRevenue: project.financialSummary?.totalRevenue || 0,
          netIncome: (project.financialSummary?.totalRevenue || 0) - (project.financialSummary?.totalExpenses || 0),
          roi: project.financialSummary?.roi || 0
        }
      };
      
      return mockApiResponse(transformedProject);
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// UPDATE a project
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      // Find project in mock data
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Update project in mock data (in a real app, we would modify the array)
      const updatedProject = {
        ...project,
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      return mockApiResponse(updatedProject);
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error updating project:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE a project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
      // Find project in mock data
      const project = findProjectById(id);
      
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // In a real implementation, we would remove the project from the array
      // For now, just return success
      return mockApiResponse({ message: 'Project deleted successfully' });
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 