import { Metadata } from "next";
import { Suspense } from "react";
import { Search } from "lucide-react";
import prisma from "@/lib/prisma";
import { PostGrid, PostGridSkeleton } from "@/components/posts/post-grid";
import { SearchForm } from "@/components/search/search-form";
import { FadeUp } from "@/components/animations/motion-wrapper";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
	title: "جستجو",
	description: "جستجو در اخبار و مقالاتی نشریه فودکیز.",
};

interface SearchPageProps {
	searchParams: Promise<{ q?: string; page?: string }>;
}

async function searchPosts(query: string, page: number = 1) {
	if (!query.trim()) {
		return {
			posts: [],
			pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
		};
	}

	const limit = 12;

	const where = {
		status: "PUBLISHED" as const,
		publishedAt: { not: null },
		OR: [
			{ title: { contains: query } },
			{ content: { contains: query } },
			{ excerpt: { contains: query } },
			{ category: { name: { contains: query } } },
			{ tags: { some: { tag: { name: { contains: query } } } } },
		],
	};

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

async function SearchResults({ query, page }: { query: string; page: number }) {
	const { posts, pagination } = await searchPosts(query, page);
	const getPageHref = (targetPage: number) =>
		`/search?q=${encodeURIComponent(query)}&page=${targetPage}`;

	if (!query.trim()) {
		return (
			<div className="text-center py-20">
				<Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground">عبارت جستجو را وارد کنید</p>
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className="text-center py-20">
				<Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-lg font-medium mb-2">نتیجه‌ای یافت نشد</p>
				<p className="text-muted-foreground">
					هیچ نوشته‌ای با «{query}» یافت نشد. عبارت دیگری امتحان کنید.
				</p>
			</div>
		);
	}

	return (
		<>
			<p className="text-muted-foreground mb-8">
				{pagination.total} نتیجه برای «{query}»
			</p>

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
	);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const params = await searchParams;
	const query = params.q || "";
	const rawPage = parseInt(params.page || "1", 10);
	const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

	return (
		<div className="container-wrapper py-12">
			<FadeUp>
				<div className="max-w-2xl mx-auto mb-12 text-center">
					<h1 className="text-3xl md:text-4xl font-bold mb-4">
						جستجو در اخبار و مقالات
					</h1>
					<p className="text-muted-foreground mb-8">
						جستجو در همه اخبار و مقالات، دسته‌ها و برچسب‌ها
					</p>
					<SearchForm initialQuery={query} />
				</div>
			</FadeUp>

			<Suspense fallback={<PostGridSkeleton count={6} columns={3} />}>
				<SearchResults query={query} page={page} />
			</Suspense>
		</div>
	);
}
