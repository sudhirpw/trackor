import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS;
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Missing email or message" });
    }

    try {
      // Configure transport — fill in your SMTP details or use an external email API
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 25,
        auth: {
          user: SMTP_EMAIL,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"PW IT TEAM"`,
        to: "aman.kumar3@pw.live", // The recipient
        subject: `New Feedback from ${email}`,
        text: `Feedback message: \n\n${message}`,
      });

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error("Failed to send feedback email:", error);
      return res.status(500).json({ error: "Failed to send email." });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
