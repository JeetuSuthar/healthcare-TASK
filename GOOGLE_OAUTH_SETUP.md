# Google OAuth Setup Instructions

## Setting up Google OAuth for Healthcare Shift Tracker

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (for user profile information)

### 2. Configure OAuth Consent Screen

1. In Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Healthcare Shift Tracker"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Add test users (if in testing mode)

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Set the authorized redirect URIs:
   - For local development: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
5. Copy the Client ID and Client Secret

### 4. Update Environment Variables

Update your `.env` file with the Google credentials:

```env
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
```

### 5. Test the Integration

1. Start your development server: `pnpm run dev`
2. Go to the login page
3. Click "Continue with Google"
4. Complete the OAuth flow
5. You should be redirected back to your app and logged in

## Important Notes

- New users signing up via Google OAuth will default to the WORKER role
- Managers need to be promoted manually or through the admin interface
- Users signing up with Google won't have a password (password field is null)
- The system will try to match existing users by email if they already exist

## Security Considerations

- Always use HTTPS in production
- Keep your Google Client Secret secure
- Regularly rotate your JWT secrets
- Monitor OAuth usage in Google Cloud Console
