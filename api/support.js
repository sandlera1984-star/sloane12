import nodemailer from "nodemailer";

const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

function missingEnv() {
  return required.filter((name) => !process.env[name]);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const missing = missingEnv();
  if (missing.length) {
    response.status(500).json({ error: "Email service not configured." });
    return;
  }

  const { name, email, description } = request.body || {};
  if (!name || !email || !description) {
    response.status(400).json({ error: "Missing fields." });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    to: process.env.SUPPORT_TO || "insanitybjones@gmail.com",
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    subject: "Customer Support Request",
    text: `Name: ${name}\nEmail: ${email}\n\nDescription:\n${description}`
  });

  response.status(200).json({ ok: true });
}
