import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
	main: [
		{ href: "/", label: "خانه" },
		{ href: "/posts", label: "اخبار و مقالات" },
		{ href: "/categories", label: "دسته‌ها" },
		{ href: "/tags", label: "برچسب‌ها" },
		{ href: "/search", label: "جستجو" },
	],
	legal: [
		{ href: "/privacy", label: "حریم خصوصی" },
		{ href: "/terms", label: "قوانین و مقررات" },
	],
};

const socialLinks = [
	{ href: "https://twitter.com", icon: Twitter, label: "توییتر" },
	{ href: "https://github.com", icon: Github, label: "گیت‌هاب" },
	{ href: "https://linkedin.com", icon: Linkedin, label: "لینکدین" },
	{ href: "mailto:contact@example.com", icon: Mail, label: "ایمیل" },
];

export function Footer() {
	return (
		<footer className="border-t bg-muted/30">
			<div className="container-wrapper py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="md:col-span-2">
						<Link
							href="/"
							className="font-heading text-xl font-bold gradient-text"
						>
							نشریه فودکیز
						</Link>
						<p className="mt-4 text-sm text-muted-foreground max-w-md">
							منبع معتبر اخبار، مقالات و مطالب به‌روز. محتوای باکیفیت برای شما.
						</p>
						{/* Social Links */}
						<div className="flex gap-4 mt-6">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="p-2 rounded-full bg-background hover:bg-accent transition-colors"
									aria-label={social.label}
								>
									<social.icon className="h-4 w-4" />
								</a>
							))}
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="font-semibold mb-4">لینک‌های سریع</h3>
						<ul className="space-y-2">
							{footerLinks.main.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h3 className="font-semibold mb-4">قانونی</h3>
						<ul className="space-y-2">
							{footerLinks.legal.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 pt-8 border-t">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-sm text-muted-foreground">
							© {new Date().getFullYear()} تمامی حقوق مادی و معنوی این سایت
							متعلق به مرجع صنایع غذایی و کشاورزی ایران می باشد
						</p>
						<p className="text-sm text-muted-foreground">
							ساخته‌شده با ❤️ توسط FoodKeys
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
