import { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PostGrid } from "@/components/posts/post-grid";
import { FadeUp } from "@/components/animations/motion-wrapper";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
	title: "همه اخبار و مقالات",
	description: "مرور همه اخبار و مقالات، اخبار و مطالب وب‌لاگ فودکی.",
};

interface PostsPageProps {
	searchParams: Promise<{
		page?: string;
		category?: string;
		tag?: string;
	}>;
}

async function getPosts(
	page: number = 1,
	categorySlug?: string,
	tagSlug?: string,
) {
	const limit = 12;

	const where: Record<string, unknown> = {
		status: "PUBLISHED",
		publishedAt: { not: null },
	};

	if (categorySlug) {
		where.category = { slug: categorySlug };
	}

	if (tagSlug) {
		where.tags = { some: { tag: { slug: tagSlug } } };
	}

	const total = await prisma.post.count({ where });
	const totalPages = Math.ceil(total / limit);
	const safePage =
		totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1;
	const skip = (safePage - 1) * limit;

	const posts = await prisma.post.findMany({
		where,
		skip,
		take: limit,
		orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
		include: {
			category: true,
			tags: { include: { tag: true } },
		},
	});

	return {
		posts,
		pagination: {
			page: safePage,
			limit,
			total,
			totalPages,
		},
	};
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
	const params = await searchParams;
	const rawPage = parseInt(params.page || "1", 10);
	const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
	const { posts, pagination } = await getPosts(
		page,
		params.category,
		params.tag,
	);
	const baseQuery = new URLSearchParams();

	if (params.category) {
		baseQuery.set("category", params.category);
	}

	if (params.tag) {
		baseQuery.set("tag", params.tag);
	}

	// If requested page is out of range, redirect to the last valid page
	if (pagination.totalPages > 0 && page !== pagination.page) {
		const fixedQuery = new URLSearchParams(baseQuery);
		fixedQuery.set("page", String(pagination.page));
		return redirect(`/posts?${fixedQuery.toString()}`);
	}

	const getPageHref = (targetPage: number) => {
		const query = new URLSearchParams(baseQuery);
		query.set("page", String(targetPage));
		return `/posts?${query.toString()}`;
	};

	return (
		<div className="container-wrapper py-12">
			<FadeUp>
				<div className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold mb-4">
						همه اخبار و مقالات
					</h1>
					<p className="text-muted-foreground">
						{pagination.total} نوشته در مجموعه
					</p>
				</div>
			</FadeUp>

			{posts.length > 0 ? (
				<>
					<PostGrid posts={posts} columns={3} />

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<Pagination
							currentPage={pagination.page}
							totalPages={pagination.totalPages}
							getPageHref={getPageHref}
						/>
					)}
				</>
			) : (
				<div className="text-center py-20">
					<p className="text-muted-foreground">نوشته‌ای یافت نشد.</p>
				</div>
			)}
		</div>
	);
}
