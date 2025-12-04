import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // TODO: Implement actual password reset logic here
    // This would typically involve:
    // 1. Check if user exists in database
    // 2. Generate a reset token
    // 3. Store the token with expiration
    // 4. Send email with reset link
    
    // For now, we'll just simulate success
    console.log(`Password reset requested for: ${email}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Error in reset-password handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
