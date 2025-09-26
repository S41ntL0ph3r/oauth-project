import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const adminCount = await prisma.admin.count();
    
    return NextResponse.json({
      hasAdmins: adminCount > 0,
      needsSetup: adminCount === 0,
      count: adminCount
    });

  } catch (error) {
    console.error('Setup status error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
