const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, productName, name, company, email, message, requestType } = req.body;

    // Validate required fields
    if (!email || !name || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get SMTP config from environment variables
    const smtpHost = process.env.SMTP_HOST || 'smtp.qiye.aliyun.com';
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL || smtpUser;
    const toEmail = process.env.TO_EMAIL || 'info@abspromo.co.uk';

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ error: 'SMTP not configured. Please contact administrator.' });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Subject based on request type
    const subject = requestType === 'quote' 
      ? `Quote Request - ${productName} (${productId})`
      : `Product Inquiry - ${productName} (${productId})`;

    // Email content
    const htmlContent = `
      <h2>${requestType === 'quote' ? 'Quote Request' : 'Product Inquiry'}</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Product</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${productName} (${productId})</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Name</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Company</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${company || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Email</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Message</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${message.replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">This email was sent from abspromo.co.uk</p>
    `;

    // Send email
    await transporter.sendMail({
      from: `"abspromo" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: subject,
      html: htmlContent
    });

    return res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
};
