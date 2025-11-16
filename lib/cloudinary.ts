import { v2 as cloudinary } from "cloudinary";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
	// Intentionally do not throw during import to avoid build-time failures.
	// Runtime calls will fail with clear errors if envs are missing.
}

cloudinary.config({
	cloud_name: CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
	secure: true,
});

export function uploadBuffer(buffer: Buffer, options: UploadApiOptions = {}) {
	return new Promise<UploadApiResponse>((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(options as UploadApiOptions, (error, result) => {
			if (error) return reject(error);
			if (!result) return reject(new Error("Cloudinary upload failed"));
			resolve(result);
		});
		uploadStream.end(buffer);
	});
}

export default cloudinary;


