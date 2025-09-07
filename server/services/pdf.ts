import { type InvoiceWithDetails, type User } from "@shared/schema";
import { TemplateRegistry } from './templates/registry';
import { type TemplateConfig } from './templates/base';
import { jsPDF } from 'jspdf';

export async function generateInvoicePDF(invoice: InvoiceWithDetails, user: User): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Set default font
  doc.setFont('helvetica');
  
  // Get user's branding configuration
  const config: TemplateConfig = {
    colors: {
      primary: (user as any).brandPrimaryColor || "#3b82f6",
      secondary: (user as any).brandSecondaryColor || "#1e40af", 
      accent: (user as any).brandAccentColor || "#10b981",
    },
    logo: (user as any).logoUrl,
    fonts: {
      header: 28,
      title: 18,
      body: 14,
      small: 12,
    }
  };
  
  // Get selected template or fallback to modern
  const templateName = (user as any).invoiceTemplate || 'modern';
  const template = TemplateRegistry.get(templateName);
  
  // Generate PDF using the selected template
  await template.generate(doc, invoice, user, config);
  
  return Buffer.from(doc.output('arraybuffer'));
}
