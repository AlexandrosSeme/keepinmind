// Email Service using Maileroo API
// Documentation: https://maileroo.com/docs

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  from?: {
    email: string;
    name?: string;
  };
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    type?: string;
  }>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private apiKey: string | null = null;
  private fromEmail: string = 'noreply@example.com';
  private fromName: string = 'Fighting Rooster Athens';
  private baseUrl: string = 'https://smtp.maileroo.com/api/v2'; // Maileroo API endpoint

  /**
   * Initialize the email service with API credentials
   */
  initialize(apiKey: string, fromEmail?: string, fromName?: string): void {
    this.apiKey = apiKey;
    if (fromEmail) this.fromEmail = fromEmail;
    if (fromName) this.fromName = fromName;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send a single email
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Email service not initialized. Please configure API key in settings.',
      };
    }

    const fromEmail = options.from?.email || this.fromEmail;
    if (!fromEmail || fromEmail.trim() === '') {
      return {
        success: false,
        error: 'From email address is required. Please set a verified email address in Settings.',
      };
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      const payload = {
        from: {
          email: options.from?.email || this.fromEmail,
          name: options.from?.name || this.fromName,
        },
        to: recipients.map(r => ({
          email: r.email,
          name: r.name || r.email,
        })),
        subject: options.subject,
        text: options.text || '',
        html: options.html || options.text || '',
        ...(options.replyTo && { replyTo: options.replyTo }),
        ...(options.attachments && { attachments: options.attachments }),
      };

      console.log('📤 Sending request to Maileroo API...');
      console.log('API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      // Use backend proxy server to avoid CORS issues
      // The proxy server runs on http://localhost:3001
      const proxyUrl = 'http://localhost:3001/api/maileroo/send';
      const isDevelopment = import.meta.env.DEV;
      
      // In development, use the proxy server
      // In production, you'll need to deploy the proxy server or use a different solution
      const endpoint = isDevelopment 
        ? proxyUrl  // Use local proxy server
        : `${this.baseUrl}/emails`; // Direct API (will fail due to CORS, needs backend)

      console.log(`🔄 Sending request to: ${endpoint}`);
      console.log(`Environment: ${isDevelopment ? 'Development (using proxy server)' : 'Production'}`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey, // Maileroo uses X-Api-Key header
        'Authorization': `Bearer ${this.apiKey}`, // Also try Bearer token
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      console.log(`📊 Response status: ${response.status}`);

      const data = await response.json().catch(() => {
        console.error('Failed to parse response as JSON');
        return { message: 'Unknown error', error: 'Invalid response from server' };
      });

      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        return {
          success: false,
          error: data.message || data.error || `Failed to send email (Status: ${response.status})`,
        };
      }

      return {
        success: true,
        messageId: data.messageId || data.id,
      };
    } catch (error) {
      console.error('[EmailService] Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send bulk emails (for announcements)
   */
  async sendBulkEmails(
    recipients: EmailRecipient[],
    subject: string,
    message: string,
    htmlMessage?: string,
    sendRate?: number
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!this.apiKey) {
      return {
        success: 0,
        failed: recipients.length,
        errors: ['Email service not initialized'],
      };
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Get send rate from localStorage or use default (3)
    const rate = sendRate || parseInt(localStorage.getItem('sendRate') || '3', 10);
    
    // Calculate batch size based on rate (1-5)
    // Rate 1: 1-2 per batch, Rate 2: 2-5, Rate 3: 5-10, Rate 4: 10-20, Rate 5: 20-50
    const batchSizes = [2, 5, 10, 20, 50];
    const batchSize = batchSizes[rate - 1] || 10;
    
    // Calculate delay between batches (in milliseconds)
    // Rate 1: 2000ms, Rate 2: 1500ms, Rate 3: 1000ms, Rate 4: 500ms, Rate 5: 200ms
    const delays = [2000, 1500, 1000, 500, 200];
    const delay = delays[rate - 1] || 1000;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        const response = await this.sendEmail({
          to: batch,
          subject,
          text: message,
          html: htmlMessage || message.replace(/\n/g, '<br>'),
        });

        if (response.success) {
          results.success += batch.length;
        } else {
          results.failed += batch.length;
          results.errors.push(response.error || 'Unknown error');
        }

        // Delay between batches based on send rate
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        results.failed += batch.length;
        results.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return results;
  }

  /**
   * Get remaining email quota (if available from API)
   */
  async getQuota(): Promise<{ used: number; limit: number } | null> {
    if (!this.apiKey) return null;

    try {
      const response = await fetch(`${this.baseUrl}/quota`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          used: data.used || 0,
          limit: data.limit || 3000, // Default Maileroo free tier
        };
      }
    } catch (error) {
      console.error('[EmailService] Error fetching quota:', error);
    }

    return null;
  }
}

// Export singleton instance
export const emailService = new EmailService();

