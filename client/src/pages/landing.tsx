import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Users, CreditCard, Mail, Download, BarChart3, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="modern-card sticky top-0 z-50 border-b-0 shadow-lg bg-card/80 backdrop-blur-md">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 btn-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold gradient-text">InvoiceFlow</h1>
            </div>
            
            <Button onClick={handleLogin} className="btn-gradient touch-target" data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center animate-fade-in">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Professional Invoicing Made Simple
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Get Paid Faster with
            <span className="gradient-text block mt-2">Beautiful Invoices</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Create, send, and track professional invoices in minutes. 
            Streamline your billing process with integrated payments and automated reminders.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="btn-gradient text-lg px-8 py-4 touch-target w-full sm:w-auto"
              data-testid="button-get-started"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              No credit card required
            </div>
          </div>

          {/* Features Preview */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Professional Templates
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Online Payments
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Instant PDF Export
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to manage invoices
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to save you time and help you get paid faster
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="modern-card hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Receipt className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Professional Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Beautiful, customizable invoice templates that reflect your brand. 
                  Add your logo and colors for a professional look.
                </p>
              </CardContent>
            </Card>

            <Card className="modern-card hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Store client information securely. Quickly create invoices 
                  for returning customers with saved details.
                </p>
              </CardContent>
            </Card>

            <Card className="modern-card hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <CreditCard className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Online Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Accept credit card payments with Stripe integration. 
                  Get paid faster with convenient online payment options.
                </p>
              </CardContent>
            </Card>

            <Card className="modern-card hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Mail className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl">Email Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Send invoices directly from the app with delivery tracking. 
                  Know when clients receive and open your invoices.
                </p>
              </CardContent>
            </Card>

            <Card className="modern-card hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">PDF Export</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Generate professional PDF invoices instantly. 
                  Download for your records or print for mailing.
                </p>
              </CardContent>
            </Card>

            <Card className="modern-card hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                  <BarChart3 className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Dashboard Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Track your business performance with detailed metrics. 
                  Monitor paid, pending, and overdue invoices at a glance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl">
          <Card className="modern-card text-center p-8 md:p-12">
            <div className="w-20 h-20 btn-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Receipt className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to streamline your invoicing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers and small businesses who save time and get paid faster with InvoiceFlow.
            </p>
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="btn-gradient text-lg px-8 py-4 touch-target"
              data-testid="button-start-now"
            >
              Start Invoicing Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-muted/20">
        <div className="container max-w-6xl text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 btn-gradient rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg">InvoiceFlow</span>
          </div>
          <p className="text-muted-foreground text-lg">
            Professional invoicing made simple for freelancers and small businesses.
          </p>
        </div>
      </footer>
    </div>
  );
}