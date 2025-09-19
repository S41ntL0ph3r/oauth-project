import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    AUTH_SECRET: process.env.AUTH_SECRET ? '✅ Set' : '❌ Missing',
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ? '✅ Set' : '❌ Missing', 
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ? '✅ Set' : '❌ Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV,
    // Verificar também os nomes antigos
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set (old name)' : '❌ Missing',
    GITHUB_ID: process.env.GITHUB_ID ? '✅ Set (old name)' : '❌ Missing',
    GITHUB_SECRET: process.env.GITHUB_SECRET ? '✅ Set (old name)' : '❌ Missing',
  });
}
