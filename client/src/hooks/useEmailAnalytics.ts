import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  byType: Record<string, number>;
}

export interface EmailLog {
  id: string;
  userId: string;
  invoiceId?: string;
  emailType: 'invoice' | 'password_reset' | 'welcome' | 'notification';
  recipientEmail: string;
  recipientName?: string;
  senderEmail?: string;
  senderName?: string;
  subject?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced' | 'complaint';
  providerId?: string;
  providerResponse?: string;
  errorMessage?: string;
  metadata?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function useEmailStats(days: number = 30) {
  return useQuery<EmailStats>({
    queryKey: [`/api/email-analytics/stats`, days],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/email-analytics/stats?days=${days}`);
      return response.json();
    },
  });
}

export function useEmailLogs(limit: number = 50) {
  return useQuery<EmailLog[]>({
    queryKey: [`/api/email-analytics/logs`, limit],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/email-analytics/logs?limit=${limit}`);
      return response.json();
    },
  });
}