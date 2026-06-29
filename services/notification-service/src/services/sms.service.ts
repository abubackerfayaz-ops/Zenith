import twilio from 'twilio';

interface SmsOptions {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string[];
  statusCallback?: string;
}

interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
  price?: string;
}

interface VerificationResult {
  success: boolean;
  valid: boolean;
  error?: string;
}

export class SmsService {
  private client: twilio.Twilio | null = null;
  private static instance: SmsService;

  private constructor() {
    this.initClient();
  }

  static getInstance(): SmsService {
    if (!SmsService.instance) {
      SmsService.instance = new SmsService();
    }
    return SmsService.instance;
  }

  private initClient(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
      console.log('[SMS] Twilio client initialized');
    } else {
      console.warn('[SMS] Twilio config incomplete, SMS disabled');
    }
  }

  isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+[1-9]\d{10,14}$/.test(cleaned);
  }

  async send(options: SmsOptions): Promise<SmsResult> {
    if (!this.client) {
      return { success: false, error: 'SMS client not configured' };
    }

    if (!this.isValidPhoneNumber(options.to)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    try {
      const message = await this.client.messages.create({
        to: options.to,
        from: options.from || process.env.TWILIO_PHONE_NUMBER,
        body: options.body,
        mediaUrl: options.mediaUrl,
        statusCallback: options.statusCallback,
      });

      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        price: message.price,
      };
    } catch (error: any) {
      console.error('[SMS] Send failed:', error);

      if (error.code === 21211) {
        return { success: false, error: 'Invalid phone number' };
      }
      if (error.code === 21608) {
        return { success: false, error: 'Unverified phone number for trial account' };
      }
      if (error.code === 20003) {
        return { success: false, error: 'Authentication failed - check Twilio credentials' };
      }

      return { success: false, error: error.message };
    }
  }

  async verifyNumber(phoneNumber: string): Promise<VerificationResult> {
    if (!this.isValidPhoneNumber(phoneNumber)) {
      return { success: true, valid: false, error: 'Invalid phone number format' };
    }
    return { success: true, valid: true };
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<SmsResult> {
    return this.send({
      to: phoneNumber,
      body: `Your FameWars verification code is: ${code}. It expires in 10 minutes.`,
    });
  }
}
