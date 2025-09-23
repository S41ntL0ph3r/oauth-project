import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT_SET',
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ? 'SET' : 'NOT_SET', 
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ? 'SET' : 'NOT_SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
  };

  return NextResponse.json(envVars);
}
