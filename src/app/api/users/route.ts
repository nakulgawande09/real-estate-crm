import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { mockUsers, mockApiResponse, paginateData } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// GET users with pagination
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
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    
    if (USE_MOCK_DATA) {
      // Filter users based on query parameters
      let filteredUsers = [...mockUsers];
      
      if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchLower) || 
          user.email.toLowerCase().includes(searchLower)
        );
      }
      
      // Paginate results
      const paginatedData = paginateData(filteredUsers, page, limit);
      
      // Return paginated results
      return mockApiResponse(paginatedData);
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Register a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = 'client' } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
    });

    await user.save();

    // Return user without password
    const newUser = await User.findById(user._id).select('-password');
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the user' },
      { status: 500 }
    );
  }
} 