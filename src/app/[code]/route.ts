import { NextRequest, NextResponse } from 'next/server';

// Dynamic route - disable static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;

    // Skip if it's a known route
    const reservedPaths = ['api', 'code', 'healthz', '_next', 'favicon.ico'];
    if (reservedPaths.includes(code)) {
      return NextResponse.next();
    }

    // Import prisma dynamically to avoid build-time issues
    const { default: prisma } = await import('@/lib/prisma');

    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Increment click count and update last clicked time
    await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastClicked: new Date(),
      },
    });

    // Perform 302 redirect
    return NextResponse.redirect(link.targetUrl, 302);
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}