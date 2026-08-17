export function getWelcomeEmailTemplate(name: string, generatedPassword?: string) {
  return {
    subject: "Welcome to Rose Valley Kannauj - Luxury Artisanal Fragrances",
    html: `
      <div style="font-family: 'Georgia', serif; color: #4A0D25; background-color: #F8E8E8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #F7D1D8; box-shadow: 0 4px 20px rgba(74, 13, 37, 0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4A0D25; font-size: 26px; margin: 0; font-family: 'Georgia', serif; letter-spacing: 1px;">ROSE VALLEY KANNAUJ</h1>
            <p style="color: #9A2048; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Artisanal Hydro-Distillates & Pure Attars</p>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #4A0D25;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #4A0D25;">We are delighted to welcome you to Rose Valley Kannauj. Discover centuries-old artisanal botanical distillations, authentic Deg-Bhapka attars, and rare essential oils crafted in the perfume capital of India.</p>
          
          ${generatedPassword ? `
          <div style="background-color: #FAE6E7; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #F6A6BB;">
            <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 13px; color: #4A0D25;">Your Client Account Credentials:</p>
            <p style="margin: 0; font-family: monospace; font-size: 18px; color: #9A2048; font-weight: bold;">Temporary Password: ${generatedPassword}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #7A1840;">(Please log in and update your password under Account Settings.)</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://roseoil.in'}/products" style="background-color: #4A0D25; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 13px; display: inline-block; letter-spacing: 1px;">Explore Collection</a>
          </div>
          <hr style="border: none; border-top: 1px solid #F7D1D8; margin: 30px 0;" />
          <p style="font-size: 11px; text-align: center; color: #9A2048; margin: 0;">Rose Valley Kannauj • Hydro-Distilled in Traditional Copper Degs • Kannauj, Uttar Pradesh</p>
        </div>
      </div>
    `
  };
}

export function getOrderConfirmationEmailTemplate(orderNumber: string, total: string, items: any[], recipientName: string) {
  const itemsList = items.map(item => `
    <tr style="border-bottom: 1px solid #F7D1D8;">
      <td style="padding: 12px 8px; font-size: 13px; color: #4A0D25; font-weight: bold;">
        ${item.product_name || item.name}
        <div style="font-size: 11px; color: #9A2048; font-weight: normal;">Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 8px; font-size: 13px; color: #4A0D25; text-align: right; font-weight: bold;">
        ₹${Number(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return {
    subject: `Order Confirmation #${orderNumber} - Rose Valley Kannauj`,
    html: `
      <div style="font-family: 'Georgia', serif; color: #4A0D25; background-color: #F8E8E8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #F7D1D8; box-shadow: 0 4px 20px rgba(74, 13, 37, 0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4A0D25; font-size: 26px; margin: 0; letter-spacing: 1px;">ROSE VALLEY KANNAUJ</h1>
            <p style="color: #9A2048; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Artisanal Hydro-Distillates & Pure Attars</p>
          </div>

          <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; padding: 14px 20px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
            <span style="color: #2e7d32; font-weight: bold; font-size: 14px;">✓ Payment Received & Order Confirmed</span>
          </div>

          <p style="font-size: 15px; color: #4A0D25;">Dear <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4A0D25;">Thank you for your valued order <strong>#${orderNumber}</strong>. Our master distillers are hand-packaging your pure artisanal extracts with utmost care.</p>
          
          <div style="background: #FAE6E7; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #F6A6BB;">
            <h3 style="margin-top: 0; color: #4A0D25; font-size: 16px; border-bottom: 1px solid #F7D1D8; padding-bottom: 8px;">Order Details (#${orderNumber})</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            <div style="margin-top: 15px; text-align: right; font-size: 16px; font-weight: bold; color: #4A0D25;">
              Grand Total Paid: <span style="color: #9A2048;">${total}</span>
            </div>
          </div>

          <p style="font-size: 13px; line-height: 1.6; color: #7A1840;">You will receive an additional email containing your courier tracking number as soon as your order is dispatched from Kannauj.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://roseoil.in'}/account" style="background-color: #4A0D25; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 12px; display: inline-block;">View Order in Dashboard</a>
          </div>

          <hr style="border: none; border-top: 1px solid #F7D1D8; margin: 30px 0;" />
          <p style="font-size: 11px; text-align: center; color: #9A2048; margin: 0;">Rose Valley Kannauj • Client Concierge: shikhatandon2009@gmail.com</p>
        </div>
      </div>
    `
  };
}

export function getDispatchEmailTemplate(orderNumber: string, courierName: string, trackingNumber: string, recipientName: string) {
  return {
    subject: `Order #${orderNumber} Dispatched - Tracking: ${trackingNumber}`,
    html: `
      <div style="font-family: 'Georgia', serif; color: #4A0D25; background-color: #F8E8E8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #F7D1D8; box-shadow: 0 4px 20px rgba(74, 13, 37, 0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4A0D25; font-size: 26px; margin: 0; letter-spacing: 1px;">ROSE VALLEY KANNAUJ</h1>
            <p style="color: #9A2048; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Artisanal Hydro-Distillates & Pure Attars</p>
          </div>

          <div style="background-color: #e3f2fd; border: 1px solid #90caf9; padding: 14px 20px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
            <span style="color: #1565c0; font-weight: bold; font-size: 14px;">📦 Your Parcel Has Been Dispatched!</span>
          </div>

          <p style="font-size: 15px; color: #4A0D25;">Dear <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4A0D25;">Great news! Your luxury fragrance order <strong>#${orderNumber}</strong> has been handed over to our expedited courier partner.</p>
          
          <div style="background-color: #FAE6E7; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #F6A6BB;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #4A0D25;"><strong>Courier Partner:</strong> ${courierName || 'Expedited Air Courier'}</p>
            <p style="margin: 0; font-size: 14px; color: #4A0D25;"><strong>Tracking Number (AWB):</strong> <span style="font-family: monospace; font-size: 18px; color: #9A2048; font-weight: bold; letter-spacing: 1px;">${trackingNumber}</span></p>
          </div>
          
          <p style="font-size: 13px; line-height: 1.6; color: #7A1840;">You can track real-time delivery status using the tracking code above or directly in your Rose Valley account portal.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://roseoil.in'}/account" style="background-color: #4A0D25; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 12px; display: inline-block;">Track Order in Dashboard</a>
          </div>

          <hr style="border: none; border-top: 1px solid #F7D1D8; margin: 30px 0;" />
          <p style="font-size: 11px; text-align: center; color: #9A2048; margin: 0;">Rose Valley Kannauj • Client Concierge: shikhatandon2009@gmail.com</p>
        </div>
      </div>
    `
  };
}

export function getInquiryAdminNotificationTemplate(name: string, email: string, phone: string, subject: string, message: string, inquiryRef: string) {
  return {
    subject: `[New Inquiry] ${subject || 'General Inquiry'} from ${name} (${inquiryRef})`,
    html: `
      <div style="font-family: sans-serif; color: #1a1a1a; background-color: #f4f4f5; padding: 30px 15px;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e4e4e7;">
          <h2 style="color: #4A0D25; margin-top: 0;">New Contact Form Submission</h2>
          <div style="background: #fdf2f4; padding: 16px; border-radius: 8px; border: 1px solid #fbcfe8; margin-bottom: 20px;">
            <p style="margin: 4px 0;"><strong>Inquiry Ref:</strong> ${inquiryRef}</p>
            <p style="margin: 4px 0;"><strong>Client Name:</strong> ${name}</p>
            <p style="margin: 4px 0;"><strong>Client Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          <p style="font-weight: bold; margin-bottom: 6px;">Message Content:</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          <div style="margin-top: 25px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://roseoil.in'}/admin/inquiries" style="background-color: #4A0D25; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">Reply via Admin Panel</a>
          </div>
        </div>
      </div>
    `
  };
}

export function getInquiryAcknowledgmentTemplate(name: string, subject: string, inquiryRef: string) {
  return {
    subject: `We have received your message [${inquiryRef}] - Rose Valley Kannauj`,
    html: `
      <div style="font-family: 'Georgia', serif; color: #4A0D25; background-color: #F8E8E8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #F7D1D8; box-shadow: 0 4px 20px rgba(74, 13, 37, 0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4A0D25; font-size: 26px; margin: 0; letter-spacing: 1px;">ROSE VALLEY KANNAUJ</h1>
            <p style="color: #9A2048; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Artisanal Hydro-Distillates & Pure Attars</p>
          </div>
          <p style="font-size: 15px; color: #4A0D25;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4A0D25;">Thank you for contacting Rose Valley Kannauj regarding <strong>"${subject || 'Your Inquiry'}"</strong>. Your request has been assigned reference <strong>${inquiryRef}</strong>.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4A0D25;">Our concierge desk is reviewing your message and will respond within 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #F7D1D8; margin: 30px 0;" />
          <p style="font-size: 11px; text-align: center; color: #9A2048; margin: 0;">Rose Valley Kannauj • Client Concierge: shikhatandon2009@gmail.com</p>
        </div>
      </div>
    `
  };
}

export function getInquiryReplyTemplate(name: string, subject: string, replyMessage: string, inquiryRef: string) {
  return {
    subject: `Response to your inquiry [${inquiryRef}] - Rose Valley Kannauj`,
    html: `
      <div style="font-family: 'Georgia', serif; color: #4A0D25; background-color: #F8E8E8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #F7D1D8; box-shadow: 0 4px 20px rgba(74, 13, 37, 0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4A0D25; font-size: 26px; margin: 0; letter-spacing: 1px;">ROSE VALLEY KANNAUJ</h1>
            <p style="color: #9A2048; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Artisanal Hydro-Distillates & Pure Attars</p>
          </div>
          <p style="font-size: 15px; color: #4A0D25;">Dear <strong>${name || 'Valued Client'}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4A0D25;">In response to your inquiry <strong>[${inquiryRef}] ${subject || ''}</strong>, our concierge desk has provided the following update:</p>
          
          <div style="background: #FAE6E7; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #F6A6BB; font-size: 14px; line-height: 1.7; color: #4A0D25; white-space: pre-wrap;">
${replyMessage}
          </div>

          <p style="font-size: 13px; line-height: 1.6; color: #7A1840;">If you have any further questions, simply reply directly to this email.</p>
          <hr style="border: none; border-top: 1px solid #F7D1D8; margin: 30px 0;" />
          <p style="font-size: 11px; text-align: center; color: #9A2048; margin: 0;">Rose Valley Kannauj • Client Concierge: shikhatandon2009@gmail.com</p>
        </div>
      </div>
    `
  };
}
