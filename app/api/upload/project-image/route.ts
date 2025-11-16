import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { projectImages, projects } from "@/db/schema";
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
	const projectIdValue = form.get("projectId") ?? new URL(request.url).searchParams.get("projectId");

	const projectId = typeof projectIdValue === "string" ? Number(projectIdValue) : Number(projectIdValue?.toString());
	if (!Number.isInteger(projectId) || projectId <= 0) {
		return NextResponse.json({ error: "Valid projectId is required" }, { status: 400 });
	}

	if (!(file instanceof File)) {
		return NextResponse.json({ error: "file is required (multipart/form-data)" }, { status: 400 });
	}

	const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
	if (project.length === 0) {
		return NextResponse.json({ error: "Project not found" }, { status: 404 });
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const upload = await uploadBuffer(buffer, {
		folder: `portfolio/projects/${projectId}`,
		resource_type: "image",
		overwrite: false,
	});

	const [createdImage] = await db
		.insert(projectImages)
		.values({
			imageUrl: upload.secure_url,
			projectId,
		})
		.returning();

	return NextResponse.json({ image: createdImage }, { status: 201 });
}


