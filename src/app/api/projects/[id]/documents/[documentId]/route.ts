import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { UserRole } from '@/lib/enums';
import { findDocumentById, findProjectById, mockApiResponse } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

// GET a specific document
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract params from URL path
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.length - 3];
    const documentId = pathParts[pathParts.length - 1];
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
    }
    
    // Use mock data
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Find the document
      const document = findDocumentById(documentId);
      
      if (!document || document.projectId !== id) {
        return mockApiResponse({ error: 'Document not found' }, 404);
      }
      
      // Return the document
      return mockApiResponse(document);
    }
    
    // Real implementation (commented out)
    /*
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    // @ts-expect-error - Suppress TypeScript error for Mongoose query
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Find the document
    // @ts-expect-error - Suppress TypeScript error for Mongoose query
    const document = await Document.findOne({
      _id: documentId,
      projectId: id
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Return the document
    return NextResponse.json(document);
    */
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// UPDATE a document
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has appropriate role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow CEO and admin to update documents
    const user = session.user as { id: string; role: string };
    if (user.role !== UserRole.CEO && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You do not have permission to update documents' },
        { status: 403 }
      );
    }
    
    // Extract params from URL path
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.length - 3];
    const documentId = pathParts[pathParts.length - 1];
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
    }
    
    // Parse request body
    const data = await request.json();
    
    // Use mock data
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Find the document
      const document = findDocumentById(documentId);
      
      if (!document || document.projectId !== id) {
        return mockApiResponse({ error: 'Document not found' }, 404);
      }
      
      // Update document in mock data (in a real app, we would modify the array)
      const updatedDocument = {
        ...document,
        ...data,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: user.id
      };
      
      // Return the updated document
      return mockApiResponse(updatedDocument);
    }
    
    // Real implementation (commented out)
    /*
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    // @ts-expect-error - Suppress TypeScript error for Mongoose query
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check if document exists and belongs to the project
    // @ts-expect-error - Suppress TypeScript error for Mongoose query
    const existingDocument = await Document.findOne({
      _id: documentId,
      projectId: id
    });
    
    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Update the document
    // @ts-expect-error - Suppress TypeScript error for Mongoose query
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { 
        $set: {
          ...data,
          lastUpdated: new Date(),
          lastUpdatedBy: user.id
        } 
      },
      { new: true, runValidators: true }
    );
    
    // Return the updated document
    return NextResponse.json(updatedDocument);
    */
  } catch (error) {
    console.error('Error updating document:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE a document
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has appropriate role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow CEO and admin to delete documents
    const user = session.user as { id: string; role: string };
    if (user.role !== UserRole.CEO && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You do not have permission to delete documents' },
        { status: 403 }
      );
    }
    
    // Extract params from URL path
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.length - 3];
    const documentId = pathParts[pathParts.length - 1];
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
    }
    
    // Use mock data
    if (USE_MOCK_DATA) {
      // Check if project exists
      const project = findProjectById(id);
      if (!project) {
        return mockApiResponse({ error: 'Project not found' }, 404);
      }
      
      // Find the document
      const document = findDocumentById(documentId);
      
      if (!document || document.projectId !== id) {
        return mockApiResponse({ error: 'Document not found' }, 404);
      }
      
      // In a real implementation, we would remove the document from the array
      // For now, just return success
      return mockApiResponse({ message: 'Document deleted successfully' });
    }
    
    // Real implementation (commented out)
    /*
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    // @ts-expect-error - Suppress TypeScript error for Mongoose query
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check if document exists and belongs to the project
    // @ts-expect-error - Suppress TypeScript error for Mongoose query
    const document = await Document.findOne({
      _id: documentId,
      projectId: id
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Delete the document
    // @ts-expect-error - Suppress TypeScript error for Mongoose query
    await Document.findByIdAndDelete(documentId);
    
    // Return success response
    return NextResponse.json({ message: 'Document deleted successfully' });
    */
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 