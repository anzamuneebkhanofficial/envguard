import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      event: payload.event || 'generic_webhook',
    });
  } catch {
    return NextResponse.json({ received: false, error: 'Invalid JSON payload' }, { status: 400 });
  }
}
