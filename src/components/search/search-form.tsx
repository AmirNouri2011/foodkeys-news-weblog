"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFormProps {
	initialQuery?: string;
}

export function SearchForm({ initialQuery = "" }: SearchFormProps) {
	const [query, setQuery] = useState(initialQuery);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			startTransition(() => {
				router.push(`/search?q=${encodeURIComponent(query.trim())}`);
			});
		}
	};

	const clearSearch = () => {
		setQuery("");
		startTransition(() => {
			router.push("/search");
		});
	};

	return (
		<form onSubmit={handleSubmit} className="relative">
			<div className="relative">
				<Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
				<Input
					type="text"
					placeholder="جستجو در اخبار و مقالات، دسته‌ها، برچسب‌ها..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="pl-12 pr-24 rtl:pl-24 rtl:pr-12 h-14 text-lg rounded-xl border-2 focus-visible:ring-primary"
				/>
				<div className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
					<AnimatePresence>
						{query && (
							<motion.button
								type="button"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								onClick={clearSearch}
								className="p-2 hover:bg-accent rounded-full transition-colors"
							>
								<X className="h-4 w-4" />
							</motion.button>
						)}
					</AnimatePresence>
					<Button type="submit" size="sm" disabled={isPending}>
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "جستجو"}
					</Button>
				</div>
			</div>
		</form>
	);
}

// Compact search for header
export function HeaderSearch() {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			router.push(`/search?q=${encodeURIComponent(query.trim())}`);
			setIsOpen(false);
			setQuery("");
		}
	};

	return (
		<div className="relative">
			<AnimatePresence>
				{isOpen ? (
					<motion.form
						initial={{ width: 40, opacity: 0 }}
						animate={{ width: 300, opacity: 1 }}
						exit={{ width: 40, opacity: 0 }}
						onSubmit={handleSubmit}
						className="flex items-center"
					>
						<Input
							type="text"
							placeholder="جستجو..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							autoFocus
							className="pr-10"
							onBlur={() => {
								if (!query) setIsOpen(false);
							}}
						/>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="absolute right-2 p-1"
						>
							<X className="h-4 w-4" />
						</button>
					</motion.form>
				) : (
					<motion.button
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						onClick={() => setIsOpen(true)}
						className="p-2 hover:bg-accent rounded-full transition-colors"
					>
						<Search className="h-5 w-5" />
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}
