"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";

interface StatusCardProps {
  title: string;
  description?: string;
  status: "success" | "error" | "warning" | "loading";
  data?: any;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

export function StatusCard({
  title,
  description,
  status,
  data,
  onRefresh,
  lastUpdated,
}: StatusCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "loading":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "success":
        return <Badge variant="success">接続成功</Badge>;
      case "error":
        return <Badge variant="destructive">エラー</Badge>;
      case "warning":
        return <Badge variant="warning">警告</Badge>;
      case "loading":
        return <Badge variant="secondary">読み込み中</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {getStatusIcon()}
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data && (
          <div className="space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
        {lastUpdated && (
          <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
            最終更新: {lastUpdated.toLocaleString("ja-JP")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
