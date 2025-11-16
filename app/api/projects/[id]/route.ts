import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";

type UpdateProjectRequest = {
	title?: string;
	description?: string | null;
};

export const runtime = "nodejs";

async function parseIdFromRequest(_request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<number | null> {
	const { id } = await context.params;
	const n = Number(id);
	if (Number.isInteger(n) && n > 0) return n;
	return null;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const idNum = await parseIdFromRequest(request, context);
	if (!idNum) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	let payload: UpdateProjectRequest;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const toUpdate: UpdateProjectRequest = {};
	if ("title" in payload) {
		if (payload.title !== undefined && typeof payload.title !== "string") {
			return NextResponse.json({ error: "title must be a string" }, { status: 400 });
		}
		toUpdate.title = payload.title;
	}
	if ("description" in payload) {
		if (payload.description !== undefined && payload.description !== null && typeof payload.description !== "string") {
			return NextResponse.json({ error: "description must be string or null" }, { status: 400 });
		}
		toUpdate.description = payload.description ?? null;
	}

	const [updated] = await db
		.update(projects)
		.set(toUpdate)
		.where(eq(projects.id, idNum))
		.returning();

	if (!updated) {
	return NextResponse.json({ error: "Project not found" }, { status: 404 });
	}

	return NextResponse.json({ project: updated });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const idNum = await parseIdFromRequest(request, context);
	if (!idNum) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	const result = await db.delete(projects).where(eq(projects.id, idNum)).returning();
	if (result.length === 0) {
		return NextResponse.json({ error: "Project not found" }, { status: 404 });
	}
	return new NextResponse(null, { status: 204 });
}


