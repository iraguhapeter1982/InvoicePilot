import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class MinimalTemplate extends BaseTemplate {
  name = 'minimal';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Ultra-clean minimal header with perfect typography
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'normal');
    doc.text('Invoice', 20, 40);

    // Subtle accent line - signature of minimal design
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(3);
    doc.line(20, 48, 70, 48);

    // Perfect logo placement
    this.addLogo(doc, config, 140, 30, 50, 25);

    // Clean company information with generous spacing
    let yPos = 70;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const companyName = user.businessName || `${user.firstName || ''} ${user.lastName || ''}`;
    doc.text(companyName, 20, yPos);
    
    // Minimal contact details with elegant spacing
    yPos += 20;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    
    let contactDetails = [];
    if (user.email) contactDetails.push(user.email);
    if (user.businessPhone) contactDetails.push(user.businessPhone);
    
    if (contactDetails.length > 0) {
      doc.text(contactDetails.join(' • '), 20, yPos);
    }

    // Clean invoice metadata with perfect alignment
    yPos = 110;
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice ${invoice.invoiceNumber}`, 20, yPos);
    
    yPos += 15;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 20, yPos);
    
    yPos += 12;
    doc.setTextColor(...secondaryRgb);
    doc.setFont('helvetica', 'bold');
    doc.text(`Due ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, yPos);

    // Minimal Bill To section with perfect spacing
    yPos = 155;
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed to', 20, yPos);
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 20, yPos);
    
    yPos += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (invoice.client.address) {
      const addressLines = this.splitAddress(invoice.client.address);
      addressLines.slice(0, 2).forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 6));
      });
      yPos += addressLines.length * 6 + 6;
    }
    doc.text(invoice.client.email, 20, yPos);

    // Ultra-clean table with perfect typography
    yPos = 210;
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, yPos);
    doc.text('Qty', 125, yPos, { align: 'center' });
    doc.text('Rate', 145, yPos, { align: 'center' });
    doc.text('Amount', 175, yPos, { align: 'right' });

    // Single elegant separator line
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(1.5);
    doc.line(20, yPos + 8, 175, yPos + 8);

    // Items with perfect minimal spacing
    yPos += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    invoice.items.forEach((item, index) => {
      doc.setFontSize(11);
      const description = item.description.length > 45 ? item.description.substring(0, 45) + '...' : item.description;
      doc.text(description, 20, yPos);
      doc.text(item.quantity, 125, yPos, { align: 'center' });
      doc.text(this.formatCurrency(item.rate), 145, yPos, { align: 'center' });
      
      // Emphasize amounts with bold
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatCurrency(item.amount), 175, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += 18;
    });

    // Minimal but elegant totals section
    yPos += 25;
    
    // Subtle divider line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(120, yPos - 10, 175, yPos - 10);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal', 120, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(this.formatCurrency(invoice.subtotal), 175, yPos, { align: 'right' });
    yPos += 15;
    
    // Tax
    if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Tax (${invoice.taxRate ? parseFloat(invoice.taxRate).toFixed(1) : '0'}%)`, 120, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(this.formatCurrency(invoice.taxAmount), 175, yPos, { align: 'right' });
      yPos += 15;
    }
    
    // Discount
    if (invoice.discountAmount && parseFloat(invoice.discountAmount) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...accentRgb);
      doc.text(`Discount (${invoice.discountRate ? parseFloat(invoice.discountRate).toFixed(1) : '0'}%)`, 120, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, 175, yPos, { align: 'right' });
      yPos += 15;
    }

    // Total with perfect minimal styling
    yPos += 8;
    doc.setDrawColor(...primaryRgb);
    doc.setLineWidth(2);
    doc.line(120, yPos - 5, 175, yPos - 5);
    
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 120, yPos + 5);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(this.formatCurrency(invoice.total), 175, yPos + 5, { align: 'right' });

    // Minimal notes section
    if (invoice.notes) {
      yPos += 40;
      doc.setTextColor(...secondaryRgb);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 20, yPos);
      
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const noteLines = invoice.notes.split('\n').slice(0, 3);
      noteLines.forEach((line, index) => {
        const truncatedLine = line.length > 90 ? line.substring(0, 90) + '...' : line;
        doc.text(truncatedLine, 20, yPos + 12 + (index * 8));
      });
    }

    // Minimal footer with perfect spacing
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business', 105, 285, { align: 'center' });
  }
}