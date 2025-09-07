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
        // For now, we'll show a placeholder since jsPDF has limited image support
        // In a real implementation, you would add base64 image support
        doc.setFillColor(...this.hexToRgb(config.colors.primary));
        doc.rect(x, y - maxHeight, maxWidth, maxHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('LOGO', x + maxWidth/2, y - maxHeight/2, { align: 'center' });
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
      }
    }
  }

  protected formatCurrency(amount: string | number): string {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  }

  protected splitAddress(address: string): string[] {
    return address.split('\n').filter(line => line.trim().length > 0);
  }

  abstract generate(doc: jsPDF, invoice: InvoiceWithDetails, user: User, config: TemplateConfig): Promise<void>;
}