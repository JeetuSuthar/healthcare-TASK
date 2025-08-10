import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Determine the correct base URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=oauth_error`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`);
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('No payload received from Google');
    }

    const { sub: googleId, email, given_name, family_name, picture } = payload;

    if (!email) {
      throw new Error('No email received from Google');
    }

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId }
        ]
      }
    });

    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId && googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatar: picture || user.avatar,
          }
        });
      }
    } else {
      // Create new user - Default to WORKER role for Google OAuth users
      // They can be promoted to MANAGER later by another manager
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          firstName: given_name || 'User',
          lastName: family_name || '',
          avatar: picture,
          role: 'WORKER', // Default role for Google OAuth users
          password: null, // No password for OAuth users
        }
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create response with redirect
    const redirectUrl = user.role === 'MANAGER' 
      ? `${baseUrl}/manager/dashboard`
      : `${baseUrl}/worker/dashboard`;

    const response = NextResponse.redirect(redirectUrl);

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    return NextResponse.redirect(`${baseUrl}/auth/login?error=callback_error`);
  }
}
