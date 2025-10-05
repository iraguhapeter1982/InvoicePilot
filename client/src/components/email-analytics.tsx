import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Mail, MailOpen, Send, X } from "lucide-react";
import { EmailStats, EmailLog } from "@/hooks/useEmailAnalytics";
import { format } from "date-fns";

interface EmailStatsCardsProps {
  stats: EmailStats;
  isLoading?: boolean;
}

export function EmailStatsCards({ stats, isLoading }: EmailStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSent}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSent > 0 ? "Emails sent successfully" : "No emails sent"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDelivered}</div>
          <p className="text-xs text-muted-foreground">
            {stats.deliveryRate.toFixed(1)}% delivery rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Opened</CardTitle>
          <MailOpen className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOpened}</div>
          <p className="text-xs text-muted-foreground">
            {stats.openRate.toFixed(1)}% open rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFailed}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSent > 0 ? ((stats.totalFailed / stats.totalSent) * 100).toFixed(1) : 0}% failure rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface EmailStatusBadgeProps {
  status: EmailLog['status'];
}

export function EmailStatusBadge({ status }: EmailStatusBadgeProps) {
  const statusConfig = {
    pending: { variant: "secondary" as const, icon: Mail, text: "Pending" },
    sent: { variant: "default" as const, icon: Send, text: "Sent" },
    delivered: { variant: "default" as const, icon: CheckCircle, text: "Delivered" },
    opened: { variant: "default" as const, icon: MailOpen, text: "Opened" },
    failed: { variant: "destructive" as const, icon: X, text: "Failed" },
    bounced: { variant: "destructive" as const, icon: AlertCircle, text: "Bounced" },
    complaint: { variant: "destructive" as const, icon: AlertCircle, text: "Complaint" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}

interface EmailTypeBadgeProps {
  type: EmailLog['emailType'];
}

export function EmailTypeBadge({ type }: EmailTypeBadgeProps) {
  const typeConfig = {
    invoice: { variant: "default" as const, text: "Invoice" },
    password_reset: { variant: "secondary" as const, text: "Password Reset" },
    welcome: { variant: "default" as const, text: "Welcome" },
    notification: { variant: "outline" as const, text: "Notification" },
  };

  const config = typeConfig[type] || typeConfig.notification;

  return (
    <Badge variant={config.variant}>
      {config.text}
    </Badge>
  );
}

interface EmailLogsTableProps {
  logs: EmailLog[];
  isLoading?: boolean;
}

export function EmailLogsTable({ logs, isLoading }: EmailLogsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Email Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest {logs.length} email logs from your account
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Opened</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No email logs found. Send some emails to see activity here.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <EmailTypeBadge type={log.emailType} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{log.recipientEmail}</div>
                      {log.recipientName && (
                        <div className="text-sm text-muted-foreground">{log.recipientName}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <EmailStatusBadge status={log.status} />
                  </TableCell>
                  <TableCell>
                    {log.sentAt ? (
                      <div className="text-sm">
                        {format(new Date(log.sentAt), 'MMM d, HH:mm')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.deliveredAt ? (
                      <div className="text-sm">
                        {format(new Date(log.deliveredAt), 'MMM d, HH:mm')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.openedAt ? (
                      <div className="text-sm">
                        {format(new Date(log.openedAt), 'MMM d, HH:mm')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}