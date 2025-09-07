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
    doc.setFontSize(config.fonts.header);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice', 20, 40);

    // Elegant subtle accent line
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(2);
    doc.line(20, 45, 80, 45);

    // Sophisticated logo placement with perfect proportions
    this.addLogo(doc, config, 140, 55, 50, 25);

    // Clean company branding with perfect spacing
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.title + 2);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName} ${user.lastName}`;
    doc.text(companyName, 20, 65);
    
    // Minimal but elegant contact info
    doc.setFontSize(config.fonts.body);
    doc.setTextColor(80, 80, 80);
    let contactDetails = [];
    if (user.email) contactDetails.push(user.email);
    if (user.businessPhone) contactDetails.push(user.businessPhone);
    if (contactDetails.length > 0) {
      doc.text(contactDetails.join(' • '), 20, 75);
    }

    // Clean invoice metadata with modern spacing
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice ${invoice.invoiceNumber}`, 20, 90);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date(invoice.issueDate).toLocaleDateString()}`, 20, 102);
    doc.setTextColor(...secondaryRgb);
    doc.setFont('helvetica', 'bold');
    doc.text(`Due ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 114);

    // Sophisticated bill to section
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed to', 20, 135);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.body + 2);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 20, 150);
    
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let clientY = 162;
    if (invoice.client.address) {
      const addressLines = this.splitAddress(invoice.client.address);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, clientY + (index * 6));
      });
      clientY += addressLines.length * 6 + 6;
    }
    doc.text(invoice.client.email, 20, clientY);

    // Ultra-clean table with perfect alignment
    let yPos = 190;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, yPos);
    doc.text('Qty', 120, yPos, { align: 'center' });
    doc.text('Rate', 140, yPos, { align: 'center' });
    doc.text('Amount', 165, yPos, { align: 'right' });

    // Refined separator with accent color
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(1);
    doc.line(20, yPos + 6, 170, yPos + 6);

    // Items with perfect minimal spacing
    yPos += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      doc.setFontSize(config.fonts.body);
      doc.text(item.description, 20, yPos);
      doc.text(item.quantity, 120, yPos, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 140, yPos, { align: 'center' });
      
      // Emphasize amounts
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 165, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 16;
    });

    // Elegant totals section - minimal but impactful
    yPos += 20;
    
    // Remove problematic background that might hide text
    // doc.setFillColor(248, 249, 250);
    // doc.roundedRect(115, yPos - 10, 75, 40, 3, 3, 'F');
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(config.fonts.body);
    
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.text('Tax:', 130, yPos);
      doc.text(this.formatCurrency(invoice.taxAmount), 175, yPos, { align: 'right' });
      yPos += 10;
    }
    
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setTextColor(...accentRgb);
      doc.text('Discount:', 130, yPos);
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, 175, yPos, { align: 'right' });
      yPos += 10;
    }

    // Total with clear visibility - no background interference
    yPos += 8;
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.body + 2);
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 130, yPos);
    doc.setTextColor(0, 0, 0); // Use black for total to ensure visibility
    doc.setFontSize(config.fonts.title + 2);
    doc.text(this.formatCurrency(invoice.total), 175, yPos, { align: 'right' });

    // Minimal notes with perfect typography
    if (invoice.notes) {
      yPos += 30;
      doc.setTextColor(...secondaryRgb);
      doc.setFontSize(config.fonts.body);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 20, yPos);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(config.fonts.body);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n').slice(0, 4);
      noteLines.forEach((line, index) => {
        doc.text(line, 20, yPos + 15 + (index * 8));
      });
    }

    // Subtle footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business', 105, 280, { align: 'center' });
  }
}