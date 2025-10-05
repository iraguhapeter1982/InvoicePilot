import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import MetricsGrid from "@/components/metrics-grid";
import RecentInvoices from "@/components/recent-invoices";

export default function Dashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20 lg:pb-0">
      <Navigation />
      
      <main className="container animate-fade-in pt-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {getGreeting()}, {user?.firstName || 'there'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your business today
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="mb-8">
          <MetricsGrid />
        </div>
        
        {/* Recent Invoices */}
        <RecentInvoices />
      </main>
    </div>
  );
}