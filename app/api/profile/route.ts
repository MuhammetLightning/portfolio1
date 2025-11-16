import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";

type UpdateProfileRequest = {
	description?: string | null;
	contactInfo?: Record<string, unknown> | null;
	profileImageUrl?: string | null;
	cvUrl?: string | null;
};

export async function GET() {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const rows = await db.select().from(profiles).limit(1);
	const profile = rows[0] ?? null;
	return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session) {
	 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let payload: UpdateProfileRequest;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const updateData: UpdateProfileRequest = {};
	if ("description" in payload) updateData.description = payload.description ?? null;
	if ("contactInfo" in payload) updateData.contactInfo = payload.contactInfo ?? null;
	if ("profileImageUrl" in payload) updateData.profileImageUrl = payload.profileImageUrl ?? null;
	if ("cvUrl" in payload) updateData.cvUrl = payload.cvUrl ?? null;

	const existing = await db.select().from(profiles).limit(1);
	if (existing.length === 0) {
		const [created] = await db
			.insert(profiles)
			.values({
				description: updateData.description ?? null,
				contactInfo: updateData.contactInfo ?? null,
				profileImageUrl: updateData.profileImageUrl ?? null,
				cvUrl: updateData.cvUrl ?? null,
			})
			.returning();
		return NextResponse.json({ profile: created }, { status: 201 });
	}

	const current = existing[0];
	const [updated] = await db
		.update(profiles)
		.set({
			description: updateData.description ?? current.description ?? null,
			contactInfo: updateData.contactInfo ?? current.contactInfo ?? null,
			profileImageUrl: updateData.profileImageUrl ?? current.profileImageUrl ?? null,
			cvUrl: updateData.cvUrl ?? current.cvUrl ?? null,
		})
		.where(eq(profiles.id, current.id))
		.returning();

	return NextResponse.json({ profile: updated });
}


