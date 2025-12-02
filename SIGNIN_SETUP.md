# Sign-in Page Setup Guide

## Overview

The sign-in page has been implemented using Next.js App Router and NextAuth for authentication. The page provides a passwordless email authentication flow.

## Features

- **Passwordless Authentication**: Users receive a secure sign-in link via email
- **Dark Theme**: Modern, dark-themed UI using Tailwind CSS
- **Responsive Design**: Works on all screen sizes
- **TypeScript**: Full type safety throughout the implementation

## File Structure

```
app/
├── (auth)/
│   └── signin/
│       └── page.tsx          # Sign-in page component
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts      # NextAuth API route
├── globals.css               # Global styles with Tailwind directives
└── layout.tsx                # Root layout

components/
└── ui/
    ├── Button.tsx            # Reusable button component
    └── Input.tsx             # Reusable input component
```

## Environment Variables

Before running the application, you need to set up the following environment variables. Copy `.env.example` to `.env` and fill in the values:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Email Provider Configuration
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@sturgeonai.com
```

### Generating NEXTAUTH_SECRET

Run the following command to generate a secure secret:

```bash
openssl rand -base64 32
```

## Email Provider Setup

The sign-in page uses email authentication. You can use any SMTP provider:

### Option 1: Gmail

1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use these settings:
   - HOST: smtp.gmail.com
   - PORT: 587
   - USER: your-email@gmail.com
   - PASSWORD: your-app-password

### Option 2: SendGrid

1. Create a SendGrid account
2. Generate an API key
3. Use these settings:
   - HOST: smtp.sendgrid.net
   - PORT: 587
   - USER: apikey
   - PASSWORD: your-api-key

### Option 3: AWS SES

1. Set up AWS SES and verify your domain
2. Create SMTP credentials
3. Use the SMTP settings provided by AWS

## Usage

1. Navigate to `/signin`
2. Enter your email address
3. Click "Continue"
4. Check your email for the sign-in link
5. Click the link to complete authentication
6. You'll be redirected to `/dashboard`

## Customization

### Styling

The sign-in page uses Tailwind CSS. You can customize the colors and styling by modifying:

- `app/(auth)/signin/page.tsx` - Main sign-in page styles
- `components/ui/Button.tsx` - Button component styles
- `components/ui/Input.tsx` - Input component styles
- `tailwind.config.js` - Global theme configuration

### Callback URL

The default callback URL is `/dashboard`. You can change this in `app/(auth)/signin/page.tsx`:

```typescript
await signIn("email", {
  email,
  callbackUrl: "/your-custom-route",
});
```

## Security Considerations

- Never commit your `.env` file to version control
- Always use a strong `NEXTAUTH_SECRET` in production
- Use a trusted email provider with proper SPF/DKIM records
- Consider implementing rate limiting for sign-in attempts
- Review and configure CORS settings for production

## Troubleshooting

### Emails not being sent

1. Verify your SMTP credentials are correct
2. Check if your email provider requires app-specific passwords
3. Ensure your IP is not blocked by the email provider
4. Check the server logs for detailed error messages

### "Invalid configuration" error

1. Ensure all required environment variables are set
2. Verify `NEXTAUTH_SECRET` is defined
3. Check that `NEXTAUTH_URL` matches your deployment URL

### Styling issues

1. Clear the `.next` folder and rebuild: `rm -rf .next && npm run build`
2. Ensure Tailwind CSS is properly configured in `postcss.config.js`
3. Check that `globals.css` is imported in `app/layout.tsx`
