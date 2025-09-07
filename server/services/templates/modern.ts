import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ModernTemplate extends BaseTemplate {
  name = 'modern';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Modern geometric header with gradient effect
    doc.setFillColor(...primaryRgb);
    doc.rect(0, 0, 210, 25, 'F');
    
    // Add subtle secondary color accent
    doc.setFillColor(...secondaryRgb);
    doc.rect(0, 25, 210, 3, 'F');

    // Premium logo placement with better sizing
    this.addLogo(doc, config, 20, 45, 50, 25);

    // Company info with professional typography
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.title + 2);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName} ${user.lastName}`;
    doc.text(companyName, 80, 40);
    
    // Elegant company details
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let yPos = 50;
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 80, yPos + (index * 4));
      });
      yPos += addressLines.length * 4 + 4;
    }
    
    if (user.email) {
      doc.text(user.email, 80, yPos);
      yPos += 4;
    }
    if (user.businessPhone) doc.text(user.businessPhone, 80, yPos);
    if (user.taxId) {
      doc.setTextColor(120, 120, 120);
      doc.text(`Tax ID: ${user.taxId}`, 80, yPos + 4);
    }

    // Modern invoice details card
    doc.setFillColor(250, 251, 252);
    doc.roundedRect(140, 35, 60, 45, 4, 4, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(140, 35, 60, 45, 4, 4, 'S');
    
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.header);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 170, 50, { align: 'center' });
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    doc.text(`# ${invoice.invoiceNumber}`, 145, 60);
    doc.text(`Issued: ${new Date(invoice.issueDate).toLocaleDateString()}`, 145, 65);
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 145, 70);

    // Stylish Bill To section
    yPos = 100;
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 20, yPos);
    
    // Accent line under "BILL TO"
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(2);
    doc.line(20, yPos + 2, 50, yPos + 2);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 20, yPos + 12);
    
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    yPos += 20;
    
    if (invoice.client.address) {
      const clientAddressLines = this.splitAddress(invoice.client.address);
      clientAddressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 4));
      });
      yPos += clientAddressLines.length * 4 + 4;
    }
    doc.text(invoice.client.email, 20, yPos);
    if (invoice.client.phone) doc.text(invoice.client.phone, 20, yPos + 4);

    // Professional table with modern styling
    yPos = 150;
    
    // Table header with gradient-like effect
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(20, yPos, 170, 12, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, yPos + 8);
    doc.text('QTY', 120, yPos + 8, { align: 'center' });
    doc.text('RATE', 140, yPos + 8, { align: 'center' });
    doc.text('AMOUNT', 175, yPos + 8, { align: 'right' });

    // Items with premium styling
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      // Alternating row backgrounds with subtle styling
      if (index % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(20, yPos - 4, 170, 10, 1, 1, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(config.fonts.small);
      doc.text(item.description, 25, yPos + 2);
      doc.text(item.quantity, 120, yPos + 2, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 140, yPos + 2, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 175, yPos + 2, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 12;
    });

    // Premium totals section with card styling
    yPos += 15;
    const totalsX = 110;
    const totalsWidth = 80;
    
    // Totals background card
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 35, 3, 3, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 35, 3, 3, 'S');
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal:', totalsX + 5, yPos + 5);
    doc.text(this.formatCurrency(invoice.subtotal), totalsX + totalsWidth - 5, yPos + 5, { align: 'right' });
    yPos += 7;
    
    // Tax
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.text(`Tax (${parseFloat(invoice.taxRate || '0').toFixed(1)}%):`, totalsX + 5, yPos);
      doc.text(this.formatCurrency(invoice.taxAmount), totalsX + totalsWidth - 5, yPos, { align: 'right' });
      yPos += 7;
    }
    
    // Discount
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setTextColor(...accentRgb);
      doc.text(`Discount (${parseFloat(invoice.discountRate || '0').toFixed(1)}%):`, totalsX + 5, yPos);
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, totalsX + totalsWidth - 5, yPos, { align: 'right' });
      yPos += 7;
    }

    // Total with premium styling
    doc.setFillColor(...accentRgb);
    doc.roundedRect(totalsX, yPos, totalsWidth, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX + 5, yPos + 8);
    doc.text(this.formatCurrency(invoice.total), totalsX + totalsWidth - 5, yPos + 8, { align: 'right' });

    // Notes section with modern styling
    if (invoice.notes) {
      yPos += 25;
      doc.setTextColor(...secondaryRgb);
      doc.setFontSize(config.fonts.small + 1);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 20, yPos);
      
      // Accent line
      doc.setDrawColor(...accentRgb);
      doc.setLineWidth(1.5);
      doc.line(20, yPos + 2, 40, yPos + 2);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(config.fonts.small);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n');
      noteLines.forEach((line, index) => {
        doc.text(line, 20, yPos + 10 + (index * 5));
      });
    }

    // Footer with subtle branding
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  }
}