// SMS/Viber Service using SMSme.gr API
// Documentation: https://smsme.gr/api-docs (example structure)

export interface SMSRecipient {
  phone: string;
  name?: string;
}

export interface SendSMSOptions {
  to: string | string[];
  message: string;
  sender?: string;
  channel?: 'sms' | 'viber';
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private apiKey: string | null = null;
  private senderId: string = 'FightingRstr';
  private baseUrl: string = 'https://api.smsme.gr/v1'; // Example URL - adjust based on actual API

  /**
   * Initialize the SMS service with API credentials
   */
  initialize(apiKey: string, senderId?: string): void {
    this.apiKey = apiKey;
    if (senderId) this.senderId = senderId;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send SMS
   */
  async sendSMS(options: SendSMSOptions): Promise<SMSResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'SMS service not initialized. Please configure API key in settings.',
      };
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const channel = options.channel || 'sms';

      // SMSme.gr API structure (adjust based on actual API documentation)
      const payload = {
        api_key: this.apiKey,
        sender: options.sender || this.senderId,
        recipients: recipients,
        message: options.message,
        channel: channel, // 'sms' or 'viber'
      };

      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        return {
          success: false,
          error: data.message || data.error || 'Failed to send SMS',
        };
      }

      return {
        success: true,
        messageId: data.messageId || data.id,
      };
    } catch (error) {
      console.error('[SMSService] Error sending SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send bulk SMS/Viber (for announcements)
   */
  async sendBulkSMS(
    recipients: SMSRecipient[],
    message: string,
    channel: 'sms' | 'viber' = 'sms',
    sendRate?: number
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!this.apiKey) {
      return {
        success: 0,
        failed: recipients.length,
        errors: ['SMS service not initialized'],
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
      const phoneNumbers = batch.map(r => r.phone);
      
      try {
        const response = await this.sendSMS({
          to: phoneNumbers,
          message,
          channel,
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
   * Calculate estimated cost for SMS/Viber
   */
  calculateCost(message: string, recipientCount: number, channel: 'sms' | 'viber' = 'sms'): number {
    const smsLength = 160; // Standard SMS length
    const smsCost = 0.037; // €0.037 per SMS (SMSme.gr pricing)
    const viberCost = 0.01; // €0.01 per Viber message (SMSme.gr pricing)

    const costPerMessage = channel === 'viber' ? viberCost : smsCost;
    const messageCount = Math.ceil(message.length / smsLength);

    return messageCount * recipientCount * costPerMessage;
  }

  /**
   * Get remaining credits/quota (if available from API)
   */
  async getQuota(): Promise<{ credits: number } | null> {
    if (!this.apiKey) return null;

    try {
      const response = await fetch(`${this.baseUrl}/quota`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          credits: data.credits || data.balance || 0,
        };
      }
    } catch (error) {
      console.error('[SMSService] Error fetching quota:', error);
    }

    return null;
  }
}

// Export singleton instance
export const smsService = new SMSService();

