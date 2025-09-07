import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ModernTemplate extends BaseTemplate {
  name = 'modern';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // MODERN HEADER BAND - Clean and simple
    doc.setFillColor(...primaryRgb);
    doc.rect(0, 0, 210, 30, 'F');

    // INVOICE TITLE in header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 22);

    // COMPANY SECTION - Starting below header with safe spacing
    let yPos = 50;
    
    // Logo positioned safely
    this.addLogo(doc, config, 20, yPos, 50, 25);
    
    // Company information 
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`;
    doc.text(companyName, 20, yPos + 35);
    
    // Company details
    yPos += 45;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 4));
      });
      yPos += addressLines.length * 4 + 6;
    }
    
    if (user.email) {
      doc.text(user.email, 20, yPos);
      yPos += 5;
    }
    if (user.businessPhone) {
      doc.text(user.businessPhone, 20, yPos);
      yPos += 5;
    }
    if (user.taxId) {
      doc.setTextColor(120, 120, 120);
      doc.text(`Tax ID: ${user.taxId}`, 20, yPos);
    }

    // INVOICE DETAILS CARD - Positioned safely on the right
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(130, 50, 65, 45, 4, 4, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(130, 50, 65, 45, 4, 4, 'S');
    
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS', 135, 60);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${invoice.invoiceNumber}`, 135, 72);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Issue Date:', 135, 80);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 135, 86);
    
    doc.setTextColor(100, 100, 100);
    doc.text('Due Date:', 135, 90);
    doc.setTextColor(...accentRgb);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(invoice.dueDate).toLocaleDateString(), 135, 96);

    // BILL TO SECTION - Clean positioning
    yPos = 110;
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(20, yPos, 75, 35, 4, 4, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, 75, 35, 4, 4, 'S');
    
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 25, yPos + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 25, yPos + 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (invoice.client.address) {
      const clientAddress = invoice.client.address.split('\n')[0];
      const truncatedAddress = clientAddress.length > 25 ? clientAddress.substring(0, 25) + '...' : clientAddress;
      doc.text(truncatedAddress, 25, yPos + 28);
    }
    
    const emailText = invoice.client.email.length > 25 ? invoice.client.email.substring(0, 25) + '...' : invoice.client.email;
    doc.text(emailText, 25, yPos + 33);

    // TABLE SECTION - Simple and clean
    yPos = 160;
    
    // Table header
    doc.setFillColor(...primaryRgb);
    doc.rect(20, yPos, 170, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, yPos + 8);
    doc.text('QTY', 115, yPos + 8, { align: 'center' });
    doc.text('RATE', 135, yPos + 8, { align: 'center' });
    doc.text('AMOUNT', 175, yPos + 8, { align: 'right' });

    // Table items
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 248, 248);
        doc.rect(20, yPos - 2, 170, 12, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      const description = item.description.length > 35 ? item.description.substring(0, 35) + '...' : item.description;
      doc.text(description, 25, yPos + 6);
      doc.text(item.quantity, 115, yPos + 6, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 135, yPos + 6, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 175, yPos + 6, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 12;
    });

    // TOTALS SECTION - Simple and visible
    yPos += 15;
    const totalsX = 120;
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal:', totalsX, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(this.formatCurrency(invoice.subtotal), 185, yPos, { align: 'right' });
    yPos += 12;
    
    // Tax
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Tax (${invoice.taxRate ? parseFloat(invoice.taxRate).toFixed(1) : '0'}%):`, totalsX, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(this.formatCurrency(invoice.taxAmount), 185, yPos, { align: 'right' });
      yPos += 12;
    }
    
    // Discount
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...accentRgb);
      doc.text(`Discount (${invoice.discountRate ? parseFloat(invoice.discountRate).toFixed(1) : '0'}%):`, totalsX, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, 185, yPos, { align: 'right' });
      yPos += 12;
    }

    // TOTAL - Clear and prominent
    yPos += 5;
    doc.setFillColor(...accentRgb);
    doc.rect(totalsX, yPos - 3, 70, 16, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX + 5, yPos + 8);
    doc.setFontSize(14);
    doc.text(this.formatCurrency(invoice.total), 185, yPos + 8, { align: 'right' });

    // NOTES SECTION - If present
    if (invoice.notes) {
      yPos += 25;
      doc.setTextColor(...secondaryRgb);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES:', 20, yPos);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n').slice(0, 2);
      noteLines.forEach((line, index) => {
        const truncatedLine = line.length > 80 ? line.substring(0, 80) + '...' : line;
        doc.text(truncatedLine, 20, yPos + 10 + (index * 6));
      });
    }

    // FOOTER - Always visible at bottom
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 105, 270, { align: 'center' });
  }
}