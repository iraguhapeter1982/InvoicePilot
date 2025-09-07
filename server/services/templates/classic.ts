import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ClassicTemplate extends BaseTemplate {
  name = 'classic';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Classic elegant header design
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 35);
    
    // Elegant triple underline with color hierarchy
    doc.setLineWidth(3);
    doc.setDrawColor(...primaryRgb);
    doc.line(20, 42, 100, 42);
    doc.setLineWidth(2);
    doc.setDrawColor(...secondaryRgb);
    doc.line(20, 47, 90, 47);
    doc.setLineWidth(1);
    doc.setDrawColor(...accentRgb);
    doc.line(20, 50, 80, 50);

    // Professional logo placement (traditional top-right)
    this.addLogo(doc, config, 140, 25, 60, 35);

    // Traditional company letterhead
    let yPos = 65;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`;
    doc.text(companyName, 20, yPos);
    
    // Elegant address section with proper spacing
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 6));
      });
      yPos += addressLines.length * 6 + 8;
    }
    
    if (user.email) {
      doc.text(`Email: ${user.email}`, 20, yPos);
      yPos += 7;
    }
    if (user.businessPhone) {
      doc.text(`Phone: ${user.businessPhone}`, 20, yPos);
      yPos += 7;
    }
    if (user.taxId) {
      doc.setTextColor(100, 100, 100);
      doc.text(`Tax ID: ${user.taxId}`, 20, yPos);
    }

    // Traditional invoice details box with elegant borders
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(135, 65, 60, 50, 4, 4, 'F');
    doc.setDrawColor(...primaryRgb);
    doc.setLineWidth(2);
    doc.roundedRect(135, 65, 60, 50, 4, 4, 'S');
    
    // Inner elegant border
    doc.setDrawColor(...secondaryRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(137, 67, 56, 46, 3, 3, 'S');
    
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details', 140, 78);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Number: ${invoice.invoiceNumber}`, 140, 88);
    doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 140, 96);
    doc.setTextColor(...accentRgb);
    doc.setFont('helvetica', 'bold');
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 140, 104);

    // Elegant Bill To section
    yPos = 130;
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, yPos);
    
    // Sophisticated underline
    doc.setLineWidth(2);
    doc.setDrawColor(...accentRgb);
    doc.line(20, yPos + 3, 75, yPos + 3);
    doc.setLineWidth(1);
    doc.setDrawColor(...secondaryRgb);
    doc.line(20, yPos + 5, 70, yPos + 5);
    
    // Client information with professional spacing
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 20, yPos);
    
    yPos += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    if (invoice.client.address) {
      const clientAddressLines = this.splitAddress(invoice.client.address);
      clientAddressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 5));
      });
      yPos += clientAddressLines.length * 5 + 6;
    }
    doc.text(invoice.client.email, 20, yPos);
    if (invoice.client.phone) {
      doc.text(invoice.client.phone, 20, yPos + 5);
    }

    // Traditional table with elegant styling
    yPos = 185;
    
    // Professional table header with double border
    doc.setFillColor(...primaryRgb);
    doc.rect(20, yPos, 170, 16, 'F');
    doc.setDrawColor(...secondaryRgb);
    doc.setLineWidth(1);
    doc.rect(20, yPos, 170, 16, 'S');
    
    // Inner header line
    doc.setDrawColor(255, 255, 255, 0.3);
    doc.line(20, yPos + 8, 190, yPos + 8);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, yPos + 11);
    doc.text('QTY', 120, yPos + 11, { align: 'center' });
    doc.text('RATE', 145, yPos + 11, { align: 'center' });
    doc.text('AMOUNT', 180, yPos + 11, { align: 'right' });

    // Vertical separators for traditional table look
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    const tableHeight = 16 + (invoice.items.length * 14);
    doc.line(115, yPos, 115, yPos + tableHeight);
    doc.line(140, yPos, 140, yPos + tableHeight);
    doc.line(165, yPos, 165, yPos + tableHeight);

    // Table items with traditional alternating rows
    yPos += 16;
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      // Traditional alternating row colors
      if (index % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPos, 170, 14, 'F');
      }
      
      // Professional row borders
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.rect(20, yPos, 170, 14, 'S');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description, 25, yPos + 9);
      doc.text(item.quantity, 120, yPos + 9, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 145, yPos + 9, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 180, yPos + 9, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 14;
    });

    // Traditional totals section with elegant borders
    yPos += 20;
    const totalsX = 110;
    const totalsWidth = 80;
    
    // Elegant totals container
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 55, 4, 4, 'F');
    doc.setDrawColor(...primaryRgb);
    doc.setLineWidth(1.5);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 55, 4, 4, 'S');
    doc.setDrawColor(...secondaryRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(totalsX + 2, yPos - 3, totalsWidth - 4, 51, 3, 3, 'S');
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal with elegant line
    yPos += 8;
    doc.text('Subtotal:', totalsX + 8, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(invoice.subtotal), totalsX + totalsWidth - 8, yPos, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(totalsX + 8, yPos + 3, totalsX + totalsWidth - 8, yPos + 3);
    yPos += 12;
    
    // Tax
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.text(`Tax (${invoice.taxRate ? parseFloat(invoice.taxRate).toFixed(1) : '0'}%):`, totalsX + 8, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(invoice.taxAmount), totalsX + totalsWidth - 8, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.line(totalsX + 8, yPos + 3, totalsX + totalsWidth - 8, yPos + 3);
      yPos += 12;
    }
    
    // Discount
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setTextColor(...accentRgb);
      doc.text(`Discount (${invoice.discountRate ? parseFloat(invoice.discountRate).toFixed(1) : '0'}%):`, totalsX + 8, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, totalsX + totalsWidth - 8, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(...accentRgb);
      doc.line(totalsX + 8, yPos + 3, totalsX + totalsWidth - 8, yPos + 3);
      yPos += 12;
    }

    // Total with traditional double border
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(totalsX, yPos, totalsWidth, 18, 3, 3, 'F');
    doc.setDrawColor(...secondaryRgb);
    doc.setLineWidth(1);
    doc.roundedRect(totalsX, yPos, totalsWidth, 18, 3, 3, 'S');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX + 8, yPos + 12);
    doc.setFontSize(16);
    doc.text(this.formatCurrency(invoice.total), totalsX + totalsWidth - 8, yPos + 12, { align: 'right' });

    // Traditional notes section
    if (invoice.notes) {
      yPos += 35;
      doc.setFillColor(250, 251, 252);
      doc.roundedRect(20, yPos, 170, 30, 5, 5, 'F');
      doc.setDrawColor(...primaryRgb);
      doc.setLineWidth(1);
      doc.roundedRect(20, yPos, 170, 30, 5, 5, 'S');
      doc.setDrawColor(...secondaryRgb);
      doc.setLineWidth(0.5);
      doc.roundedRect(22, yPos + 2, 166, 26, 4, 4, 'S');
      
      doc.setTextColor(...primaryRgb);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES:', 28, yPos + 14);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n').slice(0, 2);
      noteLines.forEach((line, index) => {
        const truncatedLine = line.length > 70 ? line.substring(0, 70) + '...' : line;
        doc.text(truncatedLine, 28, yPos + 21 + (index * 5));
      });
    }

    // Traditional elegant footer
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing our services', 105, 285, { align: 'center' });
    
    // Decorative footer line
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(1);
    doc.line(80, 287, 130, 287);
  }
}