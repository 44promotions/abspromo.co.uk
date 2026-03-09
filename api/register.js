const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { company, email, phone, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.qiye.aliyun.com';
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL || smtpUser;
    const toEmail = process.env.TO_EMAIL || 'info@abspromo.co.uk';

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ error: 'SMTP not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === '465',
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    });

    const htmlContent = `
      <h2>New Customer Registration</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Company</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${company || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Email</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Phone</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${phone || 'N/A'}</td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"abspromo" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: 'New Customer Registration',
      html: htmlContent
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
