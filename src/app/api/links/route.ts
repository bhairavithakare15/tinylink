import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCode, isValidUrl, isValidCode } from '@/lib/utils';

// GET /api/links - List all links
export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, code: customCode } = body;

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL. Please provide a valid HTTP/HTTPS URL.' },
        { status: 400 }
      );
    }

    // Generate or validate code
    let code = customCode?.trim() || generateCode();

    // If custom code provided, validate format
    if (customCode) {
      if (!isValidCode(customCode)) {
        return NextResponse.json(
          { error: 'Invalid code. Must be 6-8 alphanumeric characters.' },
          { status: 400 }
        );
      }
      code = customCode;
    }

    // Check if code already exists
    const existing = await prisma.link.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: 'Code already exists. Please choose a different code.' },
        { status: 409 }
      );
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        code,
        targetUrl: url,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}