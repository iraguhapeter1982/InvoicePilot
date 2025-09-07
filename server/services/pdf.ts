import { type InvoiceWithDetails, type User } from "@shared/schema";

export async function generateInvoicePDF(invoice: InvoiceWithDetails, user: User): Promise<Buffer> {
  // Using jsPDF for PDF generation
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('INVOICE', 20, 30);
  
  // Business info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(user.businessName || `${user.firstName} ${user.lastName}`, 20, 50);
  if (user.businessAddress) {
    const addressLines = user.businessAddress.split('\n');
    addressLines.forEach((line, index) => {
      doc.text(line, 20, 60 + (index * 10));
    });
  }
  if (user.email) {
    doc.text(user.email, 20, 90);
  }
  if (user.businessPhone) {
    doc.text(user.businessPhone, 20, 100);
  }
  
  // Invoice details
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 140, 50);
  doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 140, 60);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 140, 70);
  
  // Client info
  doc.setFontSize(12);
  doc.text('Bill To:', 20, 130);
  doc.text(invoice.client.name, 20, 140);
  if (invoice.client.address) {
    const clientAddressLines = invoice.client.address.split('\n');
    clientAddressLines.forEach((line, index) => {
      doc.text(line, 20, 150 + (index * 10));
    });
  }
  doc.text(invoice.client.email, 20, 170);
  
  // Items table header
  let yPosition = 200;
  doc.setFontSize(10);
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition - 5, 170, 10, 'F');
  doc.text('Description', 25, yPosition);
  doc.text('Qty', 120, yPosition);
  doc.text('Rate', 140, yPosition);
  doc.text('Amount', 165, yPosition);
  
  // Items
  yPosition += 15;
  invoice.items.forEach((item) => {
    doc.text(item.description, 25, yPosition);
    doc.text(item.quantity, 120, yPosition);
    doc.text(`$${parseFloat(item.rate).toFixed(2)}`, 140, yPosition);
    doc.text(`$${parseFloat(item.amount).toFixed(2)}`, 165, yPosition);
    yPosition += 10;
  });
  
  // Totals
  yPosition += 10;
  doc.line(120, yPosition, 190, yPosition);
  yPosition += 10;
  
  doc.text('Subtotal:', 140, yPosition);
  doc.text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, 165, yPosition);
  yPosition += 10;
  
  if (parseFloat(invoice.taxAmount) > 0) {
    doc.text(`Tax (${invoice.taxRate}%):`, 140, yPosition);
    doc.text(`$${parseFloat(invoice.taxAmount).toFixed(2)}`, 165, yPosition);
    yPosition += 10;
  }
  
  if (parseFloat(invoice.discountAmount) > 0) {
    doc.text('Discount:', 140, yPosition);
    doc.text(`-$${parseFloat(invoice.discountAmount).toFixed(2)}`, 165, yPosition);
    yPosition += 10;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, yPosition);
  doc.text(`$${parseFloat(invoice.total).toFixed(2)}`, 165, yPosition);
  
  // Notes
  if (invoice.notes) {
    yPosition += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Notes:', 20, yPosition);
    const noteLines = doc.splitTextToSize(invoice.notes, 170);
    doc.text(noteLines, 20, yPosition + 10);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}
