import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ClassicTemplate extends BaseTemplate {
  name = 'classic';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);

    // Classic header with underline
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.header);
    doc.text('INVOICE', 20, 30);
    doc.setLineWidth(1);
    doc.setDrawColor(...primaryRgb);
    doc.line(20, 35, 80, 35);

    // Logo placement (traditional top-right)
    if (config.logo) {
      this.addLogo(doc, config, 150, 35, 40, 20);
    }

    // Traditional business letterhead layout
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.title);
    doc.text(user.businessName || `${user.firstName} ${user.lastName}`, 20, 50);
    
    doc.setFontSize(config.fonts.small);
    let yPos = 60;
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 5));
      });
      yPos += addressLines.length * 5 + 5;
    }
    
    if (user.email) doc.text(`Email: ${user.email}`, 20, yPos);
    if (user.businessPhone) doc.text(`Phone: ${user.businessPhone}`, 20, yPos + 5);
    if (user.taxId) doc.text(`Tax ID: ${user.taxId}`, 20, yPos + 10);

    // Traditional invoice details (right aligned)
    const detailsX = 140;
    doc.setFontSize(config.fonts.small);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, detailsX, 50);
    doc.text(`Invoice Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, detailsX, 60);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, detailsX, 70);

    // Bill To section with traditional formatting
    yPos = 100;
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(config.fonts.body);
    doc.text('BILL TO:', 20, yPos);
    
    // Underline for Bill To
    doc.setLineWidth(0.5);
    doc.setDrawColor(...secondaryRgb);
    doc.line(20, yPos + 2, 60, yPos + 2);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.body);
    doc.text(invoice.client.name, 20, yPos + 15);
    
    doc.setFontSize(config.fonts.small);
    if (invoice.client.address) {
      const clientAddressLines = this.splitAddress(invoice.client.address);
      clientAddressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + 25 + (index * 5));
      });
      yPos += clientAddressLines.length * 5 + 25;
    } else {
      yPos += 25;
    }
    doc.text(invoice.client.email, 20, yPos);

    // Classic table with borders
    yPos = 150;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    
    // Table header
    doc.rect(20, yPos, 170, 10);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos, 170, 10, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.small);
    doc.text('Description', 25, yPos + 7);
    doc.text('Qty', 120, yPos + 7);
    doc.text('Rate', 140, yPos + 7);
    doc.text('Amount', 165, yPos + 7);

    // Vertical lines for table columns
    doc.line(115, yPos, 115, yPos + 10 + (invoice.items.length * 10));
    doc.line(135, yPos, 135, yPos + 10 + (invoice.items.length * 10));
    doc.line(155, yPos, 155, yPos + 10 + (invoice.items.length * 10));

    // Items with borders
    yPos += 10;
    invoice.items.forEach((item, index) => {
      doc.rect(20, yPos, 170, 10);
      doc.text(item.description, 25, yPos + 7);
      doc.text(item.quantity, 120, yPos + 7, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 140, yPos + 7, { align: 'center' });
      doc.text(this.formatCurrency(item.amount), 165, yPos + 7, { align: 'center' });
      yPos += 10;
    });

    // Traditional totals section
    yPos += 20;
    const totalsX = 120;
    
    // Lines for totals
    doc.setLineWidth(0.3);
    
    doc.setFontSize(config.fonts.small);
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(this.formatCurrency(invoice.subtotal), 175, yPos, { align: 'right' });
    doc.line(totalsX, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.text(`Tax (${parseFloat(invoice.taxRate || '0').toFixed(1)}%):`, totalsX, yPos);
      doc.text(this.formatCurrency(invoice.taxAmount), 175, yPos, { align: 'right' });
      doc.line(totalsX, yPos + 2, 190, yPos + 2);
      yPos += 10;
    }
    
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.text(`Discount (${parseFloat(invoice.discountRate || '0').toFixed(1)}%):`, totalsX, yPos);
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, 175, yPos, { align: 'right' });
      doc.line(totalsX, yPos + 2, 190, yPos + 2);
      yPos += 10;
    }

    // Total with double underline (classic accounting style)
    doc.setFontSize(config.fonts.body);
    doc.setTextColor(...primaryRgb);
    doc.text('TOTAL:', totalsX, yPos);
    doc.text(this.formatCurrency(invoice.total), 175, yPos, { align: 'right' });
    doc.setLineWidth(0.5);
    doc.line(totalsX, yPos + 2, 190, yPos + 2);
    doc.line(totalsX, yPos + 4, 190, yPos + 4);

    // Notes section in box
    if (invoice.notes) {
      yPos += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(config.fonts.small);
      doc.rect(20, yPos, 170, 25);
      
      doc.text('Notes:', 25, yPos + 8);
      const noteLines = invoice.notes.split('\n').slice(0, 3); // Limit lines in classic template
      noteLines.forEach((line, index) => {
        doc.text(line, 25, yPos + 15 + (index * 5));
      });
    }
  }
}