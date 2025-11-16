import { NextResponse } from "next/server";
import { Resend } from "resend";

type ContactPayload = {
	name?: string;
	email?: string;
	message?: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const toEmail = process.env.CONTACT_TO_EMAIL;

export async function POST(request: Request) {
	let payload: ContactPayload;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
	}

	const name = typeof payload.name === "string" ? payload.name.trim() : "";
	const email = typeof payload.email === "string" ? payload.email.trim() : "";
	const message = typeof payload.message === "string" ? payload.message.trim() : "";

	if (!name || !email || !message) {
		return NextResponse.json({ error: "İsim, email ve mesaj zorunludur" }, { status: 400 });
	}

	if (!resendApiKey || !toEmail) {
		return NextResponse.json(
			{ error: "E-posta servisi yapılandırılmamış (ENV eksik)" },
			{ status: 500 },
		);
	}

	try {
		const resend = new Resend(resendApiKey);
		await resend.emails.send({
			from: "Portfolio Contact <onboarding@resend.dev>",
			to: [toEmail],
			reply_to: email,
			subject: "Sitenizden Yeni Mesaj",
			text: `Gönderen: ${name}\nEmail: ${email}\n\nMesaj:\n${message}`,
		});
		return NextResponse.json({ ok: true });
	} catch (error) {
		return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 500 });
	}
}


