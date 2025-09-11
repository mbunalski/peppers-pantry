import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Configure AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail({ to, subject, htmlContent, textContent }: EmailOptions): Promise<boolean> {
  try {
    const command = new SendEmailCommand({
      Source: `Pepper's Pantry <noreply@peppers-pantry.com>`,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8',
          },
          ...(textContent && {
            Text: {
              Data: textContent,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    });

    const result = await sesClient.send(command);
    console.log('Email sent successfully:', result.MessageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email templates
export function getWelcomeEmailTemplate(userName: string): { subject: string; html: string; text: string } {
  return {
    subject: `Welcome to Pepper's Pantry, ${userName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Pepper's Pantry</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌶️ Welcome to Pepper's Pantry!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>Welcome to Pepper's Pantry, your new social cooking platform! We're excited to have you join our community of food lovers.</p>
              
              <p>Here's what you can do:</p>
              <ul>
                <li>🥘 Discover and react to amazing recipes</li>
                <li>👥 Follow other cooking enthusiasts</li>
                <li>💬 Comment and share your cooking experiences</li>
                <li>📅 Plan your weekly meals</li>
                <li>🛒 Generate smart shopping lists</li>
              </ul>
              
              <a href="https://peppers-pantry.com" class="button">Start Exploring Recipes</a>
              
              <p>Happy cooking!</p>
              <p>The Pepper's Pantry Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to Pepper's Pantry, ${userName}!
      
      We're excited to have you join our community of food lovers.
      
      Here's what you can do:
      • Discover and react to amazing recipes
      • Follow other cooking enthusiasts  
      • Comment and share your cooking experiences
      • Plan your weekly meals
      • Generate smart shopping lists
      
      Start exploring at: https://peppers-pantry.com
      
      Happy cooking!
      The Pepper's Pantry Team
    `,
  };
}

export function getPasswordResetEmailTemplate(userName: string, resetToken: string): { subject: string; html: string; text: string } {
  const resetUrl = `https://peppers-pantry.com/reset-password?token=${resetToken}`;
  
  return {
    subject: `Reset Your Pepper's Pantry Password`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌶️ Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>You requested to reset your password for your Pepper's Pantry account.</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <div class="warning">
                <strong>Security Note:</strong>
                <ul>
                  <li>This link expires in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If the button doesn't work, copy and paste this link:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              
              <p>Happy cooking!</p>
              <p>The Pepper's Pantry Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hi ${userName},
      
      You requested to reset your password for your Pepper's Pantry account.
      
      Reset your password here: ${resetUrl}
      
      Security Note:
      • This link expires in 1 hour
      • If you didn't request this, please ignore this email
      • Never share this link with anyone
      
      Happy cooking!
      The Pepper's Pantry Team
    `,
  };
}