import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const { name, result } = await request.json();
  if (typeof name !== "string" || typeof result !== "string" || !name.trim() || !result.trim()) {
    return NextResponse.json({ error: "Name and result are required." }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESULT_RECIPIENT_EMAIL || !process.env.RESULT_SENDER_EMAIL) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 500 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESULT_SENDER_EMAIL,
    to: process.env.RESULT_RECIPIENT_EMAIL,
    subject: `New D&D class quiz result: ${name.trim()}`,
    text: `${name.trim()} received the result: ${result.trim()}.`,
  });
  if (error) return NextResponse.json({ error: "Email could not be sent." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
