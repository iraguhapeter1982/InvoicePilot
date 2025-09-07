import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Eye, Download, Send, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { InvoiceWithDetails } from "@shared/schema";

export default function Invoices() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      await apiRequest("POST", `/api/invoices/${invoiceId}/send`);
    },
    onSuccess: () => {
      toast({
        title: "Invoice Sent",
        description: "Invoice has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send invoice.",
        variant: "destructive",
      });
    },
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

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to download PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
          <Button onClick={() => setShowCreateForm(true)} data-testid="button-new-invoice">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : invoices?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No invoices yet</p>
                <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-first-invoice">
                  Create your first invoice
                </Button>
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
                    {invoices?.map((invoice: InvoiceWithDetails) => (
                      <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-medium text-foreground" data-testid={`text-invoice-number-${invoice.id}`}>
                            {invoice.invoiceNumber}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-foreground" data-testid={`text-client-name-${invoice.id}`}>
                              {invoice.client.name}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-client-email-${invoice.id}`}>
                              {invoice.client.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-foreground" data-testid={`text-invoice-amount-${invoice.id}`}>
                            ${parseFloat(invoice.total).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-muted-foreground" data-testid={`text-invoice-date-${invoice.id}`}>
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div data-testid={`status-invoice-${invoice.id}`}>
                            {getStatusBadge(invoice.status)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`button-actions-${invoice.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowPreview(true);
                                }}
                                data-testid={`button-view-${invoice.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                                data-testid={`button-download-${invoice.id}`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              {invoice.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() => sendInvoiceMutation.mutate(invoice.id)}
                                  disabled={sendInvoiceMutation.isPending}
                                  data-testid={`button-send-${invoice.id}`}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Invoice
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Invoice Modal */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onSuccess={() => setShowCreateForm(false)} />
          </DialogContent>
        </Dialog>

        {/* Preview Invoice Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
            </DialogHeader>
            {selectedInvoice && <InvoicePreview invoice={selectedInvoice} />}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
