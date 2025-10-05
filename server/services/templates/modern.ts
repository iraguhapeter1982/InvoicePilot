import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ModernTemplate extends BaseTemplate {
  name = 'modern';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Set default font
    doc.setFont('helvetica');
    
    // MODERN HEADER SECTION
    this.createModernHeader(doc, invoice, primaryRgb, secondaryRgb);
    
    // COMPANY AND INVOICE INFO
    this.createHeaderInfo(doc, invoice, user, config, primaryRgb);
    
    // BILLING SECTION (FROM/TO)
    this.createBillingSection(doc, invoice, user, secondaryRgb);
    
    // ITEMS TABLE
    this.createModernTable(doc, invoice, primaryRgb, secondaryRgb);
    
    // TOTALS SECTION
    this.createTotalsSection(doc, invoice, accentRgb);
    
    // FOOTER SECTION
    this.createFooterSection(doc, invoice, user, accentRgb);
  }

  private createModernHeader(doc: jsPDF, invoice: InvoiceWithDetails, primaryRgb: [number, number, number], secondaryRgb: [number, number, number]) {
    // Create gradient effect with multiple rectangles
    for (let i = 0; i < 30; i++) {
      const ratio = i / 29;
      const r = Math.round(primaryRgb[0] + (secondaryRgb[0] - primaryRgb[0]) * ratio);
      const g = Math.round(primaryRgb[1] + (secondaryRgb[1] - primaryRgb[1]) * ratio);
      const b = Math.round(primaryRgb[2] + (secondaryRgb[2] - primaryRgb[2]) * ratio);
      
      doc.setFillColor(r, g, b);
      doc.rect(0, i, 210, 1, 'F');
    }
    
    // Add subtle overlay
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 10, 'F');
  }

  private createHeaderInfo(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig, primaryRgb: [number, number, number]) {
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Your Business';
    
    // Company Logo/Name (Left Side)
    if (config.logo) {
      // Use the base template's addLogo method to properly render the logo
      this.addLogo(doc, config, 20, 50, 25, 15);
    } else {
      // Logo placeholder when no logo is set
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, 35, 25, 15, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, 35, 25, 15, 3, 3, 'S');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('LOGO', 32.5, 44, { align: 'center' });
    }
    
    // Company Name
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 50, 42);
    
    // Company Details
    let yPos = 47;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (user.businessAddress) {
      const addressLines = user.businessAddress.split('\n');
      addressLines.forEach(line => {
        doc.text(line, 50, yPos);
        yPos += 4;
      });
    }
    
    if (user.email) {
      doc.text(user.email, 50, yPos);
      yPos += 4;
    }
    
    if (user.businessPhone) {
      doc.text(user.businessPhone, 50, yPos);
    }
    
    // Invoice Info (Right Side)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 190, 20, { align: 'right' });
    
    // Invoice Details Card
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(140, 35, 55, 30, 5, 5, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(140, 35, 55, 30, 5, 5, 'S');
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let detailY = 42;
    doc.text('Invoice #:', 145, detailY);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.invoiceNumber, 190, detailY, { align: 'right' });
    
    detailY += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Date:', 145, detailY);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 190, detailY, { align: 'right' });
    
    detailY += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Due:', 145, detailY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryRgb);
    doc.text(new Date(invoice.dueDate).toLocaleDateString(), 190, detailY, { align: 'right' });
  }

  private createBillingSection(doc: jsPDF, invoice: InvoiceWithDetails, user: User, secondaryRgb: [number, number, number]) {
    const yStart = 75;
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Your Business';
    
    // FROM Section (Left)
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(20, yStart, 80, 35, 5, 5, 'F');
    doc.setDrawColor(...secondaryRgb);
    doc.setLineWidth(2);
    doc.line(20, yStart, 20, yStart + 35);
    
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM', 25, yStart + 8);
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 25, yStart + 16);
    
    let fromY = yStart + 22;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (user.email) {
      doc.text(user.email, 25, fromY);
      fromY += 4;
    }
    if (user.businessPhone) {
      doc.text(user.businessPhone, 25, fromY);
    }
    
    // BILL TO Section (Right)
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(110, yStart, 80, 35, 5, 5, 'F');
    doc.setDrawColor(...secondaryRgb);
    doc.setLineWidth(2);
    doc.line(110, yStart, 110, yStart + 35);
    
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 115, yStart + 8);
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 115, yStart + 16);
    
    let toY = yStart + 22;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (invoice.client.email) {
      doc.text(invoice.client.email, 115, toY);
      toY += 4;
    }
    if (invoice.client.address) {
      const addressLines = invoice.client.address.split('\n');
      addressLines.slice(0, 2).forEach(line => {
        doc.text(line, 115, toY);
        toY += 4;
      });
    }
  }

  private createModernTable(doc: jsPDF, invoice: InvoiceWithDetails, primaryRgb: [number, number, number], secondaryRgb: [number, number, number]) {
    const startY = 120;
    const tableWidth = 170;
    const headerHeight = 12;
    const rowHeight = 10;
    
    // Table border
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, startY, tableWidth, headerHeight + (invoice.items.length * rowHeight), 5, 5, 'S');
    
    // Header background gradient
    for (let i = 0; i < headerHeight; i++) {
      const ratio = i / (headerHeight - 1);
      const r = Math.round(secondaryRgb[0] + (primaryRgb[0] - secondaryRgb[0]) * ratio);
      const g = Math.round(secondaryRgb[1] + (primaryRgb[1] - secondaryRgb[1]) * ratio);
      const b = Math.round(secondaryRgb[2] + (primaryRgb[2] - secondaryRgb[2]) * ratio);
      
      doc.setFillColor(r, g, b);
      doc.rect(20, startY + i, tableWidth, 1, 'F');
    }
    
    // Column headers
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const headerY = startY + 8;
    doc.text('ITEM', 25, headerY);
    doc.text('QTY', 120, headerY, { align: 'center' });
    doc.text('RATE', 145, headerY, { align: 'center' });
    doc.text('AMOUNT', 185, headerY, { align: 'right' });
    
    // Table rows
    let currentY = startY + headerHeight;
    
    invoice.items.forEach((item, index) => {
      // Alternating row backgrounds
      if (index % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, currentY, tableWidth, rowHeight, 'F');
      }
      
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const itemY = currentY + 7;
      doc.text(item.description, 25, itemY);
      doc.text(item.quantity.toString(), 120, itemY, { align: 'center' });
      doc.text(this.formatCurrency(parseFloat(item.rate)), 145, itemY, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryRgb);
      doc.text(this.formatCurrency(parseFloat(item.amount)), 185, itemY, { align: 'right' });
      
      currentY += rowHeight;
    });
  }

  private createTotalsSection(doc: jsPDF, invoice: InvoiceWithDetails, accentRgb: [number, number, number]) {
    const startY = 135 + (invoice.items.length * 10);
    const totalsX = 125;
    const totalsWidth = 65;
    
    // Totals background
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(totalsX, startY, totalsWidth, 35, 5, 5, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(totalsX, startY, totalsWidth, 35, 5, 5, 'S');
    
    let currentY = startY + 10;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX + 5, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(parseFloat(invoice.subtotal)), totalsX + totalsWidth - 5, currentY, { align: 'right' });
    currentY += 6;
    
    // Tax (if applicable)
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Tax:', totalsX + 5, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(parseFloat(invoice.taxAmount)), totalsX + totalsWidth - 5, currentY, { align: 'right' });
      currentY += 6;
    }
    
    // Discount (if applicable)
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Discount:', totalsX + 5, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${this.formatCurrency(parseFloat(invoice.discountAmount))}`, totalsX + totalsWidth - 5, currentY, { align: 'right' });
      currentY += 6;
    }
    
    // Total line
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(1);
    doc.line(totalsX + 5, currentY, totalsX + totalsWidth - 5, currentY);
    currentY += 5;
    
    // Grand Total
    doc.setTextColor(...accentRgb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX + 5, currentY);
    doc.setFontSize(14);
    doc.text(this.formatCurrency(parseFloat(invoice.total)), totalsX + totalsWidth - 5, currentY, { align: 'right' });
  }

  private createFooterSection(doc: jsPDF, invoice: InvoiceWithDetails, user: User, accentRgb: [number, number, number]) {
    const footerY = 195 + (invoice.items.length * 10);
    
    // Footer background
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(20, footerY, 170, 30, 5, 5, 'F');
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(2);
    doc.line(20, footerY, 190, footerY);
    
    let currentY = footerY + 8;
    
    // Notes (if any)
    if (invoice.notes && invoice.notes.trim()) {
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.notes, 25, currentY);
      currentY += 8;
    }
    
    // Payment Instructions
    doc.setTextColor(...accentRgb);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Instructions:', 25, currentY);
    
    currentY += 6;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const dueDays = Math.ceil((new Date(invoice.dueDate).getTime() - new Date(invoice.issueDate).getTime()) / (1000 * 60 * 60 * 24));
    doc.text(`Payment is due within ${dueDays} days. Please include invoice number ${invoice.invoiceNumber} with your payment.`, 25, currentY);
    
    // Thank you message
    doc.setTextColor(...accentRgb);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for your business!', 105, footerY + 25, { align: 'center' });
  }
}