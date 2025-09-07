import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Download, Send } from "lucide-react";
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "sent":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const recentInvoices = invoices?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Link href="/invoices">
            <Button variant="ghost" size="sm" data-testid="link-view-all-invoices">
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
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No invoices yet</p>
            <Link href="/invoices">
              <Button data-testid="button-create-first-invoice-dashboard">
                Create your first invoice
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Invoice #</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-foreground" data-testid={`text-recent-invoice-number-${invoice.id}`}>
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-foreground" data-testid={`text-recent-client-name-${invoice.id}`}>
                          {invoice.client.name}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-recent-client-email-${invoice.id}`}>
                          {invoice.client.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-foreground" data-testid={`text-recent-invoice-amount-${invoice.id}`}>
                        ${parseFloat(invoice.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-muted-foreground" data-testid={`text-recent-invoice-date-${invoice.id}`}>
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div data-testid={`status-recent-invoice-${invoice.id}`}>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`button-recent-view-${invoice.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-recent-download-${invoice.id}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === "draft" && (
                          <Button variant="ghost" size="sm" data-testid={`button-recent-send-${invoice.id}`}>
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
        )}
      </CardContent>
    </Card>
  );
}
