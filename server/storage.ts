import {
  users,
  clients,
  invoices,
  invoiceItems,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Invoice,
  type InvoiceWithDetails,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type DashboardMetrics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  
  // Client operations
  getClients(userId: string): Promise<Client[]>;
  getClient(id: string, userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, userId: string, data: Partial<Client>): Promise<Client>;
  deleteClient(id: string, userId: string): Promise<void>;
  
  // Invoice operations
  getInvoices(userId: string): Promise<InvoiceWithDetails[]>;
  getInvoice(id: string, userId: string): Promise<InvoiceWithDetails | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<InvoiceWithDetails>;
  updateInvoice(id: string, userId: string, data: Partial<Invoice>): Promise<Invoice>;
  updateInvoiceStatus(id: string, status: string): Promise<Invoice>;
  deleteInvoice(id: string, userId: string): Promise<void>;
  getNextInvoiceNumber(userId: string): Promise<string>;
  markEmailSent(id: string): Promise<void>;
  markEmailOpened(id: string): Promise<void>;
  
  // Dashboard metrics
  getDashboardMetrics(userId: string): Promise<DashboardMetrics>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User> {
    const [user] = await db.insert(users)
      .values({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getClients(userId: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: string, userId: string): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, userId: string, data: Partial<Client>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return client;
  }

  async deleteClient(id: string, userId: string): Promise<void> {
    await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
  }

  async getInvoices(userId: string): Promise<InvoiceWithDetails[]> {
    const result = await db
      .select({
        invoice: invoices,
        client: clients,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));

    const invoiceIds = result.map(r => r.invoice.id);
    let items: InvoiceItem[] = [];
    if (invoiceIds.length > 0) {
      items = await db
        .select()
        .from(invoiceItems)
        .where(inArray(invoiceItems.invoiceId, invoiceIds));
    }

    return result.map(r => ({
      ...r.invoice,
      client: r.client!,
      items: items.filter(item => item.invoiceId === r.invoice.id),
    }));
  }

  async getInvoice(id: string, userId: string): Promise<InvoiceWithDetails | undefined> {
    const [result] = await db
      .select({
        invoice: invoices,
        client: clients,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (!result) return undefined;

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    return {
      ...result.invoice,
      client: result.client!,
      items,
    };
  }

  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<InvoiceWithDetails> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    
    const invoiceItemsWithId = items.map(item => ({
      ...item,
      invoiceId: newInvoice.id,
    }));
    
    const newItems = await db.insert(invoiceItems).values(invoiceItemsWithId).returning();
    
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, newInvoice.clientId));

    return {
      ...newInvoice,
      client: client!,
      items: newItems,
    };
  }

  async updateInvoice(id: string, userId: string, data: Partial<Invoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();
    return invoice;
  }

  async updateInvoiceStatus(id: string, status: string): Promise<Invoice> {
    const updateData: any = { status, updatedAt: new Date() };
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }
    
    const [invoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string, userId: string): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  }

  async getNextInvoiceNumber(userId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          gte(invoices.createdAt, yearStart),
          lte(invoices.createdAt, yearEnd)
        )
      );

    const count = result[0]?.count || 0;
    const nextNumber = count + 1;
    return `INV-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async markEmailSent(id: string): Promise<void> {
    await db
      .update(invoices)
      .set({ 
        emailSent: true, 
        emailSentAt: new Date(),
        status: 'sent',
        updatedAt: new Date() 
      })
      .where(eq(invoices.id, id));
  }

  async markEmailOpened(id: string): Promise<void> {
    await db
      .update(invoices)
      .set({ 
        emailOpened: true, 
        emailOpenedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(invoices.id, id));
  }

  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const yearStart = new Date(currentDate.getFullYear(), 0, 1);

    // Get monthly and yearly totals
    const [monthlyResult] = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` 
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, 'paid'),
          gte(invoices.paidAt, monthStart)
        )
      );

    const [yearlyResult] = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` 
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, 'paid'),
          gte(invoices.paidAt, yearStart)
        )
      );

    // Get outstanding amount
    const [outstandingResult] = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` 
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, 'sent')
        )
      );

    // Get overdue amount
    const [overdueResult] = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` 
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, 'overdue')
        )
      );

    // Get client count
    const [clientCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.userId, userId));

    // Get invoice counts
    const [invoiceCounts] = await db
      .select({
        total: sql<number>`count(*)`,
        paid: sql<number>`count(*) filter (where status = 'paid')`,
        pending: sql<number>`count(*) filter (where status = 'sent')`,
        overdue: sql<number>`count(*) filter (where status = 'overdue')`,
      })
      .from(invoices)
      .where(eq(invoices.userId, userId));

    return {
      monthlyTotal: monthlyResult?.total || '0',
      yearlyTotal: yearlyResult?.total || '0',
      outstanding: outstandingResult?.total || '0',
      overdue: overdueResult?.total || '0',
      totalClients: clientCount?.count || 0,
      totalInvoices: invoiceCounts?.total || 0,
      paidInvoices: invoiceCounts?.paid || 0,
      pendingInvoices: invoiceCounts?.pending || 0,
      overdueInvoices: invoiceCounts?.overdue || 0,
    };
  }
}

export const storage = new DatabaseStorage();
