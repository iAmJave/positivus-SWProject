import LoginForm from "@/components/auth/LoginForm";
import { auth } from "@/types/auth";
import { redirect } from "next/navigation";

export default async function LoginGate() {
  const session = await auth();

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  if (session && session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return <LoginForm />;
}
