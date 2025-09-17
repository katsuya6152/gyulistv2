"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Heart, RefreshCw, Sparkles, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function HotReloadDemo() {
  const [counter, setCounter] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const features = [
    { name: "リアルタイム更新", icon: <RefreshCw className="h-4 w-4" />, color: "text-blue-500" },
    { name: "状態保持", icon: <Heart className="h-4 w-4" />, color: "text-red-500" },
    { name: "高速リロード", icon: <Zap className="h-4 w-4" />, color: "text-yellow-500" },
    { name: "開発効率", icon: <Star className="h-4 w-4" />, color: "text-purple-500" },
  ];

  const handleIncrement = () => {
    setCounter((prev) => prev + 1);
    setLastUpdate(new Date());
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleReset = () => {
    setCounter(0);
    setLastUpdate(new Date());
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const toggleFavorite = (feature: string) => {
    setFavorites((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          ホットリロードデモ
        </h2>
        <p className="text-muted-foreground">
          このコンポーネントを編集してホットリロードの動作を確認してください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* カウンターカード */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              インタラクティブカウンター
            </CardTitle>
            <CardDescription>ボタンをクリックしてカウンターを増やしてみてください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div
                className={`text-4xl font-bold transition-all duration-300 ${
                  isAnimating ? "scale-110 text-primary" : "text-foreground"
                }`}
              >
                {counter}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                最終更新: {lastUpdate.toLocaleTimeString("ja-JP")}
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleIncrement} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                カウントアップ
              </Button>
              <Button variant="outline" onClick={handleReset}>
                リセット
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 機能リストカード */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              お気に入り機能
            </CardTitle>
            <CardDescription>機能をクリックしてお気に入りに追加/削除できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleFavorite(feature.name)}
                >
                  <div className="flex items-center gap-3">
                    <span className={feature.color}>{feature.icon}</span>
                    <span className="font-medium">{feature.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {favorites.includes(feature.name) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <Badge variant={favorites.includes(feature.name) ? "success" : "outline"}>
                      {favorites.includes(feature.name) ? "お気に入り" : "クリック"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {favorites.length > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-2">お気に入り機能:</div>
                <div className="flex flex-wrap gap-1">
                  {favorites.map((fav, index) => (
                    <Badge key={index} variant="success" className="text-xs">
                      {fav}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ホットリロード説明カード */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            ホットリロードのテスト方法
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="font-medium text-blue-800 dark:text-blue-200">
                1. このコンポーネントを編集
              </div>
              <div className="text-blue-600 dark:text-blue-300">
                <code>/workspace/apps/web/src/components/hot-reload-demo.tsx</code>{" "}
                を編集してください
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="font-medium text-green-800 dark:text-green-200">2. 保存して確認</div>
              <div className="text-green-600 dark:text-green-300">
                ファイルを保存すると、ページが自動的に更新されます（状態は保持されます）
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="font-medium text-purple-800 dark:text-purple-200">
                3. 状態の保持を確認
              </div>
              <div className="text-purple-600 dark:text-purple-300">
                カウンターの値やお気に入りが保持されていることを確認してください
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
