import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { insertClientSchema, insertInvoiceSchema, insertInvoiceItemSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import { generateInvoicePDF } from "./services/pdf";
import { sendInvoiceEmail } from "./services/email";
import { emailLogger } from "./services/emailLogger";

let stripe: Stripe | null = null;

// Initialize Stripe only if API key is available
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // req.user is now the user object (without password) from our local auth
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const user = await storage.updateUserProfile(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clients = await storage.getClients(userId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clientData = insertClientSchema.parse({ ...req.body, userId });
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;
      const client = await storage.updateClient(id, userId, updateData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await storage.deleteClient(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const invoice = await storage.getInvoice(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items, ...invoiceData } = req.body;
      
      const invoiceNumber = await storage.getNextInvoiceNumber(userId);
      const invoice = insertInvoiceSchema.parse({ 
        ...invoiceData, 
        userId,
        invoiceNumber 
      });
      
      const validatedItems = items.map((item: any) => 
        insertInvoiceItemSchema.parse(item)
      );
      
      const newInvoice = await storage.createInvoice(invoice, validatedItems);
      res.json(newInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;
      const invoice = await storage.updateInvoice(id, userId, updateData);
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await storage.deleteInvoice(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Invoice actions
  app.post('/api/invoices/:id/send', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const invoice = await storage.getInvoice(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate PDF
      const pdfBuffer = await generateInvoicePDF(invoice, user);
      
      // Send email
      await sendInvoiceEmail(invoice, user, pdfBuffer);
      
      // Mark as sent
      await storage.markEmailSent(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ message: "Failed to send invoice" });
    }
  });

  app.get('/api/invoices/:id/pdf', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const invoice = await storage.getInvoice(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const pdfBuffer = await generateInvoicePDF(invoice, user);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Email tracking
  app.get('/api/track/open/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markEmailOpened(id);
      
      // Return a 1x1 transparent pixel
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.send(pixel);
    } catch (error) {
      console.error("Error tracking email open:", error);
      res.status(500).send('Error');
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const metrics = await storage.getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing not configured - Stripe API key not set" });
      }

      const { invoiceId } = req.body;
      const userId = req.user.id;
      
      const invoice = await storage.getInvoice(invoiceId, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const amount = Math.round(parseFloat(invoice.total) * 100); // Convert to cents
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          invoiceId: invoice.id,
          userId,
        },
      });

      // Update invoice with payment intent ID
      await storage.updateInvoice(invoiceId, userId, {
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      console.warn('Stripe webhook received but Stripe not configured');
      return res.status(503).json({ message: "Payment processing not configured" });
    }

    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata?.invoiceId;
      
      if (invoiceId) {
        await storage.updateInvoiceStatus(invoiceId, 'paid');
      }
    }

    res.json({ received: true });
  });

  // Email analytics routes
  app.get('/api/email-analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const days = parseInt(req.query.days as string) || 30;
      
      const stats = await emailLogger.getEmailStats(userId, days);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching email stats:", error);
      res.status(500).json({ message: "Failed to fetch email statistics" });
    }
  });

  app.get('/api/email-analytics/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const logs = await emailLogger.getRecentEmailLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ message: "Failed to fetch email logs" });
    }
  });

  // Webhook endpoints for email tracking
  app.post('/api/webhook/resend/delivery', async (req, res) => {
    try {
      const { type, data } = req.body;
      
      if (type === 'email.delivered' && data?.id) {
        await emailLogger.logEmailDelivery(data.id, 'delivered');
      } else if (type === 'email.bounced' && data?.id) {
        await emailLogger.logEmailDelivery(data.id, 'bounced');
      } else if (type === 'email.complaint' && data?.id) {
        await emailLogger.logEmailDelivery(data.id, 'complaint');
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Error processing email webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  app.get('/api/track/open/:invoiceId', async (req, res) => {   
    try {
      const { invoiceId } = req.params;
      
      // Log email open in invoice tracking
      await storage.markEmailOpened(invoiceId);
      
      // Also log in email analytics if we can find the email log
      // This is a simple 1x1 transparent pixel
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // 1x1 transparent GIF
      const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.send(transparentGif);
    } catch (error) {
      console.error("Error tracking email open:", error);
      res.status(200).send(); // Still return 200 to not break email display
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
