import { AuthForm } from "@/components/auth-form";
import { changePasswordAction } from "@/app/actions";
import { requireAuthenticated } from "@/lib/session";

export default async function ChangePasswordPage() {
  await requireAuthenticated({ allowPasswordChange: true });

  return (
    <main className="auth-layout">
      <AuthForm
        title="首次登录请修改密码"
        subtitle="改密完成前，系统不会放行到管理后台。"
        action={changePasswordAction}
        submitLabel="保存新密码"
        fields={[
          {
            name: "password",
            label: "新密码",
            type: "password",
            autoComplete: "new-password",
          },
          {
            name: "confirmPassword",
            label: "确认新密码",
            type: "password",
            autoComplete: "new-password",
          },
        ]}
      />
    </main>
  );
}
