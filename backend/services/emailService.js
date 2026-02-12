const RESEND_API_URL = "https://api.resend.com/emails";

const sendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { skipped: true, reason: "email_provider_not_configured" };
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email provider error: ${response.status} ${body}`);
  }

  return { sent: true };
};

const sendTaskNotificationEmail = async ({ userEmail, userName, title, message }) => {
  const safeName = userName || "there";
  const subject = `Task Tracker: ${title}`;
  const text = `Hi ${safeName},\n\n${message}\n\n- Task Tracker`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <p>Hi ${safeName},</p>
      <p>${message}</p>
      <p style="margin-top: 16px;">- Task Tracker</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
};

module.exports = { sendTaskNotificationEmail };
