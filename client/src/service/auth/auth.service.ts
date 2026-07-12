import { type LoginInput } from "@/Service/auth/auth.validator";

export async function login(data:LoginInput) {
    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);

        return;
      }
}