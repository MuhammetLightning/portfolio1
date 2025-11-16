import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import cloudinary, { uploadBuffer } from "@/lib/cloudinary";

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

	const folder = "portfolio/profile";

	const upload = await uploadBuffer(buffer, {
		folder,
		resource_type: "image",
		overwrite: true,
		public_id: "profile_picture",
	});

	const url = upload.secure_url;

	const existing = await db.select().from(profiles).limit(1);
	if (existing.length === 0) {
		const [created] = await db
			.insert(profiles)
			.values({
				profileImageUrl: url,
				description: null,
				cvUrl: null,
				contactInfo: null,
			})
			.returning();
		return NextResponse.json({ url, profile: created }, { status: 201 });
	}

	const current = existing[0];
	const [updated] = await db
		.update(profiles)
		.set({ profileImageUrl: url })
		.where(eq(profiles.id, current.id))
		.returning();
	return NextResponse.json({ url, profile: updated });
}


