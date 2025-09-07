import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Download, Send, DollarSign, Calendar, User, FileText } from "lucide-react";
import { Link } from "wouter";
import type { InvoiceWithDetails } from "@shared/schema";

export default function RecentInvoices() {
  const { data: invoices, isLoading } = useQuery<InvoiceWithDetails[]>({
    queryKey: ["/api/invoices"],
    retry: false,
  });

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

  const recentInvoices = invoices?.slice(0, 5) || [];

  return (
    <Card className="modern-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
          <Link href="/invoices">
            <Button variant="ghost" size="sm" className="touch-target" data-testid="link-view-all-invoices">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-muted-foreground mb-6">Create your first invoice to get started</p>
            <Link href="/invoices">
              <Button className="btn-gradient" data-testid="button-create-first-invoice-dashboard">
                Create your first invoice
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-medium text-foreground" data-testid={`text-recent-invoice-number-${invoice.id}`}>
                            {invoice.invoiceNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground" data-testid={`text-recent-client-name-${invoice.id}`}>
                              {invoice.client.name}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-recent-client-email-${invoice.id}`}>
                              {invoice.client.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-foreground" data-testid={`text-recent-invoice-amount-${invoice.id}`}>
                            ${parseFloat(invoice.total).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-muted-foreground" data-testid={`text-recent-invoice-date-${invoice.id}`}>
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div data-testid={`status-recent-invoice-${invoice.id}`}>
                            {getStatusBadge(invoice.status)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="touch-target" data-testid={`button-recent-view-${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="touch-target" data-testid={`button-recent-download-${invoice.id}`}>
                              <Download className="h-4 w-4" />
                            </Button>
                            {invoice.status === "draft" && (
                              <Button variant="ghost" size="sm" className="touch-target" data-testid={`button-recent-send-${invoice.id}`}>
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards - Shown on mobile/tablet */}
            <div className="lg:hidden space-y-3">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 bg-card/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground text-sm" data-testid={`text-recent-invoice-number-${invoice.id}`}>
                          {invoice.invoiceNumber}
                        </span>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <User className="h-4 w-4" />
                        <span data-testid={`text-recent-client-name-${invoice.id}`}>{invoice.client.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span data-testid={`text-recent-invoice-date-${invoice.id}`}>
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-lg font-bold text-foreground" data-testid={`text-recent-invoice-amount-${invoice.id}`}>
                        ${parseFloat(invoice.total).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="touch-target">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="touch-target">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}