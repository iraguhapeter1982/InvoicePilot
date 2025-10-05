import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ClassicTemplate extends BaseTemplate {
  name = 'classic';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // CLASSIC BUSINESS HEADER - Centered layout
    this.createClassicHeader(doc, invoice, user, config, primaryRgb, secondaryRgb);
    
    // BUSINESS SECTIONS - From/Bill To side by side
    this.createBusinessSections(doc, invoice, user, primaryRgb, secondaryRgb);
    
    // FORMAL TABLE - Ruled borders
    this.createFormalTable(doc, invoice, primaryRgb, secondaryRgb);
    
    // TOTALS SECTION - Right aligned with bold line
    this.createTotalsSection(doc, invoice, primaryRgb, accentRgb);
    
    // TERMS & CONDITIONS FOOTER
    this.createTermsFooter(doc, invoice, user, primaryRgb, accentRgb);
  }

  private createClassicHeader(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig, primaryRgb: [number, number, number], secondaryRgb: [number, number, number]) {
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Your Business';
    
    // Centered Company Logo
    if (config.logo) {
      this.addLogo(doc, config, 85, 40, 40, 25);
    } else {
      // Logo placeholder - centered
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(85, 15, 40, 25, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.roundedRect(85, 15, 40, 25, 3, 3, 'S');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('COMPANY LOGO', 105, 30, { align: 'center' });
    }
    
    // Centered Company Name (Traditional Serif style using bold formatting)
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 105, 50, { align: 'center' });
    
    // Centered Company Address
    let yPos = 58;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (user.businessAddress) {
      const addressLines = user.businessAddress.split('\n');
      addressLines.forEach(line => {
        doc.text(line, 105, yPos, { align: 'center' });
        yPos += 5;
      });
    }
    
    if (user.email) {
      doc.text(`Email: ${user.email}`, 105, yPos, { align: 'center' });
      yPos += 5;
    }
    
    if (user.businessPhone) {
      doc.text(`Phone: ${user.businessPhone}`, 105, yPos, { align: 'center' });
      yPos += 5;
    }
    
    // Decorative line under header
    doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setLineWidth(2);
    doc.line(30, yPos + 8, 180, yPos + 8);
    doc.setDrawColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
    doc.setLineWidth(1);
    doc.line(40, yPos + 10, 170, yPos + 10);
    
    // INVOICE Title - Centered and prominent
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, yPos + 25, { align: 'center' });
    
    // Invoice details below title
    yPos += 35;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 105, yPos, { align: 'center' });
    yPos += 6;
    doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 105, yPos, { align: 'center' });
    yPos += 6;
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 105, yPos, { align: 'center' });
  }

  private createBusinessSections(doc: jsPDF, invoice: InvoiceWithDetails, user: User, primaryRgb: [number, number, number], secondaryRgb: [number, number, number]) {
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Your Business';
    const startY = 120;
    
    // FROM Section (Left side)
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', 25, startY);
    
    // Underline for FROM
    doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setLineWidth(1.5);
    doc.line(25, startY + 2, 55, startY + 2);
    
    let fromY = startY + 12;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 25, fromY);
    
    fromY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    if (user.businessAddress) {
      const addressLines = user.businessAddress.split('\n');
      addressLines.forEach(line => {
        doc.text(line, 25, fromY);
        fromY += 5;
      });
    }
    
    if (user.email) {
      doc.text(user.email, 25, fromY);
      fromY += 5;
    }
    
    if (user.businessPhone) {
      doc.text(user.businessPhone, 25, fromY);
    }
    
    // BILL TO Section (Right side)
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 120, startY);
    
    // Underline for BILL TO
    doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setLineWidth(1.5);
    doc.line(120, startY + 2, 160, startY + 2);
    
    let toY = startY + 12;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name || 'Client Name', 120, toY);
    
    toY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    if (invoice.client.email) {
      doc.text(invoice.client.email, 120, toY);
      toY += 5;
    }
    
    if (invoice.client.address) {
      const addressLines = invoice.client.address.split('\n');
      addressLines.forEach(line => {
        doc.text(line, 120, toY);
        toY += 5;
      });
    }
    
    if (invoice.client.phone) {
      doc.text(invoice.client.phone, 120, toY);
    }
  }

  private createFormalTable(doc: jsPDF, invoice: InvoiceWithDetails, primaryRgb: [number, number, number], secondaryRgb: [number, number, number]) {
    const startY = 170;
    const tableWidth = 170;
    const headerHeight = 15;
    const rowHeight = 12;
    
    // Table border - formal ruled style
    doc.setDrawColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
    doc.setLineWidth(2);
    doc.rect(20, startY, tableWidth, headerHeight + (invoice.items.length * rowHeight), 'S');
    
    // Header background - traditional dark header
    doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.rect(20, startY, tableWidth, headerHeight, 'F');
    
    // Header text - white text on dark background
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    const headerY = startY + 10;
    doc.text('DESCRIPTION', 25, headerY);
    doc.text('QTY', 120, headerY, { align: 'center' });
    doc.text('UNIT PRICE', 145, headerY, { align: 'center' });
    doc.text('AMOUNT', 185, headerY, { align: 'right' });
    
    // Vertical column separators - traditional ruled format
    doc.setDrawColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
    doc.setLineWidth(1);
    const totalTableHeight = headerHeight + (invoice.items.length * rowHeight);
    doc.line(115, startY, 115, startY + totalTableHeight); // After Description
    doc.line(140, startY, 140, startY + totalTableHeight); // After Qty
    doc.line(165, startY, 165, startY + totalTableHeight); // After Unit Price
    
    // Table rows with formal styling
    let currentY = startY + headerHeight;
    
    invoice.items.forEach((item, index) => {
      // Alternating row backgrounds - subtle
      if (index % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, currentY, tableWidth, rowHeight, 'F');
      }
      
      // Horizontal row separators
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(20, currentY, 190, currentY);
      
      // Row content
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const itemY = currentY + 8;
      // Description - truncate if too long
      const description = item.description.length > 45 ? item.description.substring(0, 45) + '...' : item.description;
      doc.text(description, 25, itemY);
      
      // Quantity - centered
      doc.text(item.quantity.toString(), 120, itemY, { align: 'center' });
      
      // Unit Price - centered
      doc.text(this.formatCurrency(parseFloat(item.rate)), 145, itemY, { align: 'center' });
      
      // Amount - right aligned and bold
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(parseFloat(item.amount)), 185, itemY, { align: 'right' });
      
      currentY += rowHeight;
    });
    
    // Final bottom border
    doc.setDrawColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
    doc.setLineWidth(2);
    doc.line(20, currentY, 190, currentY);
  }

  private createTotalsSection(doc: jsPDF, invoice: InvoiceWithDetails, primaryRgb: [number, number, number], accentRgb: [number, number, number]) {
    const startY = 185 + (invoice.items.length * 12);
    const totalsX = 120;
    const totalsWidth = 70;
    
    // Bold line above totals section
    doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setLineWidth(2);
    doc.line(totalsX, startY, totalsX + totalsWidth, startY);
    
    let currentY = startY + 10;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    
    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(parseFloat(invoice.subtotal)), totalsX + totalsWidth, currentY, { align: 'right' });
    currentY += 8;
    
    // Tax (if applicable)
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Tax (${invoice.taxRate || '0'}%):`, totalsX, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(parseFloat(invoice.taxAmount)), totalsX + totalsWidth, currentY, { align: 'right' });
      currentY += 8;
    }
    
    // Discount (if applicable)
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Discount (${invoice.discountRate || '0'}%):`, totalsX, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${this.formatCurrency(parseFloat(invoice.discountAmount))}`, totalsX + totalsWidth, currentY, { align: 'right' });
      currentY += 8;
    }
    
    // Bold line before total
    doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setLineWidth(1.5);
    doc.line(totalsX, currentY + 2, totalsX + totalsWidth, currentY + 2);
    currentY += 8;
    
    // Grand Total - prominent
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX, currentY);
    doc.setFontSize(16);
    doc.text(this.formatCurrency(parseFloat(invoice.total)), totalsX + totalsWidth, currentY, { align: 'right' });
    
    // Double underline for total
    doc.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.setLineWidth(2);
    doc.line(totalsX, currentY + 3, totalsX + totalsWidth, currentY + 3);
    doc.setLineWidth(1);
    doc.line(totalsX, currentY + 5, totalsX + totalsWidth, currentY + 5);
  }

  private createTermsFooter(doc: jsPDF, invoice: InvoiceWithDetails, user: User, primaryRgb: [number, number, number], accentRgb: [number, number, number]) {
    const footerY = 240 + (invoice.items.length * 12);
    
    // Terms & Conditions Section
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', 25, footerY);
    
    // Terms content
    let termsY = footerY + 8;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const dueDays = Math.ceil((new Date(invoice.dueDate).getTime() - new Date(invoice.issueDate).getTime()) / (1000 * 60 * 60 * 24));
    
    const terms = [
      `• Payment is due within ${dueDays} days of invoice date.`,
      '• Late payments may incur additional charges.',
      '• Please remit payment to the address listed above.',
      '• For questions regarding this invoice, please contact us.',
    ];
    
    terms.forEach(term => {
      doc.text(term, 25, termsY);
      termsY += 5;
    });
    
    // Notes section (if any)
    if (invoice.notes && invoice.notes.trim()) {
      termsY += 8;
      doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES:', 25, termsY);
      
      termsY += 6;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.notes, 25, termsY);
    }
    
    // Traditional footer signature line
    termsY += 20;
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for your business!', 105, termsY, { align: 'center' });
    
    // Decorative footer line
    doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setLineWidth(1);
    doc.line(50, termsY + 5, 160, termsY + 5);
  }
}