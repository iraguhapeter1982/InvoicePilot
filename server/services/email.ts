import { MailService } from '@sendgrid/mail';
import { type InvoiceWithDetails, type User } from "@shared/schema";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendInvoiceEmail(
  invoice: InvoiceWithDetails,
  user: User,
  pdfBuffer: Buffer
): Promise<boolean> {
  try {
    const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
    const domain = domains[0] || 'localhost:5000';
    const trackingPixelUrl = `https://${domain}/api/track/open/${invoice.id}`;
    
    const emailData = {
      to: invoice.client.email,
      from: user.email || 'noreply@invoiceflow.com',
      subject: `Invoice ${invoice.invoiceNumber} from ${user.businessName || user.firstName + ' ' + user.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #3b82f6; margin: 0;">New Invoice from ${user.businessName || user.firstName + ' ' + user.lastName}</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${invoice.client.name},</p>
            
            <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> for the amount of <strong>$${parseFloat(invoice.total).toFixed(2)}</strong>.</p>
            
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Invoice Details:</strong></p>
              <p style="margin: 5px 0;">Invoice #: ${invoice.invoiceNumber}</p>
              <p style="margin: 5px 0;">Date: ${new Date(invoice.issueDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;">Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;">Amount: $${parseFloat(invoice.total).toFixed(2)}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://${domain}/pay/${invoice.id}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Pay Online
              </a>
            </div>
            
            ${invoice.notes ? `<p><strong>Notes:</strong><br>${invoice.notes}</p>` : ''}
            
            <p>Thank you for your business!</p>
            
            <p>Best regards,<br>
            ${user.businessName || user.firstName + ' ' + user.lastName}<br>
            ${user.email}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
          
          <img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />
        </div>
      `,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };

    await mailService.send(emailData);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}
