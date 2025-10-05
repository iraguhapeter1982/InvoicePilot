import { EmailLog, InsertEmailLog } from '@shared/schema';
import { createStorage } from '../storage';

export interface EmailLogData {
  userId: string;
  invoiceId?: string;
  emailType: 'invoice' | 'password_reset' | 'welcome' | 'notification';
  recipientEmail: string;
  senderEmail?: string;
  subject?: string;
  metadata?: Record<string, any>;
}

export interface EmailSendResult {
  success: boolean;
  providerId?: string;
  providerResponse?: Record<string, any>;
  error?: string;
}

class EmailLoggerService {
  private storage = createStorage();

  /**
   * Log an email attempt before sending
   */
  async logEmailAttempt(data: EmailLogData): Promise<string> {
    const emailLog: InsertEmailLog = {
      userId: data.userId,
      invoiceId: data.invoiceId,
      emailType: data.emailType,
      recipientEmail: data.recipientEmail,
      senderEmail: data.senderEmail,
      status: 'pending',
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    };

    const logId = await this.storage.createEmailLog(emailLog);
    return logId;
  }

  /**
   * Update email log with send result
   */
  async logEmailResult(logId: string, result: EmailSendResult): Promise<void> {
    const updateData: Partial<InsertEmailLog> = {
      status: result.success ? 'sent' : 'failed',
      providerId: result.providerId,
      providerResponse: result.providerResponse ? JSON.stringify(result.providerResponse) : null,
      errorMessage: result.error,
      sentAt: result.success ? new Date() : null,
    };

    await this.storage.updateEmailLog(logId, updateData);
  }

  /**
   * Log email delivery status (called by webhooks)
   */
  async logEmailDelivery(providerId: string, status: 'delivered' | 'bounced' | 'complaint'): Promise<void> {
    const updateData: Partial<InsertEmailLog> = {
      status,
      deliveredAt: status === 'delivered' ? new Date() : null,
    };

    await this.storage.updateEmailLogByProviderId(providerId, updateData);
  }

  /**
   * Log email open event (called by webhooks)
   */
  async logEmailOpen(providerId: string): Promise<void> {
    const updateData: Partial<InsertEmailLog> = {
      openedAt: new Date(),
    };

    await this.storage.updateEmailLogByProviderId(providerId, updateData);
  }

  /**
   * Get email statistics for a user
   */
  async getEmailStats(userId: string, days: number = 30): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalFailed: number;
    deliveryRate: number;
    openRate: number;
    byType: Record<string, number>;
  }> {
    return await this.storage.getEmailStats(userId, days);
  }

  /**
   * Get recent email logs for debugging
   */
  async getRecentEmailLogs(userId: string, limit: number = 50): Promise<EmailLog[]> {
    return await this.storage.getRecentEmailLogs(userId, limit);
  }

  /**
   * Helper method to log complete email send operation
   */
  async logEmailSend(data: EmailLogData, sendOperation: () => Promise<EmailSendResult>): Promise<EmailSendResult> {
    const logId = await this.logEmailAttempt(data);
    
    try {
      const result = await sendOperation();
      await this.logEmailResult(logId, result);
      return result;
    } catch (error) {
      const errorResult: EmailSendResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      await this.logEmailResult(logId, errorResult);
      throw error;
    }
  }
}

// Export singleton instance
export const emailLogger = new EmailLoggerService();