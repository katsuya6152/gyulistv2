"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Code,
  Cpu,
  Database,
  Globe,
  Layers,
  Palette,
  Server,
  Shield,
  Type,
  Zap,
} from "lucide-react";

const techStack = {
  frontend: {
    title: "フロントエンド",
    icon: <Palette className="h-5 w-5" />,
    color: "text-blue-500",
    technologies: [
      { name: "Next.js 14", description: "App Router", icon: <Globe className="h-4 w-4" /> },
      { name: "TypeScript", description: "型安全性", icon: <Type className="h-4 w-4" /> },
      {
        name: "Tailwind CSS",
        description: "ユーティリティファースト",
        icon: <Palette className="h-4 w-4" />,
      },
      {
        name: "shadcn/ui",
        description: "コンポーネントライブラリ",
        icon: <Layers className="h-4 w-4" />,
      },
      { name: "Hono RPC", description: "RSC統合", icon: <Zap className="h-4 w-4" /> },
    ],
  },
  backend: {
    title: "バックエンド",
    icon: <Server className="h-5 w-5" />,
    color: "text-green-500",
    technologies: [
      { name: "Hono", description: "軽量Webフレームワーク", icon: <Zap className="h-4 w-4" /> },
      { name: "Prisma", description: "ORM", icon: <Database className="h-4 w-4" /> },
      {
        name: "PostgreSQL",
        description: "リレーショナルDB",
        icon: <Database className="h-4 w-4" />,
      },
      { name: "Zod", description: "スキーマ検証", icon: <Shield className="h-4 w-4" /> },
      { name: "OpenAPI", description: "API仕様", icon: <Code className="h-4 w-4" /> },
    ],
  },
  devops: {
    title: "DevOps & ツール",
    icon: <Cpu className="h-5 w-5" />,
    color: "text-purple-500",
    technologies: [
      { name: "Docker", description: "コンテナ化", icon: <Server className="h-4 w-4" /> },
      { name: "pnpm", description: "パッケージマネージャー", icon: <Layers className="h-4 w-4" /> },
      { name: "ESLint", description: "コード品質", icon: <Code className="h-4 w-4" /> },
      { name: "Prettier", description: "コードフォーマット", icon: <Type className="h-4 w-4" /> },
    ],
  },
};

export function TechStack() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">技術スタック</h2>
        <p className="text-muted-foreground">モダンな技術で構築されたアプリケーション</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(techStack).map(([key, stack]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={stack.color}>{stack.icon}</span>
                {stack.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stack.technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-muted-foreground mt-0.5">{tech.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{tech.name}</div>
                      <div className="text-xs text-muted-foreground">{tech.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
