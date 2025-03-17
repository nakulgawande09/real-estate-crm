import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { mockProjects, mockApiResponse, paginateData } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// GET all projects with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const propertyType = searchParams.get('propertyType');
    const search = searchParams.get('search');
    
    if (USE_MOCK_DATA) {
      // Filter projects based on query parameters
      let filteredProjects = [...mockProjects];
      
      if (status) {
        filteredProjects = filteredProjects.filter(project => project.status === status);
      }
      
      if (propertyType) {
        filteredProjects = filteredProjects.filter(project => project.propertyType === propertyType);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          project.name.toLowerCase().includes(searchLower) || 
          project.description.toLowerCase().includes(searchLower) ||
          project.location.city.toLowerCase().includes(searchLower) ||
          project.location.state.toLowerCase().includes(searchLower)
        );
      }
      
      // Transform projects to match frontend interface
      const transformedProjects = filteredProjects.map(project => ({
        _id: project._id,
        name: project.name,
        description: project.description,
        location: project.location,
        status: project.status,
        propertyType: project.propertyType,
        acquisitionDate: project.startDate, // Using startDate as acquisitionDate
        totalBudget: project.budget,
        createdAt: project.startDate // Using startDate as createdAt since it's not in mock data
      }));
      
      // Paginate results
      const { data, pagination } = paginateData(transformedProjects, page, limit);
      
      // Return in the format expected by frontend
      return mockApiResponse({
        projects: data,
        pagination: {
          pages: pagination.totalPages,
          currentPage: pagination.page,
          total: pagination.total
        }
      });
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST a new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const data = await request.json();
    
    if (USE_MOCK_DATA) {
      // Create a new project with mock ID
      const newProject = {
        _id: `mock_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, we would add this to the mockProjects array
      // For now, just return the new project
      return mockApiResponse(newProject, 201);
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error creating project:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 