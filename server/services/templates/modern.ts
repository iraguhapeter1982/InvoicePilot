import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ModernTemplate extends BaseTemplate {
  name = 'modern';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // SMALL ORANGE HEADER BAND - Thin like the preview
    doc.setFillColor(...primaryRgb);
    doc.rect(0, 0, 210, 8, 'F');
    
    // Add gradient effect by overlaying a slightly different color
    doc.setFillColor(primaryRgb[0] + 15, primaryRgb[1] + 10, primaryRgb[2] - 5);
    doc.rect(0, 0, 210, 1, 'F');

    // MAIN CONTENT AREA - Starting near the top, overlapping header
    let yPos = 25;

    // LEFT SIDE - Company Information (matching preview layout)
    // Logo positioned on the left
    this.addLogo(doc, config, 20, yPos, 45, 20);
    
    // Company name and subtitle
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`;
    doc.text(companyName, 20, yPos + 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Professional Services', 20, yPos + 38);
    
    // Company address and contact info
    yPos += 48;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 4));
      });
      yPos += addressLines.length * 4 + 3;
    }
    
    if (user.email) {
      doc.text(user.email, 20, yPos);
      yPos += 4;
    }
    if (user.businessPhone) {
      doc.text(user.businessPhone, 20, yPos);
      yPos += 4;
    }
    if (user.taxId) {
      doc.text(`Tax ID: ${user.taxId}`, 20, yPos);
    }

    // RIGHT SIDE - INVOICE HEADER (matching preview)
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 190, 45, { align: 'right' });

    // Invoice details card-like area
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(140, 50, 55, 35, 3, 3, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(140, 50, 55, 35, 3, 3, 'S');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Invoice #:', 145, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(`${invoice.invoiceNumber}`, 190, 60, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.text('Date:', 145, 67);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 190, 67, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.text('Due Date:', 145, 74);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentRgb);
    doc.text(new Date(invoice.dueDate).toLocaleDateString(), 190, 74, { align: 'right' });

    // BILL TO SECTION (positioned higher)
    yPos = 100;
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, yPos);
    
    // Green accent line under "Bill To"
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(2);
    doc.line(20, yPos + 2, 45, yPos + 2);

    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 20, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    if (invoice.client.address) {
      const clientAddressLines = invoice.client.address.split('\n');
      clientAddressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 4));
      });
      yPos += clientAddressLines.length * 4 + 2;
    }
    
    doc.text(invoice.client.email, 20, yPos);
    if (invoice.client.phone) {
      yPos += 4;
      doc.text(invoice.client.phone, 20, yPos);
    }

    // TABLE SECTION (positioned higher)
    yPos = 140;
    
    // Table header with orange background matching the preview
    doc.setFillColor(...primaryRgb);
    doc.rect(20, yPos, 170, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, yPos + 8);
    doc.text('Qty', 110, yPos + 8, { align: 'center' });
    doc.text('Rate', 140, yPos + 8, { align: 'center' });
    doc.text('Amount', 185, yPos + 8, { align: 'right' });

    // Table rows
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      // Alternating row colors
      if (index % 2 === 1) {
        doc.setFillColor(248, 248, 248);
        doc.rect(20, yPos - 2, 170, 12, 'F');
      }
      
      doc.setFontSize(9);
      doc.text(item.description, 25, yPos + 6);
      doc.text(item.quantity.toString(), 110, yPos + 6, { align: 'center' });
      doc.text(`$${parseFloat(item.rate).toFixed(2)}`, 140, yPos + 6, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(`$${parseFloat(item.amount).toFixed(2)}`, 185, yPos + 6, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 12;
    });

    // TOTALS SECTION (matching preview alignment)
    yPos += 10;
    const totalsStartX = 130;
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal:', totalsStartX, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, 185, yPos, { align: 'right' });
    yPos += 10;
    
    // Tax (if applicable)
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Tax (${invoice.taxRate ? parseFloat(invoice.taxRate).toFixed(1) : '0'}%):`, totalsStartX, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${parseFloat(invoice.taxAmount).toFixed(2)}`, 185, yPos, { align: 'right' });
      yPos += 10;
    }
    
    // Discount (if applicable)
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Discount (${invoice.discountRate ? parseFloat(invoice.discountRate).toFixed(1) : '0'}%):`, totalsStartX, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`-$${parseFloat(invoice.discountAmount).toFixed(2)}`, 185, yPos, { align: 'right' });
      yPos += 10;
    }

    // Total with border line (matching preview)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(totalsStartX, yPos, 185, yPos);
    yPos += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', totalsStartX, yPos);
    doc.setTextColor(...accentRgb);
    doc.setFontSize(14);
    doc.text(`$${parseFloat(invoice.total).toFixed(2)}`, 185, yPos, { align: 'right' });

    // PAYMENT INFORMATION SECTION (matching preview)
    yPos += 20;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, yPos, 170, 25, 4, 4, 'F');
    doc.setDrawColor(230, 235, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, yPos, 170, 25, 4, 4, 'S');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', 25, yPos + 10);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const dueDays = Math.ceil((new Date(invoice.dueDate).getTime() - new Date(invoice.issueDate).getTime()) / (1000 * 60 * 60 * 24));
    doc.text(`Payment is due within ${dueDays} days of invoice date. Please include invoice number with payment.`, 25, yPos + 18);

    // NOTES SECTION (if present)
    if (invoice.notes) {
      yPos += 35;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 20, yPos);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      const noteLines = invoice.notes.split('\n').slice(0, 3);
      noteLines.forEach((line, index) => {
        const truncatedLine = line.length > 85 ? line.substring(0, 85) + '...' : line;
        doc.text(truncatedLine, 20, yPos + 8 + (index * 5));
      });
    }

    // FOOTER (matching preview)
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  }
}