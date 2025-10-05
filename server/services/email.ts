import { Resend } from 'resend';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { emailLogger, type EmailLogData, type EmailSendResult } from './emailLogger';

let resend: Resend | null = null;

// Initialize Resend only if API key is available
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export async function sendInvoiceEmail(
  invoice: InvoiceWithDetails,
  user: User,
  pdfBuffer: Buffer
): Promise<boolean> {
  // Check if email service is configured
  if (!resend) {
    console.warn('Email service not configured - RESEND_API_KEY not set. Invoice will be marked as sent but email will not be delivered.');
    return false;
  }

  const emailLogData: EmailLogData = {
    userId: user.id,
    invoiceId: invoice.id,
    emailType: 'invoice',
    recipientEmail: invoice.client.email,
    senderEmail: process.env.FROM_EMAIL || 'noreply@invoicepilot.com',
    metadata: {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client.name,
      amount: invoice.total
    }
  };

  try {
    const result = await emailLogger.logEmailSend(emailLogData, async (): Promise<EmailSendResult> => {
    const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
    const domain = domains[0] || 'localhost:3000';
    const trackingPixelUrl = `https://${domain}/api/track/open/${invoice.id}`;
    
    const fromEmail = process.env.FROM_EMAIL || 'noreply@invoicepilot.com';
    const senderName = user.businessName || `${user.firstName} ${user.lastName}`;
    
    const { data, error } = await resend.emails.send({
      from: `${senderName} <${fromEmail}>`,
      to: [invoice.client.email],
      subject: `Invoice ${invoice.invoiceNumber} from ${senderName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Invoice Received</h1>
            <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">From ${senderName}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              Dear <strong>${invoice.client.name}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 32px 0;">
              Please find your invoice <strong>${invoice.invoiceNumber}</strong> for the amount of <strong style="color: #059669;">$${parseFloat(invoice.total).toFixed(2)}</strong>.
            </p>
            
            <!-- Invoice Details Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 32px 0;">
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Invoice Details</h3>
              <table style="width: 100%; border-spacing: 0;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Invoice #:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Issue Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${new Date(invoice.issueDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Due Date:</td>
                  <td style="padding: 8px 0; color: #dc2626; font-weight: 700; text-align: right;">${new Date(invoice.dueDate).toLocaleDateString()}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 16px 0 8px 0; color: #1f2937; font-weight: 700; font-size: 18px;">Total Amount:</td>
                  <td style="padding: 16px 0 8px 0; color: #059669; font-weight: 700; font-size: 24px; text-align: right;">$${parseFloat(invoice.total).toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://${domain}/pay/${invoice.id}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                💳 Pay Invoice Online
              </a>
            </div>
            
            ${invoice.notes ? `
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 32px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Notes:</h4>
              <p style="color: #78350f; margin: 0; line-height: 1.6;">${invoice.notes.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 32px 0 0 0;">
              Thank you for your business! If you have any questions, please don't hesitate to contact us.
            </p>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
                Best regards,<br>
                <strong style="color: #374151;">${senderName}</strong><br>
                ${user.email}
                ${user.businessPhone ? `<br>${user.businessPhone}` : ''}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
              This is an automated message from InvoicePilot. Please do not reply to this email.<br>
              If you're having trouble with the payment link, copy and paste this URL into your browser:<br>
              <span style="color: #6b7280;">https://${domain}/pay/${invoice.id}</span>
            </p>
          </div>
          
          <!-- Tracking Pixel -->
          <img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" alt="" />
        </div>
      `,
      attachments: [
        {
          content: pdfBuffer,
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
        },
      ],
    });

      if (error) {
        console.error('Resend email error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send email'
        };
      }

      console.log('Invoice email sent successfully:', data);
      return {
        success: true,
        providerId: data?.id,
        providerResponse: data
      };
    });

    return result.success;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

// New function for password reset emails
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string,
  userId?: string
): Promise<boolean> {
  if (!resend) {
    console.warn('Email service not configured - RESEND_API_KEY not set. Password reset email will not be sent.');
    return false;
  }

  // Only log if we have a userId (user exists)
  if (userId) {
    const emailLogData: EmailLogData = {
      userId: userId,
      emailType: 'password_reset',
      recipientEmail: email,
      senderEmail: process.env.FROM_EMAIL || 'noreply@invoicepilot.com',
      metadata: {
        resetToken: resetToken.substring(0, 8) + '...', // Only log partial token for security
        userName: userName
      }
    };

    try {
      const result = await emailLogger.logEmailSend(emailLogData, async (): Promise<EmailSendResult> => {
        return await sendPasswordResetEmailInternal(email, resetToken, userName);
      });
      return result.success;
    } catch (error) {
      console.error('Password reset email service error:', error);
      return false;
    }
  } else {
    // If no userId, send without logging (for security - don't log attempts for non-existent users)
    try {
      const result = await sendPasswordResetEmailInternal(email, resetToken, userName);
      return result.success;
    } catch (error) {
      console.error('Password reset email service error:', error);
      return false;
    }
  }
}

async function sendPasswordResetEmailInternal(
  email: string,
  resetToken: string,
  userName: string
): Promise<EmailSendResult> {
  if (!resend) {
    return {
      success: false,
      error: 'Email service not configured'
    };
  }

  const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
  const domain = domains[0] || 'localhost:3000';
  const resetUrl = `https://${domain}/reset-password?token=${resetToken}`;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@invoicepilot.com';

  const { data, error } = await resend.emails.send({
      from: `InvoicePilot <${fromEmail}>`,
      to: [email],
      subject: 'Reset Your InvoicePilot Password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔒 Password Reset</h1>
            <p style="color: #fecaca; margin: 8px 0 0 0; font-size: 16px;">Secure your InvoicePilot account</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              We received a request to reset the password for your InvoicePilot account. If you made this request, click the button below to reset your password.
            </p>
            
            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                🔑 Reset My Password
              </a>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 32px 0 0 0; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <!-- Security Info -->
            <div style="background-color: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 8px; padding: 20px; margin: 32px 0;">
              <h3 style="color: #0c4a6e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">🛡️ Didn't request this?</h3>
              <p style="color: #0369a1; margin: 0; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged, and your account remains secure.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
              This is an automated security message from InvoicePilot.<br>
              For security reasons, please do not forward this email to anyone.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend password reset email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send password reset email'
      };
    }

    console.log('Password reset email sent successfully:', data);
    return {
      success: true,
      providerId: data?.id,
      providerResponse: data
    };
}
