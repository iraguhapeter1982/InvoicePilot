import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class MinimalTemplate extends BaseTemplate {
  name = 'minimal';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Ultra-clean minimal header with refined typography
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.header + 2);
    doc.setFont('helvetica', 'normal');
    doc.text('Invoice', 20, 35);

    // Elegant subtle accent line
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(1.5);
    doc.line(20, 40, 60, 40);

    // Sophisticated logo placement with perfect proportions
    this.addLogo(doc, config, 150, 50, 40, 20);

    // Clean company branding with perfect spacing
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.title);
    doc.setFont('helvetica', 'normal');
    const companyName = user.businessName || `${user.firstName} ${user.lastName}`;
    doc.text(companyName, 20, 55);
    
    // Minimal but elegant contact info
    doc.setFontSize(config.fonts.small);
    doc.setTextColor(100, 100, 100);
    let contactDetails = [];
    if (user.email) contactDetails.push(user.email);
    if (user.businessPhone) contactDetails.push(user.businessPhone);
    if (contactDetails.length > 0) {
      doc.text(contactDetails.join(' • '), 20, 63);
    }

    // Clean invoice metadata with modern spacing
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(config.fonts.small);
    doc.text(`Invoice ${invoice.invoiceNumber}`, 20, 80);
    doc.text(`${new Date(invoice.issueDate).toLocaleDateString()}`, 20, 88);
    doc.setTextColor(...secondaryRgb);
    doc.text(`Due ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 96);

    // Sophisticated bill to section
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.small);
    doc.text('Billed to', 20, 115);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 20, 125);
    
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let clientY = 133;
    if (invoice.client.address) {
      const addressLines = this.splitAddress(invoice.client.address);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, clientY + (index * 4));
      });
      clientY += addressLines.length * 4 + 2;
    }
    doc.text(invoice.client.email, 20, clientY);

    // Ultra-clean table with perfect alignment
    let yPos = 160;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    doc.text('Description', 20, yPos);
    doc.text('Qty', 130, yPos, { align: 'center' });
    doc.text('Rate', 150, yPos, { align: 'center' });
    doc.text('Amount', 180, yPos, { align: 'right' });

    // Refined separator with accent color
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 4, 180, yPos + 4);

    // Items with perfect minimal spacing
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      doc.setFontSize(config.fonts.small);
      doc.text(item.description, 20, yPos);
      doc.text(item.quantity, 130, yPos, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 150, yPos, { align: 'center' });
      
      // Emphasize amounts
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 180, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 14;
    });

    // Elegant totals section - minimal but impactful
    yPos += 10;
    
    // Subtle background for totals
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(125, yPos - 5, 60, 30, 2, 2, 'F');
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(config.fonts.small);
    
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.text('Tax:', 130, yPos);
      doc.text(this.formatCurrency(invoice.taxAmount), 180, yPos, { align: 'right' });
      yPos += 7;
    }
    
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setTextColor(...accentRgb);
      doc.text('Discount:', 130, yPos);
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, 180, yPos, { align: 'right' });
      yPos += 7;
    }

    // Total with sophisticated styling
    yPos += 5;
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 130, yPos);
    doc.setTextColor(...accentRgb);
    doc.setFontSize(config.fonts.title);
    doc.text(this.formatCurrency(invoice.total), 180, yPos, { align: 'right' });

    // Minimal notes with perfect typography
    if (invoice.notes) {
      yPos += 25;
      doc.setTextColor(...secondaryRgb);
      doc.setFontSize(config.fonts.small);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 20, yPos);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(config.fonts.small);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n').slice(0, 4);
      noteLines.forEach((line, index) => {
        doc.text(line, 20, yPos + 10 + (index * 6));
      });
    }

    // Subtle footer
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you', 105, 280, { align: 'center' });
  }
}