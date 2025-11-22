import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const startTime = Date.now();

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    return NextResponse.json({
      ok: true,
      version: '1.0',
      uptime: `${uptime}s`,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      ok: false,
      version: '1.0',
      database: 'disconnected',
      error: 'Database connection failed',
    }, { status: 500 });
  }
}