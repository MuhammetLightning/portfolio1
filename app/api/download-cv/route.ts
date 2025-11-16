import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const rows = await db.select().from(profiles).limit(1);
	const profile = rows[0];

	if (!profile?.cvUrl) {
		return NextResponse.json({ error: "CV not found" }, { status: 404 });
	}

	try {
		// Build authenticated Cloudinary URL with API key
		const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
		const apiKey = process.env.CLOUDINARY_API_KEY;
		const apiSecret = process.env.CLOUDINARY_API_SECRET;

		if (!cloudName || !apiKey || !apiSecret) {
			return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
		}

		// Use basic auth to fetch from Cloudinary
		const authString = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
		
		const response = await fetch(profile.cvUrl, {
			headers: {
				"Authorization": `Basic ${authString}`,
			},
		});

		if (!response.ok) {
			console.error("Cloudinary fetch failed:", response.status, await response.text());
			return NextResponse.json({ error: "Failed to fetch CV" }, { status: response.status });
		}

		const buffer = await response.arrayBuffer();

		// Return as downloadable PDF
		return new NextResponse(buffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": 'attachment; filename="Muhammet-CV.pdf"',
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		console.error("CV download error:", error);
		return NextResponse.json({ 
			error: "Download failed", 
			details: error instanceof Error ? error.message : String(error) 
		}, { status: 500 });
	}
}

