/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

type ProjectSliderProps = {
	images: string[];
	className?: string;
};

export default function ProjectSlider({ images, className }: ProjectSliderProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });

	const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

	if (!images || images.length === 0) {
		return null;
	}

	// Optimize Cloudinary images
	const optimizeImage = (url: string) => {
		if (url.includes('cloudinary.com')) {
			// Add quality and size optimization
			return url.replace('/upload/', '/upload/q_auto,f_auto,w_1200,c_limit/');
		}
		return url;
	};

	return (
		<div className={className}>
			<div className="relative">
				<div className="overflow-hidden rounded-lg" ref={emblaRef}>
					<div className="flex touch-pan-y">
						{images.map((src, idx) => (
							<div key={src + idx} className="min-w-0 flex-[0_0_100%]">
								<div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
									<img
										src={optimizeImage(src)}
										alt={`Project image ${idx + 1}`}
										className="h-full w-full object-contain"
										loading="lazy"
									/>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
					<button
						type="button"
						onClick={scrollPrev}
						className="pointer-events-auto rounded-full bg-white/80 px-3 py-2 text-sm text-black shadow ring-1 ring-black/10 hover:bg-white dark:bg-white/20 dark:text-white"
						aria-label="Önceki"
					>
						‹
					</button>
					<button
						type="button"
						onClick={scrollNext}
						className="pointer-events-auto rounded-full bg-white/80 px-3 py-2 text-sm text-black shadow ring-1 ring-black/10 hover:bg-white dark:bg-white/20 dark:text-white"
						aria-label="Sonraki"
					>
						›
					</button>
				</div>
			</div>
		</div>
	);
}


