import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { name, email, phone, country, brief } = req.body || {};
    if (!name || !email || !brief) return res.status(400).json({ error: "Missing fields" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

    const html = `
      <h2>New Trident Trust Lead</h2>
      <p><b>Name/Company:</b> ${esc(name)}</p>
      <p><b>Email:</b> ${esc(email)}</p>
      <p><b>Phone:</b> ${esc(phone || "")}</p>
      <p><b>Country:</b> ${esc(country || "")}</p>
      <p><b>Brief:</b><br/>${esc(brief).replace(/\n/g,"<br/>")}</p>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      replyTo: email,
      subject: `Free Sourcing Audit – ${name}`,
      text: `Lead Trident Trust
Name: ${name}
Email: ${email}
Phone: ${phone || ""}
Country: ${country || ""}
Brief:
${brief}`,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Lead service error" });
  }
}
