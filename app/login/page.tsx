import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/app/actions";
import { isAuthenticated } from "@/lib/session";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <main className="auth-layout">
      <AuthForm
        title="登录后台"
        subtitle="首次使用请先用默认密码登录，系统会强制要求立即改密。"
        action={loginAction}
        submitLabel="登录"
        fields={[
          {
            name: "password",
            label: "密码",
            type: "password",
            autoComplete: "current-password",
          },
        ]}
      />
    </main>
  );
}
