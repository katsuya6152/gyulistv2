import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardPresentation from "./presentational";
import { type User, userSchema } from "./schema";

export default function DashboardContainer() {
  // 認証状態を確認（Server Component）
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    redirect("/login");
  }

  const user: User = userSchema.parse(JSON.parse(userCookie.value));

  return <DashboardPresentation user={user} />;
}
