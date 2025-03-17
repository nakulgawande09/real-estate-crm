import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Document from '@/models/Document';
import Project from '@/models/Project';
import { UserRole } from '@/lib/enums';

// GET all documents for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract project ID from URL path
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.length - 2];
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
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
    const category = searchParams.get('category');
    
    // Build query
    const query: Record<string, any> = { projectId: id };
    
    if (category) {
      query.category = category;
    }
    
    // Fetch documents with filters
    const documents = await Document.find(query).sort({ uploadDate: -1 });
    
    // Return the documents
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching project documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project documents' },
      { status: 500 }
    );
  }
}

// CREATE a new document for a project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has appropriate role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow CEO and admin to upload documents
    const user = session.user as { id: string; role: string };
    if (user.role !== UserRole.CEO && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You do not have permission to upload documents' },
        { status: 403 }
      );
    }
    
    // Extract project ID from URL path
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.length - 2];
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
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
    if (!data.title || !data.fileUrl || !data.fileType) {
      return NextResponse.json(
        { error: 'Title, fileUrl, and fileType are required fields' },
        { status: 400 }
      );
    }
    
    // Create new document
    const document = new Document({
      ...data,
      projectId: id,
      uploadedBy: user.id
    });
    
    // Save the document
    await document.save();
    
    // Return the created document
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
} 