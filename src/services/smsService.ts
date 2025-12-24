// SMS Service using SMSme.gr REST API v3.0
// Documentation: https://rest.smsme.gr/swagger/index.html
// Wiki: https://wiki.smsme.gr/index.php?title=REST_API#Authentication

export interface SMSRecipient {
  phone: string;
  name?: string;
}

export interface SendSMSOptions {
  to: string | string[];
  message: string;
  sender?: string;
  deliveryDateTime?: Date; // Optional: for scheduled SMS
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  trackIds?: number[];
  totalSms?: number;
  totalCost?: number;
  error?: string;
}

interface AuthToken {
  token: string;
  expirationDate: string;
}

class SMSService {
  private username: string | null = null;
  private password: string | null = null;
  private authToken: AuthToken | null = null;
  private senderId: string = 'FightingRstr';
  private baseUrl: string = 'https://rest.smsme.gr';

  /**
   * Initialize the SMS service with SMSme.gr credentials
   */
  initialize(username: string, password: string, senderId?: string): void {
    this.username = username;
    this.password = password;
    if (senderId) this.senderId = senderId;
    // Clear existing token to force re-authentication
    this.authToken = null;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return !!(this.username && this.password);
  }

  /**
   * Authenticate with SMSme.gr API and get token
   */
  private async authenticate(): Promise<boolean> {
    if (!this.username || !this.password) {
      console.error('[SMSService] Cannot authenticate: credentials not set');
      return false;
    }

    // Check if we have a valid token
    if (this.authToken) {
      const expirationDate = new Date(this.authToken.expirationDate);
      const now = new Date();
      // Refresh token if it expires in less than 5 minutes
      if (expirationDate.getTime() - now.getTime() > 5 * 60 * 1000) {
        return true;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/Users/authenticate`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain, application/json, text/json',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SMSService] Authentication failed:', errorText);
        return false;
      }

      const data: AuthToken = await response.json();
      this.authToken = data;
      console.log('[SMSService] Authentication successful, token expires at:', data.expirationDate);
      return true;
    } catch (error) {
      console.error('[SMSService] Authentication error:', error);
      return false;
    }
  }

  /**
   * Get authentication token (with automatic refresh)
   */
  private async getAuthToken(): Promise<string | null> {
    const authenticated = await this.authenticate();
    if (!authenticated || !this.authToken) {
      return null;
    }
    return this.authToken.token;
  }

  /**
   * Normalize phone number to format required by SMSme (country code without leading zeros)
   * Example: "306912345678" or "+306912345678" -> "306912345678"
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let normalized = phone.replace(/\D/g, '');
    
    // If starts with 00, replace with nothing (will add country code)
    if (normalized.startsWith('00')) {
      normalized = normalized.substring(2);
    }
    
    // If starts with +, remove it
    if (phone.startsWith('+')) {
      normalized = phone.replace(/\D/g, '');
    }
    
    // If Greek number starts with 0, replace with 30
    if (normalized.startsWith('0') && normalized.length === 10) {
      normalized = '30' + normalized.substring(1);
    }
    
    // If doesn't start with country code and is 10 digits, assume Greek (30)
    if (normalized.length === 10 && !normalized.startsWith('30')) {
      normalized = '30' + normalized;
    }
    
    return normalized;
  }

  /**
   * Send SMS using SMSme.gr REST API
   * Supports multi-SMS automatically (concatenation for messages > 160 characters)
   */
  async sendSMS(options: SendSMSOptions): Promise<SMSResponse> {
    console.log('[SMSService] sendSMS called with options:', {
      to: Array.isArray(options.to) ? options.to : [options.to],
      messageLength: options.message?.length,
      sender: options.sender,
    });

    if (!this.isInitialized()) {
      console.error('[SMSService] Service not initialized');
      return {
        success: false,
        error: 'SMS service not initialized. Please configure SMSme.gr credentials in settings.',
      };
    }

    const token = await this.getAuthToken();
    if (!token) {
      console.error('[SMSService] Failed to get auth token');
      return {
        success: false,
        error: 'Failed to authenticate with SMSme.gr. Please check your credentials.',
      };
    }

    console.log('[SMSService] Got auth token, proceeding with SMS send...');

    try {
      // Normalize recipients
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const normalizedRecipients = recipients.map(phone => this.normalizePhoneNumber(phone));

      // Validate sender (up to 11 alphanumeric characters)
      // Remove any special characters that might cause issues
      let sender = (options.sender || this.senderId).substring(0, 11);
      // Only allow alphanumeric characters for sender
      sender = sender.replace(/[^a-zA-Z0-9]/g, '');
      
      if (!sender || sender.length === 0) {
        return {
          success: false,
          error: 'Invalid sender ID. Sender must contain at least one alphanumeric character.',
        };
      }

      // Use current time for immediate SMS (SMSme.gr requires deliveryDateTime)
      // For immediate delivery, use current time
      const now = new Date();
      let deliveryDateTime = options.deliveryDateTime || now;
      
      // If deliveryDateTime is in the past, use current time instead
      if (deliveryDateTime < now) {
        console.warn('[SMSService] deliveryDateTime is in the past, using current time instead');
        deliveryDateTime = now;
      }
      
      // If deliveryDateTime is more than 1 year in the future, it's probably a mistake
      const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      if (deliveryDateTime > oneYearFromNow) {
        console.warn('[SMSService] deliveryDateTime is too far in the future, using current time instead');
        deliveryDateTime = now;
      }

      // SMSme.gr API payload
      const payload = {
        sender: sender,
        recipients: normalizedRecipients,
        message: options.message,
        deliveryDateTime: deliveryDateTime.toISOString(),
      };

      // Validate message
      if (!options.message || options.message.trim().length === 0) {
        return {
          success: false,
          error: 'Message cannot be empty.',
        };
      }

      // Validate recipients
      if (normalizedRecipients.length === 0) {
        return {
          success: false,
          error: 'At least one recipient is required.',
        };
      }

      // Validate recipient format (should be 10-15 digits starting with country code)
      for (const recipient of normalizedRecipients) {
        if (!/^[0-9]{10,15}$/.test(recipient)) {
          return {
            success: false,
            error: `Invalid phone number format: ${recipient}. Phone numbers must be 10-15 digits with country code.`,
          };
        }
      }

      // Check balance before sending (optional, but helpful for debugging)
      // Note: SMSme.gr provides free SMS credits that may not show in balance
      // So we allow sending even with 0 balance, but warn the user
      const balance = await this.getBalance();
      if (balance !== null) {
        console.log('[SMSService] Account balance:', balance.balance);
        
        // Calculate estimated cost
        const estimatedCost = this.calculateCost(options.message, normalizedRecipients.length);
        
        // Allow sending even with 0 balance (SMSme.gr may have free SMS credits)
        // But warn if balance is insufficient for estimated cost
        if (balance.balance < estimatedCost && balance.balance > 0) {
          console.warn('[SMSService] Balance may be insufficient, but attempting to send (may have free SMS credits)');
          // Don't block, just warn - SMSme.gr may have free SMS credits
        } else if (balance.balance <= 0) {
          console.warn('[SMSService] Balance is 0, but attempting to send (may have free SMS credits available)');
          // Don't block - SMSme.gr provides free SMS credits that don't show in balance
          // The API will return an error if there are no credits available
        }
      }

      console.log('[SMSService] Sending SMS request:', {
        sender,
        recipientsCount: normalizedRecipients.length,
        recipients: normalizedRecipients,
        messageLength: options.message.length,
        deliveryDateTime: deliveryDateTime.toISOString(),
        balance: balance?.balance,
        token: token.substring(0, 20) + '...',
      });

      // Try REST API first
      const response = await fetch(`${this.baseUrl}/Sms/send`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain, application/json, text/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(payload),
      });

      // If REST API fails with "out of credit", try web interface endpoint as fallback
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SMSService] REST API SMS send failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        
        // Check if it's an "out of credit" error
        const lowerErrorText = errorText.toLowerCase();
        if (lowerErrorText.includes('out of credit') || 
            lowerErrorText.includes('account is out')) {
          console.log('[SMSService] REST API says "out of credit", but web interface may work. Note: Web interface requires session cookie from browser login.');
          // Don't try web interface automatically - it requires session cookie
          // User should use web interface directly or add balance
        }
        
        let errorMessage = `Αποτυχία αποστολής SMS (${response.status} ${response.statusText})`;
        
        // Parse error text (may be plain text or JSON)
        let apiErrorMessage = '';
        try {
          const errorData = JSON.parse(errorText);
          apiErrorMessage = errorData.message || errorData.error || errorData.title || '';
        } catch {
          // If not JSON, use the text as is
          apiErrorMessage = errorText.trim();
        }
        
        // Translate common error messages to Greek
        const lowerErrorMessage = apiErrorMessage.toLowerCase();
        if (lowerErrorMessage.includes('out of credit') || 
            lowerErrorMessage.includes('insufficient') ||
            lowerErrorMessage.includes('no credit') ||
            lowerErrorMessage.includes('account is out')) {
          errorMessage = 'Ο λογαριασμός σας δεν έχει διαθέσιμα credits στο REST API. Παρακαλώ:\n' +
            '1. Προσθέστε balance στο SMSme.gr account (https://smsme.gr/MyAccount.aspx)\n' +
            '2. Ή χρησιμοποιήστε το web interface του SMSme.gr για αποστολή (https://smsme.gr) - μπορεί να έχει διαθέσιμα δωρεάν SMS credits\n' +
            '3. Ελέγξτε το balance σας στο SMSme.gr account\n' +
            '\nΣημείωση: Το web interface μπορεί να έχει διαθέσιμα δωρεάν SMS credits που δεν φαίνονται στο REST API.';
        } else if (apiErrorMessage.toLowerCase().includes('sender') && 
                   (apiErrorMessage.toLowerCase().includes('not approved') || 
                    apiErrorMessage.toLowerCase().includes('invalid'))) {
          errorMessage = 'Το Sender ID δεν είναι approved. Τα alphanumeric sender IDs (όπως "ColosseumGy") πρέπει να εγκριθούν από το SMSme.gr support. Επικοινωνήστε με την υποστήριξη για να approve το sender ID σας.';
        } else if (apiErrorMessage.toLowerCase().includes('invalid recipient') ||
                   apiErrorMessage.toLowerCase().includes('invalid phone')) {
          errorMessage = 'Μη έγκυρος αριθμός παραλήπτη. Παρακαλώ ελέγξτε τη μορφή του αριθμού τηλεφώνου.';
        } else if (apiErrorMessage.toLowerCase().includes('authentication') ||
                   apiErrorMessage.toLowerCase().includes('unauthorized')) {
          errorMessage = 'Αποτυχία authentication. Παρακαλώ ελέγξτε τα credentials σας στο Settings.';
        } else if (apiErrorMessage) {
          // Use the API error message if available
          errorMessage = apiErrorMessage;
        }
        
        // Provide specific error messages for common status codes if no specific message found
        if (errorMessage === `Αποτυχία αποστολής SMS (${response.status} ${response.statusText})`) {
          if (response.status === 400) {
            errorMessage = 'Μη έγκυρο αίτημα. Παρακαλώ ελέγξτε το sender ID, τους παραλήπτες και τη μορφή του μηνύματος.';
          } else if (response.status === 401) {
            errorMessage = 'Αποτυχία authentication. Παρακαλώ ελέγξτε τα SMSme.gr credentials σας στο Settings.';
          } else if (response.status === 403) {
            errorMessage = 'Απαγορευμένη πρόσβαση. Ο λογαριασμός σας μπορεί να μην έχει άδεια αποστολής SMS ή το sender ID δεν είναι approved.';
          } else if (response.status === 500) {
            errorMessage = 'Σφάλμα SMSme.gr server. Αυτό μπορεί να οφείλεται σε:\n' +
              '1. Sender ID δεν είναι approved (τα alphanumeric sender IDs πρέπει να εγκριθούν από το SMSme.gr support)\n' +
              '2. Ανεπαρκές balance/credits\n' +
              '3. Μη έγκυρη μορφή παραλήπτη\n' +
              'Παρακαλώ ελέγξτε τις ρυθμίσεις του SMSme.gr account σας ή επικοινωνήστε με την υποστήριξη.';
          }
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      console.log('[SMSService] ✅ SMS send successful, response:', JSON.stringify(data, null, 2));

      // Extract track IDs from response
      interface TrackRecipient {
        recipient: string;
        trackId: number;
      }
      const trackIds = (data.trackRecipients as TrackRecipient[])?.map((r) => r.trackId) || [];

      console.log('[SMSService] Track IDs:', trackIds);
      console.log('[SMSService] Total SMS:', data.totalSms, 'Total Cost:', data.totalCost);

      return {
        success: true,
        trackIds: trackIds,
        totalSms: data.totalSms,
        totalCost: data.totalCost,
        messageId: trackIds.length > 0 ? trackIds[0].toString() : undefined,
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
   * Send bulk SMS (for announcements)
   * SMSme.gr API supports up to 1000 recipients per request
   */
  async sendBulkSMS(
    recipients: SMSRecipient[],
    message: string,
    channel: 'sms' | 'viber' = 'sms',
    sendRate?: number
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!this.isInitialized()) {
      return {
        success: 0,
        failed: recipients.length,
        errors: ['SMS service not initialized'],
      };
    }

    // SMSme.gr only supports SMS, not Viber through this API
    if (channel === 'viber') {
      return {
        success: 0,
        failed: recipients.length,
        errors: ['Viber is not supported by SMSme.gr REST API. Please use SMS channel.'],
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
    // SMSme.gr supports up to 1000 recipients per request
    // Rate 1: 10 per batch, Rate 2: 25, Rate 3: 50, Rate 4: 100, Rate 5: 200
    const batchSizes = [10, 25, 50, 100, 200];
    const batchSize = Math.min(batchSizes[rate - 1] || 50, 1000); // Max 1000 per API limit
    
    // Calculate delay between batches (in milliseconds)
    // Rate 1: 2000ms, Rate 2: 1500ms, Rate 3: 1000ms, Rate 4: 500ms, Rate 5: 200ms
    const delays = [2000, 1500, 1000, 500, 200];
    const delay = delays[rate - 1] || 1000;
    
    console.log(`[SMSService] Starting bulk SMS send: ${recipients.length} recipients, batch size: ${batchSize}, delay: ${delay}ms`);
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const phoneNumbers = batch.map(r => r.phone);
      
      console.log(`[SMSService] Processing batch ${Math.floor(i / batchSize) + 1}: ${batch.length} recipients`, phoneNumbers);
      
      try {
        const response = await this.sendSMS({
          to: phoneNumbers,
          message,
        });

        console.log(`[SMSService] Batch ${Math.floor(i / batchSize) + 1} result:`, {
          success: response.success,
          trackIds: response.trackIds,
          totalSms: response.totalSms,
          totalCost: response.totalCost,
          error: response.error,
        });

        if (response.success) {
          results.success += batch.length;
          console.log(`[SMSService] ✅ Batch ${Math.floor(i / batchSize) + 1} sent successfully: ${batch.length} SMS, Total SMS: ${response.totalSms}, Cost: €${response.totalCost}`);
        } else {
          results.failed += batch.length;
          const errorMsg = response.error || 'Unknown error';
          results.errors.push(errorMsg);
          console.error(`[SMSService] ❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, errorMsg);
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
   * Calculate estimated cost for SMS
   * SMSme.gr uses concatenation: Ceiling(total message characters / 153) * sms cost per recipient
   * Note: Euro sign "€" counts as 2 characters
   */
  calculateCost(message: string, recipientCount: number, channel: 'sms' | 'viber' = 'sms'): number {
    // SMSme.gr pricing (default: €0.04 per SMS for Greece)
    // You can fetch actual pricing from /Pricing/list endpoint
    const smsCost = 0.04; // €0.04 per SMS (default SMSme.gr pricing for Greece)
    
    if (channel === 'viber') {
      // Viber not supported by SMSme.gr REST API
      return 0;
    }

    // Count characters (€ counts as 2 characters)
    let charCount = 0;
    for (let i = 0; i < message.length; i++) {
      if (message[i] === '€') {
        charCount += 2;
      } else {
        charCount += 1;
      }
    }

    // SMSme.gr concatenation: Ceiling(charCount / 153) per recipient
    const smsCount = Math.ceil(charCount / 153);
    
    return smsCount * recipientCount * smsCost;
  }

  /**
   * Get account balance from SMSme.gr
   */
  async getBalance(): Promise<{ balance: number } | null> {
    if (!this.isInitialized()) {
      return null;
    }

    const token = await this.getAuthToken();
    if (!token) {
      console.error('[SMSService] Cannot get balance: no token');
      return null;
    }

    try {
      console.log('[SMSService] Fetching balance with token:', token.substring(0, 20) + '...');
      const response = await fetch(`${this.baseUrl}/Users/balance`, {
        method: 'GET',
        headers: {
          'accept': 'text/plain, application/json, text/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[SMSService] Balance retrieved:', data.balance);
        return {
          balance: data.balance || 0,
        };
      } else {
        const errorText = await response.text();
        console.error('[SMSService] Failed to get balance:', response.status, errorText);
      }
    } catch (error) {
      console.error('[SMSService] Error fetching balance:', error);
    }

    return null;
  }

  /**
   * Decode JWT token to see details (for debugging)
   */
  private decodeToken(token: string): {
    nameid?: string;
    nbf?: number;
    exp?: number;
    iat?: number;
  } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('[SMSService] Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Test the current token and credentials
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    balance?: number;
    tokenInfo?: {
      nameid?: string;
      nbf?: number;
      exp?: number;
      iat?: number;
    } | null;
  }> {
    if (!this.isInitialized()) {
      return {
        success: false,
        message: 'SMS service not initialized. Please configure credentials in Settings.',
      };
    }

    const token = await this.getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Failed to authenticate. Please check your username and password.',
      };
    }

    // Decode token for debugging
    const tokenInfo = this.decodeToken(token);
    if (tokenInfo && tokenInfo.exp && tokenInfo.iat) {
      const expirationDate = new Date(tokenInfo.exp * 1000);
      const now = new Date();
      console.log('[SMSService] Token info:', {
        nameid: tokenInfo.nameid,
        issuedAt: new Date(tokenInfo.iat * 1000).toISOString(),
        expiresAt: expirationDate.toISOString(),
        isExpired: expirationDate < now,
        expiresIn: Math.round((expirationDate.getTime() - now.getTime()) / 1000 / 60) + ' minutes',
      });
    }

    // Try to get balance as a test
    const balance = await this.getBalance();
    if (balance === null) {
      return {
        success: false,
        message: 'Token is valid but failed to retrieve balance. Please check your account permissions.',
        tokenInfo,
      };
    }

    return {
      success: true,
      message: `Connection successful! Account balance: €${balance.balance.toFixed(2)}`,
      balance: balance.balance,
      tokenInfo,
    };
  }

  /**
   * Get pricing information (for cost calculation)
   */
  async getPricing(): Promise<{
    countries: Array<{
      code: string;
      country: string;
      operators: Array<{
        name: string;
        mccMnc: string;
        price: number;
      }>;
    }>;
  } | null> {
    if (!this.isInitialized()) {
      return null;
    }

    const token = await this.getAuthToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/Pricing/list`, {
        method: 'GET',
        headers: {
          'accept': 'text/plain, application/json, text/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('[SMSService] Error fetching pricing:', error);
    }

    return null;
  }

  /**
   * Cancel scheduled SMS messages
   */
  async cancelSMS(trackIds: number[]): Promise<{ successful: number[]; failed: number[] }> {
    if (!this.isInitialized()) {
      return { successful: [], failed: trackIds };
    }

    const token = await this.getAuthToken();
    if (!token) {
      return { successful: [], failed: trackIds };
    }

    try {
      const response = await fetch(`${this.baseUrl}/Sms/cancel`, {
        method: 'DELETE',
        headers: {
          'accept': 'text/plain, application/json, text/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify({ trackIds }),
      });

      if (response.ok) {
        const data = await response.json();
        const successful: number[] = [];
        const failed: number[] = [];
        
        interface CancellationResult {
          trackId: number;
          successful: boolean;
          message: string;
        }
        
        (data.cancellationResults as CancellationResult[])?.forEach((result) => {
          if (result.successful) {
            successful.push(result.trackId);
          } else {
            failed.push(result.trackId);
          }
        });

        return { successful, failed };
      }
    } catch (error) {
      console.error('[SMSService] Error canceling SMS:', error);
    }

    return { successful: [], failed: trackIds };
  }
}

// Export singleton instance
export const smsService = new SMSService();

