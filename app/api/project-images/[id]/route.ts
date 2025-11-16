import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { projectImages } from "@/db/schema";

export const runtime = "nodejs";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await context.params;
	const idNum = Number(id);
	if (!Number.isInteger(idNum) || idNum <= 0) {
	return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	const result = await db.delete(projectImages).where(eq(projectImages.id, idNum)).returning();
	if (result.length === 0) {
		return NextResponse.json({ error: "Image not found" }, { status: 404 });
	}

	// Note: Cloudinary file is not deleted because public_id is not stored.
	return new NextResponse(null, { status: 204 });
}


