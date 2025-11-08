import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Recuperação de Password - HarvestPilot',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              margin: 0 0 20px 0;
              color: #555;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 600;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning p {
              margin: 0;
              color: #92400e;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 HarvestPilot</h1>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Recuperação de Password</h2>
              <p>Olá,</p>
              <p>Recebemos um pedido para redefinir a password da tua conta HarvestPilot.</p>
              <p>Para criar uma nova password, clica no botão abaixo:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Password</a>
              </div>
              <p style="margin-top: 30px;">Ou copia e cola este link no teu navegador:</p>
              <p style="word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 13px;">
                ${resetUrl}
              </p>
              <div class="warning">
                <p><strong>⚠️ Importante:</strong> Este link é válido por 1 hora. Se não solicitaste esta alteração, ignora este email.</p>
              </div>
            </div>
            <div class="footer">
              <p>HarvestPilot - Gestão Agrícola Inteligente</p>
              <p style="margin-top: 10px; color: #999; font-size: 12px;">Este é um email automático, por favor não respondas.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Recuperação de Password - HarvestPilot

Olá,

Recebemos um pedido para redefinir a password da tua conta HarvestPilot.

Para criar uma nova password, acede ao seguinte link:
${resetUrl}

Este link é válido por 1 hora.

Se não solicitaste esta alteração, ignora este email.

---
HarvestPilot - Gestão Agrícola Inteligente
      `.trim(),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw new Error('Falha ao enviar email de recuperação');
    }
  }
}
