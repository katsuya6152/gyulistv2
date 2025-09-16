import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Gyulist v2",
	description: "Gyulist v2 - モダンなWebアプリケーション",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja">
			<body className={inter.className}>
				<div className="min-h-screen bg-background">{children}</div>
			</body>
		</html>
	);
}
