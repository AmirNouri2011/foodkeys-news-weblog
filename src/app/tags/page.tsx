import { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
	FadeUp,
	StaggerContainer,
	StaggerItem,
} from "@/components/animations/motion-wrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "برچسب‌ها",
	description: "مرور برچسب‌های اخبار و مقالاتی نشریه فودکیز.",
};

async function getTags() {
	return prisma.tag.findMany({
		include: {
			_count: { select: { posts: true } },
		},
		orderBy: { posts: { _count: "desc" } },
	});
}

export default async function TagsPage() {
	const tags = await getTags();

	// Calculate tag sizes for tag cloud effect
	const maxCount = Math.max(...tags.map((t) => t._count.posts), 1);
	const getTagSize = (count: number) => {
		const ratio = count / maxCount;
		if (ratio > 0.8) return "text-2xl";
		if (ratio > 0.6) return "text-xl";
		if (ratio > 0.4) return "text-lg";
		if (ratio > 0.2) return "text-base";
		return "text-sm";
	};

	return (
		<div className="container-wrapper py-12">
			<FadeUp>
				<div className="mb-8 text-center">
					<div className="inline-flex items-center gap-3 mb-4">
						<div className="p-3 rounded-xl bg-primary/10">
							<Tag className="h-8 w-8 text-primary" />
						</div>
					</div>
					<h1 className="text-3xl md:text-4xl font-bold mb-4">برچسب‌ها</h1>
					<p className="text-muted-foreground max-w-xl mx-auto">
						اخبار و مقالات را با برچسب موضوع پیدا کنید. برچسب‌های بزرگ‌تر اخبار
						و مقالاتی بیشتری دارند.
					</p>
				</div>
			</FadeUp>

			{tags.length > 0 ? (
				<StaggerContainer className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
					{tags.map((tag) => (
						<StaggerItem key={tag.id}>
							<Link href={`/tag/${tag.slug}`}>
								<Badge
									variant="outline"
									className={`${getTagSize(tag._count.posts)} px-4 py-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer`}
								>
									#{tag.name}
									<span className="mr-2 text-xs opacity-70">
										({tag._count.posts})
									</span>
								</Badge>
							</Link>
						</StaggerItem>
					))}
				</StaggerContainer>
			) : (
				<div className="text-center py-20">
					<p className="text-muted-foreground">برچسبی یافت نشد.</p>
				</div>
			)}
		</div>
	);
}
