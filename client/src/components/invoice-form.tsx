import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Client } from "@shared/schema";

const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.string().default("0"),
  discountRate: z.string().default("0"),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.string().min(1, "Quantity is required"),
    rate: z.string().min(1, "Rate is required"),
  })).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  onSuccess: () => void;
}

export default function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const { toast } = useToast();
  const [calculating, setCalculating] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: "",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      taxRate: "0",
      discountRate: "0",
      notes: "",
      items: [
        { description: "", quantity: "1", rate: "" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      onSuccess();
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
        description: "Failed to create invoice.",
        variant: "destructive",
      });
    },
  });

  const calculateTotals = () => {
    const watchedFields = form.getValues();
    
    const subtotal = watchedFields.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);

    const taxRate = parseFloat(watchedFields.taxRate) || 0;
    const discountRate = parseFloat(watchedFields.discountRate) || 0;
    
    const discountAmount = subtotal * (discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (data: InvoiceFormData) => {
    setCalculating(true);
    
    const processedItems = data.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: (parseFloat(item.quantity) * parseFloat(item.rate)).toString(),
    }));

    const invoiceData = {
      clientId: data.clientId,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      status: "draft",
      subtotal: totals.subtotal,
      taxRate: data.taxRate,
      taxAmount: totals.taxAmount,
      discountRate: data.discountRate,
      discountAmount: totals.discountAmount,
      total: totals.total,
      notes: data.notes,
      items: processedItems,
    };

    createInvoiceMutation.mutate(invoiceData);
    setCalculating(false);
  };

  const addLineItem = () => {
    append({ description: "", quantity: "1", rate: "" });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Client and Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-invoice-client">
                      <SelectValue placeholder="Select a client..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientsLoading ? (
                      <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                    ) : clients?.length === 0 ? (
                      <SelectItem value="no-clients" disabled>No clients available</SelectItem>
                    ) : (
                      clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-invoice-issue-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-invoice-due-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">Invoice Items</h3>
            <Button type="button" variant="outline" onClick={addLineItem} data-testid="button-add-line-item">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Service or product description" data-testid={`input-item-description-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} data-testid={`input-item-quantity-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.rate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} data-testid={`input-item-rate-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <div className="w-full">
                      <FormLabel>Amount</FormLabel>
                      <div className="px-3 py-2 bg-muted rounded-md text-muted-foreground" data-testid={`text-item-amount-${index}`}>
                        ${((parseFloat(form.watch(`items.${index}.quantity`)) || 0) * (parseFloat(form.watch(`items.${index}.rate`)) || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={fields.length === 1}
                      data-testid={`button-remove-item-${index}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <Card className="p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} data-testid="input-tax-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} data-testid="input-discount-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground" data-testid="text-subtotal">${totals.subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tax ({form.watch("taxRate")}%):</span>
                <span className="font-medium text-foreground" data-testid="text-tax-amount">${totals.taxAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount ({form.watch("discountRate")}%):</span>
                <span className="font-medium text-foreground" data-testid="text-discount-amount">-${totals.discountAmount}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total:</span>
                  <span className="text-lg font-bold text-foreground" data-testid="text-total">${totals.total}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Thank you for your business! Payment is due within 30 days."
                  data-testid="input-invoice-notes" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-border">
          <Button 
            type="submit" 
            disabled={createInvoiceMutation.isPending || calculating}
            data-testid="button-create-invoice"
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
