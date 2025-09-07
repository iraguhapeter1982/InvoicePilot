import { type InvoiceWithDetails, type User } from "@shared/schema";
import { jsPDF } from 'jspdf';

export interface TemplateConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo?: string;
  fonts: {
    header: number;
    title: number;
    body: number;
    small: number;
  };
}

export interface InvoiceTemplate {
  name: string;
  generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void>;
}

export abstract class BaseTemplate implements InvoiceTemplate {
  abstract name: string;

  protected hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  protected addLogo(doc: jsPDF, config: TemplateConfig, x: number, y: number, maxWidth: number = 40, maxHeight: number = 20) {
    if (config.logo) {
      try {
        // Extract format from base64 string
        const matches = config.logo.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const format = matches[1].toUpperCase();
          const base64Data = matches[2];
          
          // jsPDF supports JPEG, PNG, and WEBP
          if (['JPEG', 'JPG', 'PNG', 'WEBP'].includes(format)) {
            doc.addImage(config.logo, format as any, x, y - maxHeight, maxWidth, maxHeight);
            return;
          }
        }
        
        // Fallback: Create a styled placeholder with company initial
        this.createLogoPlaceholder(doc, config, x, y, maxWidth, maxHeight);
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
        this.createLogoPlaceholder(doc, config, x, y, maxWidth, maxHeight);
      }
    }
  }

  protected createLogoPlaceholder(doc: jsPDF, config: TemplateConfig, x: number, y: number, maxWidth: number, maxHeight: number) {
    // Create a modern logo placeholder with gradient-like effect
    const primaryRgb = this.hexToRgb(config.colors.primary);
    const secondaryRgb = this.hexToRgb(config.colors.secondary);
    
    // Background with primary color
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(x, y - maxHeight, maxWidth, maxHeight, 3, 3, 'F');
    
    // Add a subtle border effect
    doc.setDrawColor(...secondaryRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y - maxHeight, maxWidth, maxHeight, 3, 3, 'S');
    
    // Add company initial or icon
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(Math.min(maxHeight * 0.6, 16));
    doc.setFont('helvetica', 'bold');
    doc.text('LOGO', x + maxWidth/2, y - maxHeight/2 + 2, { align: 'center' });
  }

  protected formatCurrency(amount: string | number): string {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  }

  protected splitAddress(address: string): string[] {
    return address.split('\n').filter(line => line.trim().length > 0);
  }

  abstract generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void>;
}