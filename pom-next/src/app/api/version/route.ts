import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '3.0.0',
    name: 'POM API',
    framework: 'Next.js 16',
  });
}
