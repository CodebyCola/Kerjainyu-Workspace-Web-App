"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { useToast } from "@/components/toast/ToastContext";
import { ROUTES } from "@/routes/route";
import { login } from "@/service/auth/auth.service";
import { type LoginInput, loginSchema } from "@/service/auth/auth.validator";
import { getErrorMessage } from "@/utils/Errors";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    try {
      const res = await login(data);
      toast.success(`welcome back ${data.username}`);
      router.push(ROUTES.PROJECTS);
    } catch (err) {
      // Whatever the server said (wrong password, unknown username,
      // etc.) or a network-failure fallback from getErrorMessage —
      // never a message invented here. This is a login-attempt
      // failure, not tied to one input, so it renders as AuthCard's
      // form-level banner rather than under a specific field.
      setFormError(getErrorMessage(err));
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back enter your details to continue."
      error={formError ?? undefined}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="text-tertiary hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <AuthInput
          label="Username"
          type="text"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />

        <AuthInput
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 bg-tertiary text-on-tertiary text-sm font-medium rounded-md py-2.5 hover:opacity-90 transition-opacity duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}
