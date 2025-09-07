import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Download, Send, CreditCard, Building } from "lucide-react";
import type { InvoiceWithDetails } from "@shared/schema";

interface InvoicePreviewProps {
  invoice: InvoiceWithDetails;
  onDownload?: () => void;
  onSend?: () => void;
}

export default function InvoicePreview({ invoice, onDownload, onSend }: InvoicePreviewProps) {
  const { user } = useAuth();

  // Get user's brand colors with fallbacks
  const primaryColor = (user as any)?.brandPrimaryColor || "#3b82f6";
  const secondaryColor = (user as any)?.brandSecondaryColor || "#1e40af";
  const accentColor = (user as any)?.brandAccentColor || "#10b981";
  const logoUrl = (user as any)?.logoUrl;
  const template = (user as any)?.invoiceTemplate || "modern";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10">Paid</Badge>;
      case "sent":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/10">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/10">Overdue</Badge>;
      default:
        return <Badge variant="secondary" className="bg-slate-500/10 text-slate-600">Draft</Badge>;
    }
  };

  const handlePayOnline = () => {
    // This would integrate with Stripe for payment processing
    const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
    const domain = domains[0] || window.location.hostname;
    const paymentUrl = `https://${domain}/pay/${invoice.id}`;
    window.open(paymentUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Invoice Status and Actions */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-4">
          <div data-testid={`status-preview-${invoice.id}`}>
            {getStatusBadge(invoice.status)}
          </div>
          <span className="text-sm text-muted-foreground">
            Invoice {invoice.invoiceNumber}
          </span>
        </div>
        <div className="flex space-x-2">
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload} data-testid="button-preview-download">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
          {onSend && invoice.status === "draft" && (
            <Button size="sm" onClick={onSend} data-testid="button-preview-send">
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Professional Invoice Template */}
      <div className={`bg-card border border-border rounded-lg shadow-sm ${
        template === 'modern' ? 'p-8' : 
        template === 'classic' ? 'p-8 bg-gradient-to-br from-white to-gray-50' : 'p-6'
      }`}>
        {/* Template-specific styling based on selected template */}
        {template === 'modern' && (
          <div className="h-2 rounded-t-lg mb-6" style={{ 
            background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` 
          }} />
        )}
        
        {/* Invoice Header */}
        <div className={`flex justify-between items-start ${
          template === 'minimal' ? 'mb-6' : 'mb-8'
        }`}>
          <div>
            <div className={`flex items-center space-x-3 ${
              template === 'minimal' ? 'mb-3' : 'mb-4'
            }`}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className={`object-contain ${
                    template === 'minimal' ? 'h-10 w-auto' : 'h-12 w-auto'
                  }`}
                  data-testid="company-logo"
                />
              ) : (
                <div 
                  className={`rounded-lg flex items-center justify-center ${
                    template === 'minimal' ? 'w-8 h-8' : 'w-10 h-10'
                  }`}
                  style={{ backgroundColor: primaryColor }}
                >
                  <Receipt className={`text-white ${
                    template === 'minimal' ? 'h-4 w-4' : 'h-6 w-6'
                  }`} />
                </div>
              )}
              <div>
                <h1 className={`font-bold text-foreground ${
                  template === 'minimal' ? 'text-lg' : 'text-xl'
                }`} data-testid="text-business-name">
                  {user?.businessName || `${user?.firstName || ''} ${user?.lastName || ''}`}
                </h1>
                {template !== 'minimal' && (
                  <p className="text-sm text-muted-foreground">Professional Services</p>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {user?.businessAddress && (
                <div data-testid="text-business-address">
                  {user.businessAddress.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              )}
              {user?.email && (
                <p data-testid="text-business-email">{user.email}</p>
              )}
              {user?.businessPhone && (
                <p data-testid="text-business-phone">{user.businessPhone}</p>
              )}
              {user?.taxId && (
                <p data-testid="text-business-tax-id">Tax ID: {user.taxId}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>INVOICE</h2>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Invoice #:</span>{" "}
                <span data-testid="text-preview-invoice-number">{invoice.invoiceNumber}</span>
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                <span data-testid="text-preview-issue-date">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </span>
              </p>
              <p>
                <span className="font-medium">Due Date:</span>{" "}
                <span data-testid="text-preview-due-date">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3 flex items-center" style={{ color: secondaryColor }}>
            <Building className="h-4 w-4 mr-2" />
            Bill To:
          </h3>
          <div className="text-sm space-y-1">
            <p className="font-medium text-foreground" data-testid="text-preview-client-name">
              {invoice.client.name}
            </p>
            {invoice.client.address && (
              <div data-testid="text-preview-client-address">
                {invoice.client.address.split('\n').map((line, index) => (
                  <p key={index} className="text-muted-foreground">{line}</p>
                ))}
              </div>
            )}
            <p className="text-muted-foreground" data-testid="text-preview-client-email">
              {invoice.client.email}
            </p>
            {invoice.client.phone && (
              <p className="text-muted-foreground" data-testid="text-preview-client-phone">
                {invoice.client.phone}
              </p>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 font-semibold text-foreground">Description</th>
                  <th className="text-center py-3 font-semibold text-foreground">Qty</th>
                  <th className="text-right py-3 font-semibold text-foreground">Rate</th>
                  <th className="text-right py-3 font-semibold text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-3 text-foreground" data-testid={`text-preview-item-description-${index}`}>
                      {item.description}
                    </td>
                    <td className="py-3 text-center text-muted-foreground" data-testid={`text-preview-item-quantity-${index}`}>
                      {parseFloat(item.quantity).toString()}
                    </td>
                    <td className="py-3 text-right text-muted-foreground" data-testid={`text-preview-item-rate-${index}`}>
                      ${parseFloat(item.rate).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-medium text-foreground" data-testid={`text-preview-item-amount-${index}`}>
                      ${parseFloat(item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium text-foreground" data-testid="text-preview-subtotal">
                ${parseFloat(invoice.subtotal).toFixed(2)}
              </span>
            </div>
            {invoice.taxAmount && parseFloat(invoice.taxAmount) > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">
                  Tax ({invoice.taxRate ? parseFloat(invoice.taxRate).toFixed(1) : '0'}%):
                </span>
                <span className="font-medium text-foreground" data-testid="text-preview-tax">
                  ${parseFloat(invoice.taxAmount).toFixed(2)}
                </span>
              </div>
            )}
            {invoice.discountAmount && parseFloat(invoice.discountAmount) > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">
                  Discount ({invoice.discountRate ? parseFloat(invoice.discountRate).toFixed(1) : '0'}%):
                </span>
                <span className="font-medium text-foreground" data-testid="text-preview-discount">
                  -${parseFloat(invoice.discountAmount).toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-2">
              <div className="flex justify-between py-1">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <span className="text-lg font-bold" style={{ color: accentColor }} data-testid="text-preview-total">
                  ${parseFloat(invoice.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information & Notes */}
        <div className="space-y-6">
          {invoice.status !== "paid" && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Information
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Payment is due within {Math.ceil((new Date(invoice.dueDate).getTime() - new Date(invoice.issueDate).getTime()) / (1000 * 60 * 60 * 24))} days of invoice date. 
                Please include invoice number with payment.
              </p>
              <div className="flex space-x-4">
                <Button 
                  size="sm" 
                  onClick={handlePayOnline}
                  data-testid="button-pay-online"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Online
                </Button>
                <Button variant="outline" size="sm" data-testid="button-bank-transfer">
                  <Building className="h-4 w-4 mr-2" />
                  Bank Transfer
                </Button>
              </div>
            </div>
          )}

          {invoice.notes && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-preview-notes">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Email Tracking Information */}
          {invoice.emailSent && (
            <div className="text-xs text-muted-foreground border-t border-border pt-4">
              <p>Email sent: {invoice.emailSentAt ? new Date(invoice.emailSentAt).toLocaleString() : 'Unknown'}</p>
              {invoice.emailOpened && invoice.emailOpenedAt && (
                <p>Email opened: {new Date(invoice.emailOpenedAt).toLocaleString()}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
