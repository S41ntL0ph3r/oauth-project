import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Mock transactions - in production, this would come from the database
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, returns mocked data
    // In production, you would fetch from localStorage or a database
    const transactions: unknown[] = [];

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
