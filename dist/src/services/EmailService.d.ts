export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: any[];
}
export declare class EmailService {
    private transporter;
    constructor();
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean>;
    sendBookingNotification(userEmail: string, userName: string, eventTitle: string, actionUrl: string): Promise<boolean>;
    sendEventApplicationNotification(userEmail: string, userName: string, eventTitle: string, professionalName: string, actionUrl: string): Promise<boolean>;
    private generateWelcomeEmailTemplate;
    private generateBookingNotificationTemplate;
    private generateApplicationNotificationTemplate;
    verifyConnection(): Promise<boolean>;
}
//# sourceMappingURL=EmailService.d.ts.map