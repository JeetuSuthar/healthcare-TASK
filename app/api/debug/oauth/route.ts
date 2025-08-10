import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Debug route to check environment variables
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  return NextResponse.json({
    environment: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV,
    },
    urls: {
      baseUrl,
      redirectUri,
      currentUrl: request.url,
    }
  });
}
