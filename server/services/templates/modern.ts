import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class ModernTemplate extends BaseTemplate {
  name = 'modern';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // MODERN HEADER BAND - Full width with sophisticated gradient
    doc.setFillColor(...primaryRgb);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Subtle gradient effect with secondary color
    doc.setFillColor(...secondaryRgb);
    doc.rect(0, 35, 210, 10, 'F');

    // INVOICE TITLE - Large, bold, modern typography
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 25, 30);

    // ELEVATED INVOICE DETAILS CARD - Modern card design
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(130, 20, 75, 60, 8, 8, 'F');
    
    // Card shadow effect
    doc.setFillColor(0, 0, 0, 0.1);
    doc.roundedRect(132, 22, 75, 60, 8, 8, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(130, 20, 75, 60, 8, 8, 'F');
    
    // Card border
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(1);
    doc.roundedRect(130, 20, 75, 60, 8, 8, 'S');
    
    // Invoice details with professional typography hierarchy
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS', 135, 32);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${invoice.invoiceNumber}`, 135, 45);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Issue Date:', 135, 55);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 135, 63);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Due Date:', 135, 71);
    doc.setTextColor(...accentRgb);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(invoice.dueDate).toLocaleDateString(), 135, 79);

    // COMPANY SECTION - Professional layout
    let yPos = 95;
    
    // Logo with proper spacing
    this.addLogo(doc, config, 25, yPos, 60, 30);
    
    // Company information with enhanced typography
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`;
    doc.text(companyName, 25, yPos + 40);
    
    // Company details with clean spacing
    yPos += 50;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (user.businessAddress) {
      const addressLines = this.splitAddress(user.businessAddress);
      addressLines.forEach((line, index) => {
        doc.text(line, 25, yPos + (index * 5));
      });
      yPos += addressLines.length * 5 + 8;
    }
    
    if (user.email) {
      doc.text(`Email: ${user.email}`, 25, yPos);
      yPos += 6;
    }
    if (user.businessPhone) {
      doc.text(`Phone: ${user.businessPhone}`, 25, yPos);
      yPos += 6;
    }
    if (user.taxId) {
      doc.setTextColor(120, 120, 120);
      doc.text(`Tax ID: ${user.taxId}`, 25, yPos);
    }

    // BILL TO CARD - Modern elevated design
    yPos = 95;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, yPos, 85, 50, 8, 8, 'F');
    
    // Card shadow
    doc.setFillColor(0, 0, 0, 0.05);
    doc.roundedRect(122, yPos + 2, 85, 50, 8, 8, 'F');
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, yPos, 85, 50, 8, 8, 'F');
    
    // Card border
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(1);
    doc.roundedRect(120, yPos, 85, 50, 8, 8, 'S');
    
    // Section header with accent
    doc.setTextColor(...secondaryRgb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 125, yPos + 12);
    
    // Accent line under header
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(2);
    doc.line(125, yPos + 15, 155, yPos + 15);
    
    // Client information with proper hierarchy
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 125, yPos + 25);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let clientYPos = yPos + 33;
    
    if (invoice.client.address) {
      const clientAddressLines = this.splitAddress(invoice.client.address);
      clientAddressLines.slice(0, 2).forEach((line, index) => {
        const truncatedLine = line.length > 30 ? line.substring(0, 30) + '...' : line;
        doc.text(truncatedLine, 125, clientYPos + (index * 4));
      });
      clientYPos += 10;
    }
    
    const emailText = invoice.client.email.length > 30 ? invoice.client.email.substring(0, 30) + '...' : invoice.client.email;
    doc.text(emailText, 125, clientYPos);

    // MODERN TABLE DESIGN - Professional with shadows
    yPos = 165;
    
    // Table header with gradient effect
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(25, yPos, 160, 15, 4, 4, 'F');
    
    // Header shadow
    doc.setFillColor(0, 0, 0, 0.1);
    doc.roundedRect(27, yPos + 2, 160, 15, 4, 4, 'F');
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(25, yPos, 160, 15, 4, 4, 'F');
    
    // Table headers with perfect typography
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 30, yPos + 10);
    doc.text('QTY', 115, yPos + 10, { align: 'center' });
    doc.text('RATE', 135, yPos + 10, { align: 'center' });
    doc.text('AMOUNT', 175, yPos + 10, { align: 'right' });

    // Table items with modern styling
    yPos += 18;
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      // Alternating row backgrounds with subtle styling
      if (index % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(25, yPos - 3, 160, 14, 2, 2, 'F');
      }
      
      // Row border for clean separation
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.5);
      doc.line(25, yPos + 11, 185, yPos + 11);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      const description = item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description;
      doc.text(description, 30, yPos + 7);
      doc.text(item.quantity, 115, yPos + 7, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 135, yPos + 7, { align: 'center' });
      
      // Emphasize amounts
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 175, yPos + 7, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 14;
    });

    // MODERN TOTALS SECTION - Elevated card design
    yPos += 20;
    const totalsX = 110;
    const totalsWidth = 75;
    
    // Totals card with shadow
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 55, 8, 8, 'F');
    
    // Card shadow
    doc.setFillColor(0, 0, 0, 0.08);
    doc.roundedRect(totalsX + 2, yPos - 3, totalsWidth, 55, 8, 8, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 55, 8, 8, 'F');
    
    // Card border
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(1);
    doc.roundedRect(totalsX, yPos - 5, totalsWidth, 55, 8, 8, 'S');
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal:', totalsX + 8, yPos + 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(this.formatCurrency(invoice.subtotal), totalsX + totalsWidth - 8, yPos + 8, { align: 'right' });
    
    // Separator line
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.5);
    doc.line(totalsX + 8, yPos + 12, totalsX + totalsWidth - 8, yPos + 12);
    yPos += 15;
    
    // Tax
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Tax (${invoice.taxRate ? parseFloat(invoice.taxRate).toFixed(1) : '0'}%):`, totalsX + 8, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(this.formatCurrency(invoice.taxAmount), totalsX + totalsWidth - 8, yPos, { align: 'right' });
      doc.setDrawColor(240, 240, 240);
      doc.line(totalsX + 8, yPos + 4, totalsX + totalsWidth - 8, yPos + 4);
      yPos += 12;
    }
    
    // Discount
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...accentRgb);
      doc.text(`Discount (${invoice.discountRate ? parseFloat(invoice.discountRate).toFixed(1) : '0'}%):`, totalsX + 8, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, totalsX + totalsWidth - 8, yPos, { align: 'right' });
      doc.setDrawColor(...accentRgb);
      doc.line(totalsX + 8, yPos + 4, totalsX + totalsWidth - 8, yPos + 4);
      yPos += 12;
    }

    // TOTAL - Prominent modern styling
    doc.setFillColor(...accentRgb);
    doc.roundedRect(totalsX, yPos, totalsWidth, 20, 6, 6, 'F');
    
    // Total shadow for elevation
    doc.setFillColor(0, 0, 0, 0.15);
    doc.roundedRect(totalsX + 1, yPos + 1, totalsWidth, 20, 6, 6, 'F');
    doc.setFillColor(...accentRgb);
    doc.roundedRect(totalsX, yPos, totalsWidth, 20, 6, 6, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX + 8, yPos + 13);
    doc.setFontSize(18);
    doc.text(this.formatCurrency(invoice.total), totalsX + totalsWidth - 8, yPos + 13, { align: 'right' });

    // NOTES SECTION - Modern card design
    if (invoice.notes) {
      yPos += 35;
      doc.setFillColor(250, 251, 252);
      doc.roundedRect(25, yPos, 160, 25, 6, 6, 'F');
      
      // Notes card border
      doc.setDrawColor(225, 230, 235);
      doc.setLineWidth(1);
      doc.roundedRect(25, yPos, 160, 25, 6, 6, 'S');
      
      doc.setTextColor(...secondaryRgb);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES', 30, yPos + 12);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n').slice(0, 2);
      noteLines.forEach((line, index) => {
        const truncatedLine = line.length > 85 ? line.substring(0, 85) + '...' : line;
        doc.text(truncatedLine, 30, yPos + 18 + (index * 4));
      });
    }

    // MODERN FOOTER - Clean and professional
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 105, 285, { align: 'center' });
    
    // Footer accent line
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(1.5);
    doc.line(80, 287, 130, 287);
  }
}