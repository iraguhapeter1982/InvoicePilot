import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import MetricsGrid from "@/components/metrics-grid";
import RecentInvoices from "@/components/recent-invoices";
import { EmailStatsCards, EmailLogsTable } from "@/components/email-analytics";
import { useEmailStats, useEmailLogs } from "@/hooks/useEmailAnalytics";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [emailStatsDays, setEmailStatsDays] = useState(30);
  const [emailLogsLimit, setEmailLogsLimit] = useState(25);
  
  const { data: emailStats, isLoading: emailStatsLoading } = useEmailStats(emailStatsDays);
  const { data: emailLogs, isLoading: emailLogsLoading } = useEmailLogs(emailLogsLimit);

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
        
        {/* Email Analytics Section */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold gradient-text">📧 Email Analytics</h2>
              <p className="text-muted-foreground">
                Track your email delivery and engagement metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Period:</span>
                <Select value={emailStatsDays.toString()} onValueChange={(value) => setEmailStatsDays(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={emailLogsLimit.toString()} onValueChange={(value) => setEmailLogsLimit(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Email Stats Cards */}
          <EmailStatsCards 
            stats={emailStats || { totalSent: 0, totalDelivered: 0, totalOpened: 0, totalFailed: 0, deliveryRate: 0, openRate: 0, byType: {} }} 
            isLoading={emailStatsLoading} 
          />
          
          {/* Email Logs Table */}
          <EmailLogsTable 
            logs={emailLogs || []} 
            isLoading={emailLogsLoading} 
          />
        </div>
        
        {/* Recent Invoices */}
        <RecentInvoices />
      </main>
    </div>
  );
}