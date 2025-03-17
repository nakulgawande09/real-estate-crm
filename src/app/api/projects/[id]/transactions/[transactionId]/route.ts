import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import FinancialTransaction from '@/models/FinancialTransaction';
import Project from '@/models/Project';
import { UserRole } from '@/lib/enums';

// GET a specific transaction
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
    const transactionId = pathParts[pathParts.length - 1];
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Find the transaction
    const transaction = await FinancialTransaction.findOne({
      _id: transactionId,
      projectId: id
    });
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Return the transaction
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// UPDATE a transaction
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has appropriate role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow CEO and admin to update transactions
    const user = session.user as { id: string; role: string };
    if (user.role !== UserRole.CEO && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You do not have permission to update transactions' },
        { status: 403 }
      );
    }
    
    // Extract params from URL path
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.length - 3];
    const transactionId = pathParts[pathParts.length - 1];
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check if transaction exists and belongs to the project
    const existingTransaction = await FinancialTransaction.findOne({
      _id: transactionId,
      projectId: id
    });
    
    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Parse request body
    const data = await request.json();
    
    // Update the transaction
    const updatedTransaction = await FinancialTransaction.findByIdAndUpdate(
      transactionId,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    // Return the updated transaction
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE a transaction
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has appropriate role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow CEO and admin to delete transactions
    const user = session.user as { id: string; role: string };
    if (user.role !== UserRole.CEO && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You do not have permission to delete transactions' },
        { status: 403 }
      );
    }
    
    // Extract params from URL path
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.length - 3];
    const transactionId = pathParts[pathParts.length - 1];
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check if transaction exists and belongs to the project
    const transaction = await FinancialTransaction.findOne({
      _id: transactionId,
      projectId: id
    });
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Delete the transaction
    await FinancialTransaction.findByIdAndDelete(transactionId);
    
    // Return success response
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
} 