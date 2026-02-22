"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroStats {
	posts: number;
	categories: number;
	readers: number;
}

interface HeroSectionProps {
	stats: HeroStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
			{/* Background Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl"
				/>
			</div>

			<div className="container-wrapper relative">
				<div className="py-20 md:py-28 lg:py-36 max-w-4xl mx-auto text-center">
					{/* Badge */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
							<Sparkles className="h-4 w-4" />
							به نشریه فودکیز خوش آمدید
						</span>
					</motion.div>

					{/* Heading */}
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
					>
						داستان‌هایی که
						<span className="block mt-2">
							<span className="gradient-text">الهام‌بخش و آموزنده‌اند</span>
						</span>
					</motion.h1>

					{/* Description */}
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
					>
						منبع معتبر اخبار و مقالات صنعت غذا و کشاورزی. موضوعات مورد علاقه‌ی
						خود را کاوش کنید.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="flex flex-col sm:flex-row items-center justify-center gap-4"
					>
						<Link href="/posts">
							<Button size="xl" variant="gradient" className="group gap-2">
								مشاهده اخبار و مقالات
								<ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
							</Button>
						</Link>
						<Link href="/categories">
							<Button size="xl" variant="outline">
								دسته‌ها
							</Button>
						</Link>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t"
					>
						{[
							{ label: "نوشته", value: stats.posts },
							{ label: "دسته", value: stats.categories },
							{ label: "بازدید", value: stats.readers },
						].map((stat, index) => (
							<div key={stat.label} className="text-center">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{
										type: "spring",
										stiffness: 200,
										damping: 10,
										delay: 0.5 + index * 0.1,
									}}
									className="text-2xl md:text-3xl font-bold gradient-text"
								>
									{stat.value.toLocaleString("fa-IR") + " " + "+"}
								</motion.div>
								<div className="text-sm text-muted-foreground mt-1">
									{stat.label}
								</div>
							</div>
						))}
					</motion.div>
				</div>
			</div>

			{/* Bottom Wave */}
			<div className="absolute bottom-0 left-0 right-0">
				<svg
					viewBox="0 0 1440 120"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="w-full h-auto"
					preserveAspectRatio="none"
				>
					<path
						d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
						className="fill-background"
					/>
				</svg>
			</div>
		</section>
	);
}
