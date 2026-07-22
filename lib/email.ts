import sgMail from "@sendgrid/mail";
import { createHmac, randomInt } from "crypto";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is required");

sgMail.setApiKey(SENDGRID_API_KEY);

const FROM_EMAIL = "noreply@ortamnasil.com";
const FROM_NAME = "OrtamNasıl?";

export function generateCode(): string {
  return String(randomInt(100000, 999999));
}

export function hashCode(code: string): string {
  const secret = process.env.SESSION_SECRET!;
  return createHmac("sha256", secret).update(code).digest("hex");
}

export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars[randomInt(0, chars.length)];
  return pw;
}

export async function sendTempPasswordEmail(email: string, tempPassword: string): Promise<void> {
  await sgMail.send({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: "OrtamNasıl — Geçici şifren",
    text: `Geçici şifren: ${tempPassword}\n\nBu şifreyle giriş yaptıktan sonra yeni şifreni belirlemen istenecek.\n\nBu e-postayı sen istemediysen görmezden gelebilirsin.`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 440px; margin: 0 auto; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 22px; color: #1C1917; margin: 0 0 4px;">OrtamNasıl?</h1>
          <p style="color: #A8A29E; font-size: 14px; margin: 0;">Yurt nasıl, içerden öğren.</p>
        </div>
        <div style="background: #F5F5F4; border-radius: 16px; padding: 28px; text-align: center;">
          <p style="color: #57534E; font-size: 15px; margin: 0 0 16px;">Geçici şifren:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #F97316; font-family: monospace; margin: 0 0 16px;">
            ${tempPassword}
          </div>
          <p style="color: #A8A29E; font-size: 13px; margin: 0;">Giriş yaptıktan sonra yeni şifre belirlemen istenecek.</p>
        </div>
        <p style="color: #D6D3D1; font-size: 12px; text-align: center; margin-top: 24px;">
          Bu e-postayı sen istemediysen görmezden gelebilirsin.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  await sgMail.send({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `${code} — OrtamNasıl doğrulama kodun`,
    text: `OrtamNasıl doğrulama kodun: ${code}\n\nBu kod 15 dakika geçerlidir.\n\nBu e-postayı sen istemediysen görmezden gelebilirsin.`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 440px; margin: 0 auto; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 22px; color: #1C1917; margin: 0 0 4px;">OrtamNasıl?</h1>
          <p style="color: #A8A29E; font-size: 14px; margin: 0;">Yurt nasıl, içerden öğren.</p>
        </div>
        <div style="background: #F5F5F4; border-radius: 16px; padding: 28px; text-align: center;">
          <p style="color: #57534E; font-size: 15px; margin: 0 0 16px;">Doğrulama kodun:</p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #F97316; font-family: monospace; margin: 0 0 16px;">
            ${code}
          </div>
          <p style="color: #A8A29E; font-size: 13px; margin: 0;">Bu kod 15 dakika geçerlidir.</p>
        </div>
        <p style="color: #D6D3D1; font-size: 12px; text-align: center; margin-top: 24px;">
          Bu e-postayı sen istemediysen görmezden gelebilirsin.
        </p>
      </div>
    `,
  });
}
