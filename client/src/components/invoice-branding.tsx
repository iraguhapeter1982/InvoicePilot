import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Palette, Upload, Eye, Save, X } from "lucide-react";

const brandingFormSchema = z.object({
  logoUrl: z.string().optional(),
  brandPrimaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  brandSecondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  brandAccentColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  invoiceTemplate: z.enum(["modern", "classic", "minimal"]),
});

type BrandingFormData = z.infer<typeof brandingFormSchema>;

const colorPresets = [
  { name: "Blue Professional", primary: "#3b82f6", secondary: "#1e40af", accent: "#10b981" },
  { name: "Purple Creative", primary: "#8b5cf6", secondary: "#7c3aed", accent: "#f59e0b" },
  { name: "Green Nature", primary: "#10b981", secondary: "#059669", accent: "#3b82f6" },
  { name: "Red Bold", primary: "#ef4444", secondary: "#dc2626", accent: "#f59e0b" },
  { name: "Orange Warm", primary: "#f97316", secondary: "#ea580c", accent: "#84cc16" },
  { name: "Slate Modern", primary: "#64748b", secondary: "#475569", accent: "#0ea5e9" },
];

export default function InvoiceBranding() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      logoUrl: "",
      brandPrimaryColor: "#3b82f6",
      brandSecondaryColor: "#1e40af", 
      brandAccentColor: "#10b981",
      invoiceTemplate: "modern",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        logoUrl: (user as any).logoUrl || "",
        brandPrimaryColor: (user as any).brandPrimaryColor || "#3b82f6",
        brandSecondaryColor: (user as any).brandSecondaryColor || "#1e40af",
        brandAccentColor: (user as any).brandAccentColor || "#10b981",
        invoiceTemplate: ((user as any).invoiceTemplate as "modern" | "classic" | "minimal") || "modern",
      });
      setLogoPreview((user as any).logoUrl || "");
    }
  }, [user, form]);

  const updateBrandingMutation = useMutation({
    mutationFn: async (data: BrandingFormData) => {
      await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Branding Updated",
        description: "Your invoice branding has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update branding.",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        form.setValue("logoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview("");
    form.setValue("logoUrl", "");
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    form.setValue("brandPrimaryColor", preset.primary);
    form.setValue("brandSecondaryColor", preset.secondary);
    form.setValue("brandAccentColor", preset.accent);
  };

  const handleSubmit = (data: BrandingFormData) => {
    updateBrandingMutation.mutate(data);
  };

  const watchedColors = form.watch(["brandPrimaryColor", "brandSecondaryColor", "brandAccentColor"]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Palette className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle className="text-xl">Invoice Branding</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <FormLabel>Company Logo</FormLabel>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload logo (max 2MB)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG or SVG recommended
                      </p>
                    </label>
                  </div>
                </div>
                {logoPreview && (
                  <div className="w-32 space-y-2">
                    <div className="w-32 h-20 border rounded-lg flex items-center justify-center bg-white p-2 relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleLogoRemove}
                      className="w-full text-destructive hover:text-destructive"
                      data-testid="button-remove-logo"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Color Presets */}
            <div className="space-y-4">
              <FormLabel>Quick Color Themes</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-start gap-2"
                    onClick={() => applyColorPreset(preset)}
                  >
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="brandPrimaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-16 h-10 p-1 border-0" />
                        <Input {...field} placeholder="#3b82f6" className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brandSecondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-16 h-10 p-1 border-0" />
                        <Input {...field} placeholder="#1e40af" className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brandAccentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-16 h-10 p-1 border-0" />
                        <Input {...field} placeholder="#10b981" className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Template Selection */}
            <FormField
              control={form.control}
              name="invoiceTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Template</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-invoice-template">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="modern">Modern - Clean and contemporary design</SelectItem>
                      <SelectItem value="classic">Classic - Traditional business format</SelectItem>
                      <SelectItem value="minimal">Minimal - Simple and elegant</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            <div className="space-y-4">
              <FormLabel>Preview</FormLabel>
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-12 object-contain" />
                  ) : (
                    <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      Your Logo
                    </div>
                  )}
                  <div className="text-right">
                    <h3 className="font-bold text-lg" style={{ color: watchedColors[0] }}>
                      INVOICE
                    </h3>
                    <p className="text-sm text-gray-600">#INV-001</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium" style={{ color: watchedColors[1] }}>Bill To:</p>
                      <p>Sample Client</p>
                      <p className="text-gray-600">client@example.com</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" style={{ color: watchedColors[1] }}>Amount Due:</p>
                      <p className="text-2xl font-bold" style={{ color: watchedColors[2] }}>$1,250.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={updateBrandingMutation.isPending}
                className="btn-gradient"
              >
                {updateBrandingMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Branding
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}