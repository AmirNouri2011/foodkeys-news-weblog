"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, getReadingTime, truncate } from "@/lib/utils";

interface PostTag {
	tag: {
		id: number;
		name: string;
		slug: string;
	};
}

interface Category {
	id: number;
	name: string;
	slug: string;
}

interface Post {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	featuredImage: string | null;
	viewCount: number;
	publishedAt: Date | string | null;
	category: Category | null;
	tags: PostTag[];
}

interface PostCardProps {
	post: Post;
	variant?: "default" | "featured" | "compact" | "horizontal";
	className?: string;
}

export function PostCard({
	post,
	variant = "default",
	className,
}: PostCardProps) {
	const readingTime = getReadingTime(post.content);
	const excerpt =
		post.excerpt || truncate(post.content.replace(/<[^>]*>/g, ""), 120);

	if (variant === "featured") {
		return (
			<Link href={`/view/news/details?id=${post.id}`}>
				<motion.div
					whileHover={{ y: -5 }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
				>
					<Card
						className={cn(
							"overflow-hidden group cursor-pointer h-full",
							className,
						)}
					>
						<div className="relative aspect-[16/9] overflow-hidden">
							{post.featuredImage ? (
								<Image
									src={`https://foodkeys.com/img/${post.featuredImage}`}
									alt={post.title}
									fill
									className="object-cover transition-transform duration-500 group-hover:scale-110"
								/>
							) : (
								<div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
									<span className="text-4xl font-bold text-primary/30">
										{post.title.charAt(0)}
									</span>
								</div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

							{/* Category Badge */}
							{post.category && (
								<Badge className="absolute top-4 left-4 bg-primary/90 hover:bg-primary">
									{post.category.name}
								</Badge>
							)}

							{/* Content Overlay */}
							<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
								<h2 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2 group-hover:text-primary-foreground transition-colors">
									{post.title}
								</h2>
								<p className="text-white/80 line-clamp-2 mb-4">{excerpt}</p>
								<div className="flex items-center gap-4 text-sm text-white/70">
									{post.publishedAt && (
										<span className="flex items-center gap-1">
											<Calendar className="h-4 w-4" />
											{formatDate(post.publishedAt)}
										</span>
									)}
									<span className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										{readingTime} دقیقه مطالعه
									</span>
									<span className="flex items-center gap-1">
										<Eye className="h-4 w-4" />
										{post.viewCount} بازدید
									</span>
								</div>
							</div>
						</div>
					</Card>
				</motion.div>
			</Link>
		);
	}

	if (variant === "horizontal") {
		return (
			<Link href={`/view/news/details?id=${post.id}`}>
				<motion.div
					whileHover={{ x: 5 }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
				>
					<Card
						className={cn("overflow-hidden group cursor-pointer", className)}
					>
						<div className="flex flex-col sm:flex-row">
							<div className="relative w-full sm:w-48 md:w-64 aspect-video sm:aspect-square flex-shrink-0 overflow-hidden">
								{post.featuredImage ? (
									<Image
										src={`https://foodkeys.com/img/${post.featuredImage}`}
										alt={post.title}
										fill
										className="object-cover transition-transform duration-500 group-hover:scale-110"
									/>
								) : (
									<div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
										<span className="text-3xl font-bold text-primary/30">
											{post.title.charAt(0)}
										</span>
									</div>
								)}
							</div>
							<CardContent className="flex-1 p-4 sm:p-6">
								<div className="flex items-center gap-2 mb-2">
									{post.category && (
										<Badge variant="secondary" className="text-xs">
											{post.category.name}
										</Badge>
									)}
									{post.publishedAt && (
										<span className="text-xs text-muted-foreground">
											{formatDate(post.publishedAt)}
										</span>
									)}
								</div>
								<h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
									{post.title}
								</h3>
								<p className="text-sm text-muted-foreground line-clamp-2">
									{excerpt}
								</p>
								<div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
									<span className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										{readingTime} دقیقه
									</span>
									<span className="flex items-center gap-1">
										<Eye className="h-3 w-3" />
										{post.viewCount}
									</span>
								</div>
							</CardContent>
						</div>
					</Card>
				</motion.div>
			</Link>
		);
	}

	if (variant === "compact") {
		return (
			<Link href={`/view/news/details?id=${post.id}`}>
				<motion.div
					whileHover={{ x: 3 }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
					className={cn(
						"group cursor-pointer py-4 border-b last:border-0",
						className,
					)}
				>
					<div className="flex items-start gap-4">
						<div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
							{post.featuredImage ? (
								<Image
									src={`https://foodkeys.com/img/${post.featuredImage}`}
									alt={post.title}
									fill
									className="object-cover transition-transform duration-300 group-hover:scale-110"
								/>
							) : (
								<div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
									<span className="text-xl font-bold text-primary/30">
										{post.title.charAt(0)}
									</span>
								</div>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
								{post.title}
							</h4>
							<div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
								{post.publishedAt && (
									<span>{formatDate(post.publishedAt)}</span>
								)}
								<span>{readingTime} دقیقه مطالعه</span>
							</div>
						</div>
					</div>
				</motion.div>
			</Link>
		);
	}

	// Default variant
	return (
		<Link href={`/view/news/details?id=${post.id}`}>
			<motion.div
				whileHover={{ y: -5 }}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			>
				<Card
					className={cn(
						"overflow-hidden group cursor-pointer h-full flex flex-col",
						className,
					)}
				>
					<div className="relative aspect-[16/10] overflow-hidden">
						{post.featuredImage ? (
							<Image
								src={`https://foodkeys.com/img/${post.featuredImage}`}
								alt={post.title}
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-110"
							/>
						) : (
							<div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
								<span className="text-4xl font-bold text-primary/30">
									{post.title.charAt(0)}
								</span>
							</div>
						)}
						{post.category && (
							<Badge className="absolute top-3 left-3 bg-background/90 text-foreground hover:bg-background">
								{post.category.name}
							</Badge>
						)}
					</div>

					<CardContent className="flex-1 p-5">
						<h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
							{post.title}
						</h3>
						<p className="text-sm text-muted-foreground line-clamp-3">
							{excerpt}
						</p>
					</CardContent>

					<CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
						<div className="flex items-center gap-3 text-xs text-muted-foreground">
							{post.publishedAt && (
								<span className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{formatDate(post.publishedAt)}
								</span>
							)}
							<span className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								{readingTime} دقیقه
							</span>
						</div>
						<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
					</CardFooter>
				</Card>
			</motion.div>
		</Link>
	);
}

// Skeleton for loading state
export function PostCardSkeleton({
	variant = "default",
}: {
	variant?: "default" | "featured" | "compact" | "horizontal";
}) {
	if (variant === "compact") {
		return (
			<div className="flex items-start gap-4 py-4 border-b last:border-0">
				<div className="w-20 h-20 rounded-lg bg-muted animate-pulse" />
				<div className="flex-1 space-y-2">
					<div className="h-4 bg-muted rounded animate-pulse w-3/4" />
					<div className="h-4 bg-muted rounded animate-pulse w-1/2" />
					<div className="h-3 bg-muted rounded animate-pulse w-1/4" />
				</div>
			</div>
		);
	}

	return (
		<Card className="overflow-hidden">
			<div className="aspect-[16/10] bg-muted animate-pulse" />
			<CardContent className="p-5 space-y-3">
				<div className="h-5 bg-muted rounded animate-pulse w-3/4" />
				<div className="h-4 bg-muted rounded animate-pulse" />
				<div className="h-4 bg-muted rounded animate-pulse w-5/6" />
			</CardContent>
			<CardFooter className="px-5 pb-5 pt-0">
				<div className="h-3 bg-muted rounded animate-pulse w-1/3" />
			</CardFooter>
		</Card>
	);
}
