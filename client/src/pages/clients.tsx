import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, User, Mail, Phone, MapPin, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import type { Client } from "@shared/schema";
import { z } from "zod";

const clientFormSchema = insertClientSchema.extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export default function Clients() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      phone: "",
      userId: "",
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Please log in again.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      await apiRequest("POST", "/api/clients", data);
    },
    onSuccess: () => {
      toast({
        title: "Client Created",
        description: "Client has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setShowForm(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create client.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientFormData & { id: string }) => {
      await apiRequest("PUT", `/api/clients/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Client Updated",
        description: "Client has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setShowForm(false);
      setEditingClient(null);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update client.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Client Deleted",
        description: "Client has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete client.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      name: client.name,
      email: client.email,
      address: client.address || "",
      phone: client.phone || "",
      userId: client.userId,
    });
    setShowForm(true);
  };

  const handleSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateClientMutation.mutate({ ...data, id: editingClient.id });
    } else {
      createClientMutation.mutate(data);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
    form.reset();
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20 lg:pb-0">
      <Navigation />
      
      <main className="container animate-fade-in pt-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Clients</h1>
            <p className="text-muted-foreground mt-1">Manage your client relationships</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="btn-gradient touch-target w-full sm:w-auto"
            data-testid="button-new-client"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>

        {/* Loading State */}
        {clientsLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">Loading clients...</p>
            </div>
          </div>
        ) : clients?.length === 0 ? (
          /* Empty State */
          <Card className="modern-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No clients yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-sm">
                Start building your client base by adding your first client information.
              </p>
              <Button 
                onClick={() => setShowForm(true)} 
                className="btn-gradient"
                data-testid="button-add-first-client"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first client
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Clients Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients?.map((client: Client) => (
              <Card key={client.id} className="modern-card hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate" data-testid={`text-client-name-${client.id}`}>
                          {client.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate" data-testid={`text-client-email-${client.id}`}>
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1 flex-shrink-0 sm:ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(client)}
                        className="touch-target h-8 w-8 p-0"
                        data-testid={`button-edit-client-${client.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteClientMutation.mutate(client.id)}
                        disabled={deleteClientMutation.isPending}
                        className="touch-target h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-client-${client.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span data-testid={`text-client-phone-${client.id}`}>
                        {client.phone}
                      </span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2" data-testid={`text-client-address-${client.id}`}>
                        {client.address}
                      </span>
                    </div>
                  )}
                  {!client.phone && !client.address && (
                    <p className="text-sm text-muted-foreground italic">
                      No additional contact information
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Client Form Modal */}
        <Dialog open={showForm} onOpenChange={handleCloseForm}>
          <DialogContent className="max-w-md mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-lg sm:text-xl">
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Client name" 
                          data-testid="input-client-name"
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          {...field} 
                          placeholder="client@example.com" 
                          data-testid="input-client-email"
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Phone</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="(555) 123-4567" 
                          data-testid="input-client-phone"
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Street address, city, state, zip"
                          rows={3}
                          data-testid="input-client-address"
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseForm} 
                    data-testid="button-cancel-client"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createClientMutation.isPending || updateClientMutation.isPending}
                    className="btn-gradient w-full sm:w-auto"
                    data-testid="button-save-client"
                  >
                    {editingClient ? "Update Client" : "Create Client"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
