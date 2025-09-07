import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ModernTemplate extends BaseTemplate {
  name = 'modern';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Modern header with sophisticated gradient band
    doc.setFillColor(...primaryRgb);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Accent gradient effect
    doc.setFillColor(...secondaryRgb);
    doc.rect(0, 28, 210, 7, 'F');

    // Large, bold INVOICE title in header - repositioned to avoid overlap
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 25);

    // Modern card for invoice details - repositioned to avoid header overlap
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(125, 45, 70, 55, 8, 8, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(1);
    doc.roundedRect(125, 45, 70, 55, 8, 8, 'S');
    
    // Invoice details with clean typography
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${invoice.invoiceNumber}`, 130, 62);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Issue Date:', 130, 74);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 130, 82);
    
    doc.setTextColor(100, 100, 100);
    doc.text('Due Date:', 130, 90);
    doc.setTextColor(...accentRgb);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(invoice.dueDate).toLocaleDateString(), 130, 98);

    // Logo positioned to not overlap with company info
    this.addLogo(doc, config, 20, 50, 70, 35);

    // Company information positioned below logo with proper spacing
    let yPos = 95;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`;
    doc.text(companyName, 20, yPos);
    
    // Company details with clean spacing
    yPos += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 5));
      });
      yPos += addressLines.length * 5 + 6;
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

    // Modern Bill To section with card design - adjusted position
    yPos = 140;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, yPos, 85, 45, 6, 6, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, 85, 45, 6, 6, 'S');
    
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 25, yPos + 12);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 25, yPos + 22);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let clientYPos = yPos + 30;
    
    if (invoice.client.address) {
      const clientAddressLines = this.splitAddress(invoice.client.address);
      clientAddressLines.slice(0, 1).forEach((line, index) => {
        doc.text(line.length > 25 ? line.substring(0, 25) + '...' : line, 25, clientYPos + (index * 4));
      });
      clientYPos += 5;
    }
    doc.text(invoice.client.email.length > 25 ? invoice.client.email.substring(0, 25) + '...' : invoice.client.email, 25, clientYPos);

    // Modern table design - adjusted for better spacing
    yPos = 200;
    
    // Table header with gradient
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(20, yPos, 170, 15, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, yPos + 10);
    doc.text('QTY', 120, yPos + 10, { align: 'center' });
    doc.text('RATE', 140, yPos + 10, { align: 'center' });
    doc.text('AMOUNT', 180, yPos + 10, { align: 'right' });

    // Table items with modern styling
    yPos += 18;
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      // Alternating backgrounds
      if (index % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(20, yPos - 3, 170, 14, 2, 2, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(item.description.length > 35 ? item.description.substring(0, 35) + '...' : item.description, 25, yPos + 7);
      doc.text(item.quantity, 120, yPos + 7, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 140, yPos + 7, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 180, yPos + 7, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 14;
    });

    // Modern totals section
    yPos += 15;
    const totalsX = 120;
    const totalsWidth = 70;
    
    // Totals container
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(1);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 45, 4, 4, 'S');
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal:', totalsX + 5, yPos + 8);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(invoice.subtotal), totalsX + totalsWidth - 5, yPos + 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    yPos += 12;
    
    // Tax
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.text(`Tax (${invoice.taxRate ? parseFloat(invoice.taxRate).toFixed(1) : '0'}%):`, totalsX + 5, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(invoice.taxAmount), totalsX + totalsWidth - 5, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      yPos += 12;
    }
    
    // Discount
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setTextColor(...accentRgb);
      doc.text(`Discount (${invoice.discountRate ? parseFloat(invoice.discountRate).toFixed(1) : '0'}%):`, totalsX + 5, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, totalsX + totalsWidth - 5, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      yPos += 12;
    }

    // Total with prominent styling
    doc.setFillColor(...accentRgb);
    doc.roundedRect(totalsX, yPos, totalsWidth, 18, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX + 5, yPos + 12);
    doc.setFontSize(16);
    doc.text(this.formatCurrency(invoice.total), totalsX + totalsWidth - 5, yPos + 12, { align: 'right' });

    // Notes section
    if (invoice.notes) {
      yPos += 35;
      doc.setFillColor(250, 251, 252);
      doc.roundedRect(20, yPos, 170, 25, 4, 4, 'F');
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, yPos, 170, 25, 4, 4, 'S');
      
      doc.setTextColor(...primaryRgb);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES', 25, yPos + 12);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n').slice(0, 2);
      noteLines.forEach((line, index) => {
        const truncatedLine = line.length > 80 ? line.substring(0, 80) + '...' : line;
        doc.text(truncatedLine, 25, yPos + 18 + (index * 4));
      });
    }

    // Modern footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text('Thank you for your business!', 105, 285, { align: 'center' });
  }
}