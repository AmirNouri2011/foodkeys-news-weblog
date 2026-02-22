import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationItem = number | "ellipsis";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	getPageHref: (page: number) => string;
	className?: string;
}

function buildPaginationItems(
	currentPage: number,
	totalPages: number,
): PaginationItem[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const pages = new Set<number>([
		1,
		totalPages,
		currentPage - 1,
		currentPage,
		currentPage + 1,
	]);

	if (currentPage <= 3) {
		pages.add(2);
		pages.add(3);
		pages.add(4);
	}

	if (currentPage >= totalPages - 2) {
		pages.add(totalPages - 1);
		pages.add(totalPages - 2);
		pages.add(totalPages - 3);
	}

	const sortedPages = Array.from(pages)
		.filter((page) => page >= 1 && page <= totalPages)
		.sort((a, b) => a - b);

	const items: PaginationItem[] = [];
	let previousPage = 0;

	for (const page of sortedPages) {
		if (previousPage !== 0 && page - previousPage > 1) {
			items.push("ellipsis");
		}

		items.push(page);
		previousPage = page;
	}

	return items;
}

export function Pagination({
	currentPage,
	totalPages,
	getPageHref,
	className,
}: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
	const items = buildPaginationItems(safeCurrentPage, totalPages);
	const isPreviousDisabled = safeCurrentPage === 1;
	const isNextDisabled = safeCurrentPage === totalPages;
	const previousPage = isPreviousDisabled ? 1 : safeCurrentPage - 1;
	const nextPage = isNextDisabled ? totalPages : safeCurrentPage + 1;

	return (
		<div className={cn("mt-12 flex justify-center", className)}>
			<nav
				dir="rtl"
				className={cn(
					"inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-sm",
					"overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				)}
				aria-label="صفحه‌بندی"
			>
				{/* Next (visually on the right in RTL) */}
				<Link
					href={getPageHref(nextPage)}
					aria-label="صفحه بعدی"
					aria-disabled={isNextDisabled}
					tabIndex={isNextDisabled ? -1 : undefined}
					className={cn(
						"inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-3 text-xs md:text-sm transition-colors hover:bg-accent",
						isNextDisabled && "pointer-events-none opacity-50",
					)}
				>
					<span>بعدی</span>
					<ChevronLeft className="h-4 w-4" />
				</Link>

				{/* Page numbers */}
				<div className="flex items-center gap-1">
					{items.map((item, index) => {
						if (item === "ellipsis") {
							return (
								<span
									key={`ellipsis-${index}`}
									className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center text-muted-foreground"
									aria-hidden="true"
								>
									<MoreHorizontal className="h-4 w-4" />
								</span>
							);
						}

						const isActive = item === safeCurrentPage;

						return (
							<Link
								key={item}
								href={getPageHref(item)}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full px-3 text-xs md:text-sm font-medium transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "bg-muted hover:bg-accent",
								)}
							>
								{item}
							</Link>
						);
					})}
				</div>

				{/* Prev (visually on the left in RTL) */}
				<Link
					href={getPageHref(previousPage)}
					aria-label="صفحه قبلی"
					aria-disabled={isPreviousDisabled}
					tabIndex={isPreviousDisabled ? -1 : undefined}
					className={cn(
						"inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-3 text-xs md:text-sm transition-colors hover:bg-accent",
						isPreviousDisabled && "pointer-events-none opacity-50",
					)}
				>
					<ChevronRight className="h-4 w-4" />
					<span>قبلی</span>
				</Link>
			</nav>
		</div>
	);
}
