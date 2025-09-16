import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "Gyulist v2 - モダンなWebアプリケーション",
	description: "Next.js 14、TypeScript、Tailwind CSS、Honoで構築されたモダンなWebアプリケーション",
	keywords: ["Next.js", "TypeScript", "Tailwind CSS", "Hono", "PostgreSQL", "Prisma"],
	authors: [{ name: "Gyulist Team" }],
	viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja" className={inter.variable}>
			<body className={`${inter.className} antialiased`}>
				<div className="min-h-screen bg-background text-foreground">
					{children}
				</div>
			</body>
		</html>
	);
}
