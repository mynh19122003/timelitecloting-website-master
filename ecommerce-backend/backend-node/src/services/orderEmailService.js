const nodemailer = require('nodemailer');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};

class OrderEmailService {
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
      console.warn('[OrderEmailService] Email sending disabled:', this.disabledReason);
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
      console.log('[OrderEmailService] Email transport configured');
    } catch (error) {
      this.transporter = null;
      this.disabledReason = error.message;
      console.error('[OrderEmailService] Failed to initialize transporter:', error);
    }
  }

  formatOrderItemsHtml(items) {
    if (!items || items.length === 0) return '<p>No items</p>';

    const rows = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(item.name || 'Product')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${escapeHtml(item.color || '-')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${escapeHtml(item.size || '-')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
      </tr>
    `).join('');

    return `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Color</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Size</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  formatPlainText(orderData) {
    const items = this.parseItems(orderData.products_items);
    const itemsList = items.map(item => 
      `  - ${item.name} (${item.color || '-'}/${item.size || '-'}) x${item.quantity} - ${formatCurrency(item.price)}`
    ).join('\n');

    return `
Thank you for your order!

ORDER CONFIRMATION
==================
Order Number: ${orderData.order_id || 'N/A'}
Date: ${new Date().toLocaleDateString()}

SHIPPING INFORMATION
--------------------
Name: ${orderData.user_name || 'N/A'}
Address: ${orderData.user_address || 'N/A'}
Phone: ${orderData.user_phone || 'N/A'}
Email: ${orderData.email || 'N/A'}

ITEMS ORDERED
-------------
${itemsList}

TOTAL
-----
Subtotal: ${formatCurrency(orderData.products_price)}
Total: ${formatCurrency(orderData.total_price)}

Payment Method: ${orderData.payment_method || 'N/A'}
Status: ${orderData.status || 'Pending'}

Thank you for shopping with Timelite Clothing!
For any questions, please contact us at henry@timeliteclothing.com
    `.trim();
  }

  formatHtml(orderData) {
    const items = this.parseItems(orderData.products_items);
    const itemsHtml = this.formatOrderItemsHtml(items);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #c79b61 0%, #a67c52 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="https://timeliteclothing.com/images/logo_web.png" alt="Timelite Clothing" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
      <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Order!</h1>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      
      <!-- Order Info -->
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Order Details</h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px 0; color: #666;">Order Number:</td>
            <td style="padding: 5px 0; color: #c79b61; font-weight: bold;">${escapeHtml(orderData.order_id || 'N/A')}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">Date:</td>
            <td style="padding: 5px 0;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">Status:</td>
            <td style="padding: 5px 0; text-transform: capitalize;">${escapeHtml(orderData.status || 'Pending')}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">Payment:</td>
            <td style="padding: 5px 0; text-transform: capitalize;">${escapeHtml((orderData.payment_method || 'N/A').replace('_', ' '))}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Info -->
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Shipping Information</h2>
        <p style="margin: 5px 0; color: #333;"><strong>${escapeHtml(orderData.user_name || 'N/A')}</strong></p>
        <p style="margin: 5px 0; color: #666;">${escapeHtml(orderData.user_address || 'N/A')}</p>
        <p style="margin: 5px 0; color: #666;">Phone: ${escapeHtml(orderData.user_phone || 'N/A')}</p>
      </div>

      <!-- Items -->
      <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Items Ordered</h2>
      ${itemsHtml}

      <!-- Total -->
      <div style="background: #333; color: white; padding: 20px; border-radius: 8px; margin-top: 25px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px 0;">Subtotal:</td>
            <td style="padding: 5px 0; text-align: right;">${formatCurrency(orderData.products_price)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 18px; font-weight: bold;">Total:</td>
            <td style="padding: 10px 0; text-align: right; font-size: 18px; font-weight: bold; color: #c79b61;">${formatCurrency(orderData.total_price)}</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; margin: 0 0 10px 0;">Thank you for shopping with Timelite Clothing!</p>
        <p style="color: #999; margin: 0; font-size: 12px;">
          Questions? Contact us at <a href="mailto:henry@timeliteclothing.com" style="color: #c79b61;">henry@timeliteclothing.com</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  parseItems(productsItems) {
    if (!productsItems) return [];
    if (Array.isArray(productsItems)) return productsItems;
    try {
      return JSON.parse(productsItems);
    } catch {
      return [];
    }
  }

  async sendOrderConfirmation(orderData) {
    const customerEmail = orderData.email;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || process.env.CONTACT_SMTP_USER || 'no-reply@timeliteclothing.com';
    const shopEmail = process.env.CONTACT_TO_EMAIL || 'henry@timeliteclothing.com';

    const logContext = {
      orderId: orderData.order_id,
      customerEmail,
      fromEmail,
    };

    if (!customerEmail) {
      console.warn('[OrderEmailService] No customer email provided, skipping', logContext);
      return { success: false, reason: 'No customer email' };
    }

    if (!this.transporter) {
      console.warn('[OrderEmailService] SMTP not configured, logging only', {
        ...logContext,
        reason: this.disabledReason,
      });
      return {
        success: true,
        simulated: true,
        reason: this.disabledReason,
      };
    }

    console.log('[OrderEmailService] Sending order confirmation email', logContext);

    const mailOptions = {
      to: customerEmail,
      from: fromEmail,
      cc: shopEmail, // CC shop owner
      subject: `Order Confirmation - ${orderData.order_id || 'Your Order'} | Timelite Clothing`,
      text: this.formatPlainText(orderData),
      html: this.formatHtml(orderData),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('[OrderEmailService] Order confirmation email sent', {
        ...logContext,
        messageId: info?.messageId,
      });

      return {
        success: true,
        deliveredTo: customerEmail,
        messageId: info?.messageId,
      };
    } catch (error) {
      console.error('[OrderEmailService] Failed to send order confirmation email', {
        ...logContext,
        error: error?.message,
        stack: error?.stack,
      });
      // Don't throw - let order creation succeed even if email fails
      return {
        success: false,
        error: error?.message,
      };
    }
  }
}

module.exports = new OrderEmailService();
