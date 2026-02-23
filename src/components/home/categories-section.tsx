"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Folder, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Category {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	_count?: {
		posts: number;
	};
}

interface CategoriesSectionProps {
	categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
	if (categories.length === 0) return null;

	return (
		<section>
			<div className="flex items-center gap-3 mb-6">
				<Folder className="h-5 w-5 text-primary" />
				<h3 className="text-xl font-bold">دسته‌ها</h3>
			</div>
			<div className="space-y-2">
				{categories.map((category, index) => (
					<motion.div
						key={category.id}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.05 }}
					>
						<Link href={`/category/${encodeURIComponent(category.slug)}`}>
							<div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group">
								<span className="font-medium group-hover:text-primary transition-colors">
									{category.name}
								</span>
								<div className="flex items-center gap-2">
									<Badge variant="ghost" className="text-xs">
										{category._count?.posts || 0}
									</Badge>
									<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 rtl:rotate-180 transition-all" />
								</div>
							</div>
						</Link>
					</motion.div>
				))}
			</div>
			<Link href="/categories" className="block mt-4">
				<motion.div
					whileHover={{ x: -5 }}
					className="flex items-center gap-2 text-sm text-primary font-medium"
				>
					همه دسته‌ها
					<ArrowRight className="h-4 w-4 rtl:rotate-180" />
				</motion.div>
			</Link>
		</section>
	);
}

// Full page categories grid
interface CategoriesGridProps {
	categories: Category[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
	const colors = [
		"from-primary/20 to-accent/20",
		"from-purple-500/20 to-pink-500/20",
		"from-orange-500/20 to-red-500/20",
		"from-green-500/20 to-emerald-500/20",
		"from-yellow-500/20 to-orange-500/20",
		"from-indigo-500/20 to-purple-500/20",
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{categories.map((category, index) => (
				<motion.div
					key={category.id}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					<Link href={`/category/${encodeURIComponent(category.slug)}`}>
						<motion.div
							whileHover={{ y: -5, scale: 1.02 }}
							transition={{ type: "spring", stiffness: 300, damping: 20 }}
							className={`relative p-6 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} border group cursor-pointer overflow-hidden`}
						>
							{/* Background decoration */}
							<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

							<div className="relative">
								<div className="flex items-center justify-between mb-4">
									<div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm">
										<Folder className="h-6 w-6 text-primary" />
									</div>
									<Badge
										variant="secondary"
										className="bg-background/50 backdrop-blur-sm"
									>
										{category._count?.posts || 0} نوشته
									</Badge>
								</div>

								<h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
									{category.name}
								</h3>

								{category.description && (
									<p className="text-sm text-muted-foreground line-clamp-2">
										{category.description}
									</p>
								)}

								<div className="flex items-center gap-2 mt-4 text-sm font-medium text-primary">
									مشاهده اخبار و مقالات
									<ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
								</div>
							</div>
						</motion.div>
					</Link>
				</motion.div>
			))}
		</div>
	);
}
