import { Suspense } from "react";
import LoginGate from "./login-gate";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <LoginGate />
    </Suspense>
  );
}
