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
import { register as registerUser } from "@/service/auth/auth.service";
import {
  type RegisterInput,
  registerSchema,
} from "@/service/auth/auth.validator";
import { getErrorMessage } from "@/utils/Errors";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: RegisterInput) {
    setFormError(null);
    try {
      await registerUser(data);
      toast.info("account created successfully.");
      router.push(ROUTES.LOGIN);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Set up your account to join your project group."
      error={formError ?? undefined}
      footer={
        <>
          Already have an account?{" "}
          <Link href={ROUTES.LOGIN} className="text-tertiary hover:underline">
            Log in
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <AuthInput
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 bg-tertiary text-on-tertiary text-sm font-medium rounded-md py-2.5 hover:opacity-90 transition-opacity duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
