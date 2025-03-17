import { NextRequest } from 'next/server';
import { mockProperties, mockApiResponse, paginateData, findPropertiesByProjectId } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredProperties = [...mockProperties];

    // Apply filters
    if (projectId) {
      filteredProperties = findPropertiesByProjectId(projectId);
    }
    if (status) {
      filteredProperties = filteredProperties.filter(property => property.status === status);
    }
    if (type) {
      filteredProperties = filteredProperties.filter(property => property.type === type);
    }

    // Sort properties by creation date (newest first)
    filteredProperties.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate results
    const { data: properties, pagination } = paginateData(filteredProperties, page, limit);

    return mockApiResponse({
      properties,
      pagination
    });
  } catch (error) {
    console.error('Error in properties API route:', error);
    return mockApiResponse(
      { error: 'Failed to fetch properties' },
      500
    );
  }
} 