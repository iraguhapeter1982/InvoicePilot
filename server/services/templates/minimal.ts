import { BaseTemplate, type TemplateConfig } from './base';
import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export class MinimalTemplate extends BaseTemplate {
  name = 'minimal';

  async generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void> {
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const accentRgb = this.hexToRgb(config.colors.accent);

    // Minimal header - just text
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.header);
    doc.text('Invoice', 20, 30);

    // Subtle logo placement
    if (config.logo) {
      this.addLogo(doc, config, 160, 30, 30, 12);
    }

    // Clean company info - single line when possible
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.body);
    const companyName = user.businessName || `${user.firstName} ${user.lastName}`;
    doc.text(companyName, 20, 45);
    
    // Minimal contact info
    doc.setFontSize(config.fonts.small);
    doc.setTextColor(120, 120, 120);
    let contactInfo = '';
    if (user.email) contactInfo += user.email;
    if (user.businessPhone) contactInfo += (contactInfo ? ' • ' : '') + user.businessPhone;
    if (contactInfo) doc.text(contactInfo, 20, 52);

    // Simple invoice details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.small);
    doc.text(`#${invoice.invoiceNumber}`, 20, 70);
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 20, 77);
    doc.text(`Due ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 84);

    // Minimal bill to
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(config.fonts.small);
    doc.text('To', 20, 100);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(config.fonts.body);
    doc.text(invoice.client.name, 20, 110);
    
    doc.setFontSize(config.fonts.small);
    doc.setTextColor(120, 120, 120);
    doc.text(invoice.client.email, 20, 117);

    // Clean table without borders
    let yPos = 140;
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(config.fonts.small);
    doc.text('Description', 20, yPos);
    doc.text('Qty', 120, yPos);
    doc.text('Rate', 140, yPos);
    doc.text('Amount', 170, yPos);

    // Subtle separator line
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 3, 190, yPos + 3);

    // Items without borders - clean spacing
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    
    invoice.items.forEach((item) => {
      doc.text(item.description, 20, yPos);
      doc.text(item.quantity, 120, yPos);
      doc.text(this.formatCurrency(item.rate), 140, yPos);
      doc.text(this.formatCurrency(item.amount), 170, yPos);
      yPos += 12;
    });

    // Minimal totals - right aligned, clean
    yPos += 10;
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(config.fonts.small);
    
    if (parseFloat(invoice.taxAmount) > 0) {
      doc.text('Tax:', 140, yPos);
      doc.text(this.formatCurrency(invoice.taxAmount), 170, yPos);
      yPos += 8;
    }
    
    if (parseFloat(invoice.discountAmount) > 0) {
      doc.text('Discount:', 140, yPos);
      doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, 170, yPos);
      yPos += 8;
    }

    // Simple total - emphasized with color only
    doc.setTextColor(...accentRgb);
    doc.setFontSize(config.fonts.body);
    doc.text('Total', 140, yPos + 10);
    doc.text(this.formatCurrency(invoice.total), 170, yPos + 10);

    // Notes if any - minimal formatting
    if (invoice.notes) {
      yPos += 30;
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(config.fonts.small);
      doc.text('Notes', 20, yPos);
      doc.setTextColor(0, 0, 0);
      
      const noteLines = invoice.notes.split('\n').slice(0, 3); // Limit for minimal design
      noteLines.forEach((line, index) => {
        doc.text(line, 20, yPos + 10 + (index * 6));
      });
    }
  }
}