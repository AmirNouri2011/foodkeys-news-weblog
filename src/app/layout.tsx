import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
	),
	title: {
		default: process.env.NEXT_PUBLIC_SITE_NAME || "نشریه فودکیز",
		template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || "نشریه فودکیز"}`,
	},
	description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "پلتفرم خبر و مقاله",
	keywords: ["خبر", "مقاله", "وب‌لاگ", "فناوری", "سبک زندگی"],
	authors: [{ name: "FoodKeys" }],
	creator: "FoodKeys",
	openGraph: {
		type: "website",
		locale: "fa_IR",
		url: process.env.NEXT_PUBLIC_SITE_URL,
		siteName: process.env.NEXT_PUBLIC_SITE_NAME,
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: process.env.NEXT_PUBLIC_SITE_NAME,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: process.env.NEXT_PUBLIC_SITE_NAME,
		description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
		images: ["/og-image.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: "your-google-verification-code",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fa" dir="rtl" suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange={false}
				>
					<div className="relative flex min-h-screen flex-col">
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
