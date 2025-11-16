import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { uploadBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
		return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
	}

	const form = await request.formData();
	const file = form.get("file");
	if (!(file instanceof File)) {
		return NextResponse.json({ error: "file is required (multipart/form-data)" }, { status: 400 });
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const upload = await uploadBuffer(buffer, {
		folder: "portfolio/cv",
		resource_type: "raw",
		type: "upload",
		access_mode: "public",
		overwrite: true,
		public_id: "cv.pdf",
	});

	const url = upload.secure_url;

	const existing = await db.select().from(profiles).limit(1);
	if (existing.length === 0) {
		const [created] = await db
			.insert(profiles)
			.values({
				cvUrl: url,
				description: null,
				profileImageUrl: null,
				contactInfo: null,
			})
			.returning();
		return NextResponse.json({ url, profile: created }, { status: 201 });
	}

	const current = existing[0];
	const [updated] = await db
		.update(profiles)
		.set({ cvUrl: url })
		.where(eq(profiles.id, current.id))
		.returning();
	return NextResponse.json({ url, profile: updated });
}


