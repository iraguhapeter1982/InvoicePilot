import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ClassicTemplate extends BaseTemplate {
  name = 'classic';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Professional classic header with elegant styling
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.header + 4);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 35);
    
    // Sophisticated underline with color gradient effect
    doc.setLineWidth(3);
    doc.setDrawColor(...primaryRgb);
    doc.line(20, 40, 90, 40);
    doc.setLineWidth(1);
    doc.setDrawColor(...secondaryRgb);
    doc.line(20, 42, 90, 42);

    // Premium logo placement (traditional top-right with better sizing)
    this.addLogo(doc, config, 135, 50, 55, 25);

    // Traditional business letterhead with refined typography
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.title + 1);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName} ${user.lastName}`;
    doc.text(companyName, 20, 55);
    
    // Elegant address and contact information
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    let yPos = 65;
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 4));
      });
      yPos += addressLines.length * 4 + 4;
    }
    
    if (user.email) {
      doc.text(`Email: ${user.email}`, 20, yPos);
      yPos += 4;
    }
    if (user.businessPhone) {
      doc.text(`Phone: ${user.businessPhone}`, 20, yPos);
      yPos += 4;
    }
    if (user.taxId) {
      doc.setTextColor(100, 100, 100);
      doc.text(`Tax ID: ${user.taxId}`, 20, yPos);
    }

    // Professional invoice details with enhanced formatting
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(135, 60, 60, 35, 2, 2, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(135, 60, 60, 35, 2, 2, 'S');
    
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details', 140, 70);
    
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Number: ${invoice.invoiceNumber}`, 140, 78);
    doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 140, 84);
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 140, 90);

    // Refined Bill To section with professional styling
    yPos = 110;
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, yPos);
    
    // Enhanced underline with accent color
    doc.setLineWidth(2);
    doc.setDrawColor(...accentRgb);
    doc.line(20, yPos + 3, 65, yPos + 3);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 20, yPos + 15);
    
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    yPos += 24;
    
    if (invoice.client.address) {
      const clientAddressLines = this.splitAddress(invoice.client.address);
      clientAddressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 4));
      });
      yPos += clientAddressLines.length * 4 + 4;
    }
    doc.text(invoice.client.email, 20, yPos);
    if (invoice.client.phone) doc.text(invoice.client.phone, 20, yPos + 4);

    // Enhanced classic table with refined borders and styling
    yPos = 165;
    
    // Professional table header
    doc.setFillColor(...primaryRgb);
    doc.rect(20, yPos, 170, 12, 'F');
    doc.setDrawColor(...secondaryRgb);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos, 170, 12, 'S');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, yPos + 8);
    doc.text('Qty', 120, yPos + 8, { align: 'center' });
    doc.text('Rate', 140, yPos + 8, { align: 'center' });
    doc.text('Amount', 175, yPos + 8, { align: 'right' });

    // Enhanced vertical separators
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    const tableHeight = 12 + (invoice.items.length * 10);
    doc.line(115, yPos, 115, yPos + tableHeight);
    doc.line(135, yPos, 135, yPos + tableHeight);
    doc.line(155, yPos, 155, yPos + tableHeight);

    // Items with professional styling
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      // Subtle alternating backgrounds
      if (index % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(20, yPos, 170, 10, 'F');
      }
      
      // Professional borders
      doc.setDrawColor(235, 235, 235);
      doc.setLineWidth(0.2);
      doc.rect(20, yPos, 170, 10, 'S');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(config.fonts.small);
      doc.text(item.description, 25, yPos + 7);
      doc.text(item.quantity, 120, yPos + 7, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 140, yPos + 7, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 175, yPos + 7, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 10;
    });

    // Professional totals section with enhanced styling
    yPos += 15;
    const totalsX = 115;
    const totalsWidth = 75;
    
    // Totals background with subtle styling
    doc.setFillColor(250, 250, 251);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 40, 2, 2, 'F');
    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.5);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 40, 2, 2, 'S');
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(config.fonts.small);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal with elegant lines
    doc.text('Subtotal:', totalsX + 5, yPos + 5);
    doc.text(this.formatCurrency(invoice.subtotal), totalsX + totalsWidth - 5, yPos + 5, { align: 'right' });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(totalsX + 5, yPos + 7, totalsX + totalsWidth - 5, yPos + 7);
    yPos += 10;
    
    // Tax
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.text(`Tax (${parseFloat(invoice.taxRate || '0').toFixed(1)}%):`, totalsX + 5, yPos);
      doc.text(this.formatCurrency(invoice.taxAmount), totalsX + totalsWidth - 5, yPos, { align: 'right' });
      doc.line(totalsX + 5, yPos + 2, totalsX + totalsWidth - 5, yPos + 2);
      yPos += 8;
    }
    
    // Discount with accent color
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setTextColor(...accentRgb);
      doc.text(`Discount (${parseFloat(invoice.discountRate || '0').toFixed(1)}%):`, totalsX + 5, yPos);
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, totalsX + totalsWidth - 5, yPos, { align: 'right' });
      doc.setDrawColor(...accentRgb);
      doc.line(totalsX + 5, yPos + 2, totalsX + totalsWidth - 5, yPos + 2);
      yPos += 8;
    }

    // Total with classic double underline styling
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(totalsX, yPos, totalsWidth, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX + 5, yPos + 8);
    doc.text(this.formatCurrency(invoice.total), totalsX + totalsWidth - 5, yPos + 8, { align: 'right' });

    // Enhanced notes section with professional styling
    if (invoice.notes) {
      yPos += 25;
      doc.setFillColor(252, 252, 253);
      doc.roundedRect(20, yPos, 170, 30, 3, 3, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, yPos, 170, 30, 3, 3, 'S');
      
      doc.setTextColor(...secondaryRgb);
      doc.setFontSize(config.fonts.small + 1);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 25, yPos + 10);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(config.fonts.small);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n').slice(0, 3);
      noteLines.forEach((line, index) => {
        doc.text(line, 25, yPos + 18 + (index * 4));
      });
    }

    // Professional footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Thank you for choosing our services', 105, 280, { align: 'center' });
  }
}