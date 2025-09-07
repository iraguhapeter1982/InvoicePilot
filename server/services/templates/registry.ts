import { ModernTemplate } from './modern';
import { ClassicTemplate } from './classic';
import { MinimalTemplate } from './minimal';
import { type InvoiceTemplate } from './base';

export class TemplateRegistry {
  private static templates: Map<string, InvoiceTemplate> = new Map();

  static {
    // Register all available templates
    this.register(new ModernTemplate());
    this.register(new ClassicTemplate());
    this.register(new MinimalTemplate());
  }

  static register(template: InvoiceTemplate): void {
    this.templates.set(template.name, template);
  }

  static get(templateName: string): InvoiceTemplate {
    const template = this.templates.get(templateName);
    if (!template) {
      // Fallback to modern template if requested template doesn't exist
      return this.templates.get('modern')!;
    }
    return template;
  }

  static list(): string[] {
    return Array.from(this.templates.keys());
  }

  static getTemplateInfo(): Array<{ name: string; displayName: string; description: string }> {
    return [
      {
        name: 'modern',
        displayName: 'Modern',
        description: 'Clean and contemporary design with colored accents'
      },
      {
        name: 'classic',
        displayName: 'Classic',
        description: 'Traditional business format with professional styling'
      },
      {
        name: 'minimal',
        displayName: 'Minimal',
        description: 'Simple and elegant design with clean typography'
      }
    ];
  }
}