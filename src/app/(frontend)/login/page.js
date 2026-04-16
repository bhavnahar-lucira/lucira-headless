"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-serif font-bold tracking-tight">
            Welcome Back
          </CardTitle>
          <p className="text-sm text-gray-500">
            Enter your mobile number to sign in to your account
          </p>
        </CardHeader>
        <CardContent className="mt-4">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
