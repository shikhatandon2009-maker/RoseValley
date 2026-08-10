export function getWelcomeEmailTemplate(name: string, generatedPassword?: string) {
  return {
    subject: "Welcome to Maison De L'Essence - Luxury Artisanal Fragrances",
    html: `
      <div style="font-family: 'Georgia', serif; color: #5A1030; background-color: #F8E8E8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #E8B8B8;">
          <h1 style="color: #7A1840; text-align: center; margin-bottom: 20px; font-size: 28px;">Welcome to Maison De L'Essence</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #5A1030;">Dear ${name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #5A1030;">Thank you for joining Maison De L'Essence. We are delighted to welcome you to our world of rare essential oils, pure botanicals, and bespoke fragrances.</p>
          
          ${generatedPassword ? `
          <div style="background-color: #F8E8E8; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #E08A9A;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #9A2048;">Your Account Credentials:</p>
            <p style="margin: 0; font-family: monospace; font-size: 18px; color: #5A1030;">Generated Password: <strong>${generatedPassword}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #C94A6A;">(Please log in and update your password under Account Settings.)</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" style="background-color: #D45A7A; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore Collection</a>
          </div>
          <hr style="border: none; border-top: 1px solid #F2D4D4; margin: 30px 0;" />
          <p style="font-size: 12px; text-align: center; color: #9A2048;">Maison De L'Essence • Pure Essential Oils & Artisanal Perfumes</p>
        </div>
      </div>
    `
  };
}

export function getOrderConfirmationEmailTemplate(orderNumber: string, total: string, items: any[], recipientName: string) {
  const itemsList = items.map(item => `
    <li style="margin-bottom: 8px; color: #5A1030;">
      <strong>${item.product_name}</strong> (x${item.quantity}) - ₹${item.price}
    </li>
  `).join('');

  return {
    subject: `Order Confirmed: ${orderNumber} - Maison De L'Essence`,
    html: `
      <div style="font-family: 'Georgia', serif; color: #5A1030; background-color: #F8E8E8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #E8B8B8;">
          <h2 style="color: #7A1840; margin-bottom: 20px;">Order Confirmation</h2>
          <p>Dear ${recipientName},</p>
          <p>Thank you for your order <strong>${orderNumber}</strong>. We are hand-crafting and preparing your items with meticulous care.</p>
          
          <div style="background: #F8E8E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #7A1840;">Order Summary</h3>
            <ul style="padding-left: 20px; margin: 0;">
              ${itemsList}
            </ul>
            <p style="margin-top: 15px; font-weight: bold; font-size: 18px; color: #9A2048;">Total Paid: ${total}</p>
          </div>
          
          <p>We will notify you with tracking information as soon as your parcel is dispatched.</p>
        </div>
      </div>
    `
  };
}

export function getDispatchEmailTemplate(orderNumber: string, courierName: string, trackingNumber: string, recipientName: string) {
  return {
    subject: `Your Order ${orderNumber} Has Been Dispatched!`,
    html: `
      <div style="font-family: 'Georgia', serif; color: #5A1030; background-color: #F8E8E8; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #E8B8B8;">
          <h2 style="color: #7A1840; margin-bottom: 20px;">Your Fragrance Is On Its Way</h2>
          <p>Dear ${recipientName},</p>
          <p>Great news! Your order <strong>${orderNumber}</strong> has been handed over to our courier partner.</p>
          
          <div style="background-color: #F8E8E8; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E08A9A;">
            <p style="margin: 0 0 8px 0;"><strong>Courier Partner:</strong> ${courierName}</p>
            <p style="margin: 0;"><strong>Tracking Number:</strong> <span style="font-family: monospace; font-size: 18px; color: #9A2048;">${trackingNumber}</span></p>
          </div>
          
          <p>You can track your package status directly in your Maison De L'Essence customer dashboard.</p>
        </div>
      </div>
    `
  };
}
