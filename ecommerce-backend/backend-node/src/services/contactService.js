const nodemailer = require('nodemailer');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

class ContactEmailDisabledError extends Error {
  constructor(message) {
    super(message || 'Contact email service is not configured');
    this.name = 'ContactEmailDisabledError';
    this.code = 'ERR_CONTACT_EMAIL_DISABLED';
    this.status = 503;
  }
}

class ContactService {
  constructor() {
    this.transporter = null;
    this.disabledReason = null;
    this.initializeTransport();
  }

  initializeTransport() {
    const host = process.env.CONTACT_SMTP_HOST;
    const user = process.env.CONTACT_SMTP_USER;
    const pass = process.env.CONTACT_SMTP_PASS;

    if (!host || !user || !pass) {
      this.transporter = null;
      this.disabledReason = 'Missing CONTACT_SMTP_* environment variables';
      console.warn('[ContactService] Email sending disabled:', this.disabledReason);
      return;
    }

    try {
      const port = Number(process.env.CONTACT_SMTP_PORT || 587);
      const secureEnv = process.env.CONTACT_SMTP_SECURE;
      const secure = typeof secureEnv === 'string'
        ? secureEnv.toLowerCase() === 'true'
        : port === 465;

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.disabledReason = null;
      console.log('[ContactService] Email transport configured');
    } catch (error) {
      this.transporter = null;
      this.disabledReason = error.message;
      console.error('[ContactService] Failed to initialize transporter:', error);
    }
  }

  ensureTransport() {
    if (!this.transporter) {
      throw new ContactEmailDisabledError(this.disabledReason);
    }
  }

  formatPlainText({ name, email, phone, eventDate, message }) {
    const lines = [
      'New contact request from TimeliteClothing.com',
      `Name      : ${name}`,
      `Email     : ${email}`,
      `Phone     : ${phone || 'N/A'}`,
      `Event Date: ${eventDate || 'Not provided'}`,
      '',
      'Message:',
      message,
    ];
    return lines.join('\n');
  }

  formatHtml({ name, email, phone, eventDate, message }) {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || 'N/A');
    const safeEventDate = escapeHtml(eventDate || 'Not provided');
    const safeMessage = escapeHtml(message);

    return `
      <h2>New contact request from TimeliteClothing.com</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Phone:</strong> ${safePhone}</p>
      <p><strong>Event Date:</strong> ${safeEventDate}</p>
      <h3>Message</h3>
      <p style="white-space:pre-wrap;">${safeMessage}</p>
    `;
  }

  async sendContactRequest(payload) {
    const toEmail = process.env.CONTACT_TO_EMAIL || 'zeddatgaming1@gmail.com';
    const fromEmail = process.env.CONTACT_FROM_EMAIL || process.env.CONTACT_SMTP_USER || 'no-reply@timeliteclothing.com';

    const summarizedPayload = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      eventDate: payload.eventDate || null,
      messagePreview: (payload.message || '').slice(0, 120),
    };

    const logContext = {
      to: toEmail,
      from: fromEmail,
      payload: summarizedPayload,
    };

    try {
      this.ensureTransport();
    } catch (error) {
      console.warn('[ContactService] SMTP not configured, logging request only', {
        ...logContext,
        reason: error.message,
      });

      return {
        success: true,
        deliveredTo: toEmail,
        simulated: true,
        reason: error.message,
      };
    }

    console.log('[ContactService] Preparing contact email', logContext);

    const mailOptions = {
      to: toEmail,
      from: fromEmail,
      replyTo: payload.email,
      subject: `New styling request from ${payload.name}`,
      text: this.formatPlainText(payload),
      html: this.formatHtml(payload),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('[ContactService] Contact request forwarded to concierge inbox', {
        to: toEmail,
        replyTo: payload.email,
        name: payload.name,
        messageId: info?.messageId,
        envelope: info?.envelope,
      });

      return {
        success: true,
        deliveredTo: toEmail,
        messageId: info?.messageId,
      };
    } catch (error) {
      console.error('[ContactService] Failed to send contact email', {
        ...logContext,
        error: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  }
}

module.exports = new ContactService();

