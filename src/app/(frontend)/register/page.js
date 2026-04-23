"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/admin");
    }
  }, [user, router]);

  if (user) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <RegisterForm />
    </div>
  );
}
