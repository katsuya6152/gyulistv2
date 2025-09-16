export default function Home() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="text-center">
				<h1 className="text-4xl font-bold text-foreground mb-4">Gyulist v2</h1>
				<p className="text-lg text-muted-foreground mb-8">
					モダンなWebアプリケーション
				</p>
				<div className="bg-card p-6 rounded-lg shadow-sm border">
					<h2 className="text-xl font-semibold mb-4">技術スタック</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
						<div>
							<h3 className="font-medium text-primary">フロントエンド</h3>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• Next.js 14</li>
								<li>• TypeScript</li>
								<li>• Tailwind CSS</li>
								<li>• shadcn/ui</li>
							</ul>
						</div>
						<div>
							<h3 className="font-medium text-primary">バックエンド</h3>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• Hono</li>
								<li>• Drizzle ORM</li>
								<li>• PostgreSQL</li>
								<li>• Zod</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
