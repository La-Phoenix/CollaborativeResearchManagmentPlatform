import fs from 'fs';
import path from 'path';
import { BrevoClient } from '@getbrevo/brevo';

const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY || "undefined"
});

export class EmailService {
  private static getTemplate(templateName: string, variables: Record<string, string>): string {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
    try {
      let html = fs.readFileSync(templatePath, 'utf-8');
      // Replace all {{key}} with value
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
      }
      return html;
    } catch (error) {
      console.error(`Could not load template ${templateName}:`, error);
      return '';
    }
  }

  static async sendEmail(toEmail: string, toName: string, subject: string, templateName: string, variables: Record<string, string>) {
    const htmlContent = this.getTemplate(templateName, variables);
    if (!htmlContent) return;

    try {
      await brevoClient.transactionalEmails.sendTransacEmail({
        subject,
        htmlContent,
        sender: { name: 'ResearchHub', email: 'no-reply@justinch.dev' },
        to: [{ email: toEmail, name: toName }]
      });
      console.log(`Email sent to ${toEmail}`);
    } catch (error) {
      console.error(`Failed to send email to ${toEmail}:`, error);
    }
  }

  static async sendMemberAdded(email: string, name: string, projectName: string, role: string) {
    await this.sendEmail(
      email,
      name,
      'You have been added to a project',
      'member-added',
      { userName: name, projectName, role }
    );
  }
}
