"use client";

import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogout = () => {
    // クライアントサイドでCookieを削除してリダイレクト
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      ログアウト
    </Button>
  );
}
