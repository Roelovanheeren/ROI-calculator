import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const debugInfo = {
      GHL_API_KEY_EXISTS: !!process.env.GHL_API_KEY,
      GHL_API_KEY_LENGTH: process.env.GHL_API_KEY?.length || 0,
      GHL_LOCATION_ID_EXISTS: !!process.env.GHL_LOCATION_ID,
      GHL_LOCATION_ID_LENGTH: process.env.GHL_LOCATION_ID?.length || 0,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      // Don't expose actual values for security
      ALL_ENV_KEYS: Object.keys(process.env).filter(key => key.startsWith('GHL_')),
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}
