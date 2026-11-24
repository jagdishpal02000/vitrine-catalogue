import nodemailer from 'nodemailer';

export interface MailMessage {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

/** Anything that can send an email. To change provider, add an implementation and wire it in container.ts. */
export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
}

/**
 * Sends email over SMTP: Mailpit locally, or in production any provider with an SMTP endpoint
 * (AWS SES, SendGrid, Postmark, ...), chosen purely through environment variables.
 */
export function createSmtpMailer({
  host,
  port,
  secure,
  user,
  password,
  from,
}: SmtpSettings): Mailer {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && password ? { user, pass: password } : undefined,
  });

  return {
    async send(message) {
      await transporter.sendMail({ from, ...message });
    },
  };
}
