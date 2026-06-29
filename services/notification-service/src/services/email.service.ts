import nodemailer, { Transporter } from 'nodemailer';

interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, string | number | boolean>;
  attachments?: EmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  accepted: string[];
  rejected: string[];
}

const TEMPLATES: Record<string, string> = {
  welcome: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #1a1a2e; margin-bottom: 20px;">Welcome to FameWars, {{username}}!</h1>
        <p style="color: #666; line-height: 1.6;">We're excited to have you join our community of creators. Start building your fame score and competing on the leaderboard.</p>
        <a href="{{frontendUrl}}/onboarding" style="display: inline-block; background: #e94560; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Get Started</a>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">© 2024 FameWars. All rights reserved.</p>
      </div>
    </body>
    </html>
  `,
  'fame-score-update': `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #1a1a2e; margin-bottom: 20px;">Your Fame Score Updated!</h1>
        <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px; margin: 20px 0;">
          <span style="font-size: 48px; color: #e94560; font-weight: bold;">{{score}}</span>
          <p style="color: #ccc; margin-top: 10px;">Current Fame Score</p>
        </div>
        <p style="color: #666; line-height: 1.6;">Your rank is now <strong>#{{rank}}</strong> in {{category}}. Keep creating to climb higher!</p>
        <a href="{{frontendUrl}}/dashboard" style="display: inline-block; background: #e94560; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Dashboard</a>
      </div>
    </body>
    </html>
  `,
  'new-follower': `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #1a1a2e; margin-bottom: 20px;">New Follower!</h1>
        <p style="color: #666; line-height: 1.6;"><strong>{{followerName}}</strong> started following you.</p>
        <a href="{{frontendUrl}}/profile/{{followerId}}" style="display: inline-block; background: #e94560; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Profile</a>
      </div>
    </body>
    </html>
  `,
  milestone: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #1a1a2e; margin-bottom: 20px;">Milestone Achieved! 🎉</h1>
        <p style="color: #666; line-height: 1.6;">Congratulations {{username}}! You've reached <strong>{{milestone}}</strong> on FameWars.</p>
        <a href="{{frontendUrl}}/achievements" style="display: inline-block; background: #e94560; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Achievements</a>
      </div>
    </body>
    </html>
  `,
  default: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #1a1a2e; margin-bottom: 20px;">{{title}}</h1>
        <p style="color: #666; line-height: 1.6;">{{body}}</p>
        <a href="{{frontendUrl}}" style="display: inline-block; background: #e94560; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Open FameWars</a>
      </div>
    </body>
    </html>
  `,
};

export class EmailService {
  private transporter: Transporter | null = null;
  private static instance: EmailService;

  private constructor() {
    this.initTransporter();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initTransporter(): void {
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('[Email] Transporter initialized');
    } else {
      console.warn('[Email] SMTP config incomplete, emails disabled');
    }
  }

  private renderTemplate(templateName: string, context: Record<string, string | number | boolean>): string {
    const template = TEMPLATES[templateName] || TEMPLATES.default;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    let html = template;
    html = html.replace(/\{\{frontendUrl\}\}/g, frontendUrl);
    for (const [key, value] of Object.entries(context)) {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    }
    html = html.replace(/\{\{\w+\}\}/g, '');

    return html;
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email transporter not configured',
        accepted: [],
        rejected: Array.isArray(options.to) ? options.to : [options.to],
      };
    }

    try {
      const html = this.renderTemplate(options.template, options.context);

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"FameWars" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted as string[],
        rejected: info.rejected as string[],
      };
    } catch (error: any) {
      console.error('[Email] Send failed:', error);
      return {
        success: false,
        error: error.message,
        accepted: [],
        rejected: Array.isArray(options.to) ? options.to : [options.to],
      };
    }
  }
}
