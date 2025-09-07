import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ModernTemplate extends BaseTemplate {
  name = 'modern';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Modern header with colored stripe
    doc.setFillColor(...primaryRgb);
    doc.rect(0, 0, 210, 15, 'F');

    // Logo or company icon
    if (config.logo) {
      this.addLogo(doc, config, 20, 35, 40, 15);
    } else {
      doc.setFillColor(...primaryRgb);
      doc.rect(20, 20, 15, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('INVOICE', 27.5, 30, { align: 'center' });
    }

    // Company info with modern spacing
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.title);
    doc.text(user.businessName || `${user.firstName} ${user.lastName}`, 40, 30);
    
    doc.setFontSize(config.fonts.small);
    doc.setTextColor(100, 100, 100);
    let yPos = 40;
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 40, yPos + (index * 5));
      });
      yPos += addressLines.length * 5 + 5;
    }
    
    if (user.email) doc.text(user.email, 40, yPos);
    if (user.businessPhone) doc.text(user.businessPhone, 40, yPos + 5);

    // Modern invoice details box
    doc.setFillColor(248, 249, 250);
    doc.rect(140, 20, 50, 35, 'F');
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.header);
    doc.text('INVOICE', 165, 30, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.small);
    doc.text(`#${invoice.invoiceNumber}`, 145, 40);
    doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 145, 45);
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 145, 50);

    // Bill To section with modern styling
    yPos = 75;
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(config.fonts.body);
    doc.text('BILL TO', 20, yPos);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.body);
    doc.text(invoice.client.name, 20, yPos + 10);
    
    doc.setFontSize(config.fonts.small);
    doc.setTextColor(100, 100, 100);
    if (invoice.client.address) {
      const clientAddressLines = this.splitAddress(invoice.client.address);
      clientAddressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + 20 + (index * 5));
      });
      yPos += clientAddressLines.length * 5 + 20;
    } else {
      yPos += 20;
    }
    doc.text(invoice.client.email, 20, yPos);

    // Modern table design
    yPos = 120;
    doc.setFillColor(...primaryRgb);
    doc.rect(20, yPos, 170, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(config.fonts.small);
    doc.text('DESCRIPTION', 25, yPos + 7);
    doc.text('QTY', 120, yPos + 7);
    doc.text('RATE', 140, yPos + 7);
    doc.text('AMOUNT', 165, yPos + 7);

    // Items with alternating row colors
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    
    invoice.items.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPos - 5, 170, 10, 'F');
      }
      
      doc.text(item.description, 25, yPos);
      doc.text(item.quantity, 120, yPos);
      doc.text(this.formatCurrency(item.rate), 140, yPos);
      doc.text(this.formatCurrency(item.amount), 165, yPos);
      yPos += 10;
    });

    // Modern totals section
    yPos += 10;
    const totalsX = 140;
    
    doc.setFontSize(config.fonts.small);
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(this.formatCurrency(invoice.subtotal), 175, yPos);
    yPos += 8;
    
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.text(`Tax (${parseFloat(invoice.taxRate || '0').toFixed(1)}%):`, totalsX, yPos);
      doc.text(this.formatCurrency(invoice.taxAmount), 175, yPos);
      yPos += 8;
    }
    
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.text(`Discount (${parseFloat(invoice.discountRate || '0').toFixed(1)}%):`, totalsX, yPos);
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, 175, yPos);
      yPos += 8;
    }

    // Total with accent color
    doc.setFillColor(...accentRgb);
    doc.rect(totalsX - 5, yPos - 2, 55, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(config.fonts.body);
    doc.text('TOTAL:', totalsX, yPos + 5);
    doc.text(this.formatCurrency(invoice.total), 175, yPos + 5);

    // Payment terms and notes
    if (invoice.notes) {
      yPos += 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(config.fonts.small);
      doc.text('Notes:', 20, yPos);
      const noteLines = invoice.notes.split('\n');
      noteLines.forEach((line, index) => {
        doc.text(line, 20, yPos + 10 + (index * 5));
      });
    }
  }
}