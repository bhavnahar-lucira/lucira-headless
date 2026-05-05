"use client";

import { useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/scheme/agent/LoginForm";
import { StoreForm } from "@/components/scheme/agent/StoreForm";
import Logo from "@/assets/scheme/logo.svg";

export default function AgentAdminPage() {
  const [step, setStep] = useState("login");

  return (
    <div className="grid min-h-svh bg-cover bg-center">
      <div className="flex items-center justify-center min-h-screen flex-col">
        <Image src={Logo.src} alt="lucira" className="mx-auto" width={180} height={50} priority />
        <div className="flex flex-col justify-between bg-white p-10 rounded-2xl shadow-lg w-full max-w-100 mx-auto gap-20 border mt-10">
          {step === "login" && (
            <LoginForm onSuccess={() => setStep("store")} />
          )}
          {step === "store" && <StoreForm />}
        </div>
      </div>
    </div>
  );
}


