import * as nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.warn('Email service not configured. Skipping email send.');
        return false;
      }

      const mailOptions = {
        from: `"CollabBridge" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`, { messageId: result.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = this.generateWelcomeEmailTemplate(userName);
    
    return await this.sendEmail({
      to: userEmail,
      subject: 'Welcome to CollabBridge!',
      html,
      text: `Welcome to CollabBridge, ${userName}! Thank you for joining our platform.`
    });
  }

  async sendBookingNotification(
    userEmail: string, 
    userName: string, 
    eventTitle: string, 
    actionUrl: string
  ): Promise<boolean> {
    const html = this.generateBookingNotificationTemplate(userName, eventTitle, actionUrl);
    
    return await this.sendEmail({
      to: userEmail,
      subject: `New Booking Request - ${eventTitle}`,
      html,
      text: `You have a new booking request for ${eventTitle}. Visit your dashboard to respond.`
    });
  }

  async sendEventApplicationNotification(
    userEmail: string,
    userName: string,
    eventTitle: string,
    professionalName: string,
    actionUrl: string
  ): Promise<boolean> {
    const html = this.generateApplicationNotificationTemplate(
      userName, 
      eventTitle, 
      professionalName, 
      actionUrl
    );
    
    return await this.sendEmail({
      to: userEmail,
      subject: `New Application for ${eventTitle}`,
      html,
      text: `${professionalName} has applied for your event "${eventTitle}". Review the application in your dashboard.`
    });
  }

  private generateWelcomeEmailTemplate(userName: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to CollabBridge</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
                display: inline-block; 
                background: #6366f1; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to CollabBridge!</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p>Thank you for joining CollabBridge, the premier platform connecting event planners with creative professionals.</p>
                <p>You can now:</p>
                <ul>
                    <li>Create and manage events</li>
                    <li>Connect with talented professionals</li>
                    <li>Build your professional network</li>
                    <li>Showcase your work and skills</li>
                </ul>
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Visit Your Dashboard</a>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>Best regards,<br>The CollabBridge Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateBookingNotificationTemplate(
    userName: string, 
    eventTitle: string, 
    actionUrl: string
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Booking Request</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
                display: inline-block; 
                background: #059669; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Booking Request</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p>You have received a new booking request for:</p>
                <h3>${eventTitle}</h3>
                <p>Please review the details and respond to the request as soon as possible.</p>
                <a href="${actionUrl}" class="button">Review Booking Request</a>
                <p>Best regards,<br>The CollabBridge Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateApplicationNotificationTemplate(
    userName: string,
    eventTitle: string,
    professionalName: string,
    actionUrl: string
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Event Application</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
                display: inline-block; 
                background: #3b82f6; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Application Received</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p><strong>${professionalName}</strong> has applied for your event:</p>
                <h3>${eventTitle}</h3>
                <p>Review their application, portfolio, and proposed terms in your dashboard.</p>
                <a href="${actionUrl}" class="button">Review Application</a>
                <p>Best regards,<br>The CollabBridge Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}