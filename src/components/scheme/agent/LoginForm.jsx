"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { EyeOff, Eye } from "lucide-react";
import { useDispatch } from "react-redux";
import { setAgentAuth } from "@/redux/features/scheme/agentAuthSlice";
import { setAgentStores } from "@/redux/features/scheme/agentStoreSlice";

export function LoginForm({ onSuccess }) {
  const dispatch = useDispatch();

  const [storeCode, setStoreCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const storeAgentLogin = async (e) => {
    e.preventDefault();

    if (!storeCode || !password) return;

    try {
      setLoading(true);

      // 1️⃣ Get Token
      const res = await fetch("/api/scheme/agent-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: storeCode,
          password: password,
        }),
      });

      const data = await res.json();

      console.log(data);

      if (!res.ok) {
        alert("Invalid Credentials");
        setLoading(false);
        return;
      }

      // Save token in redux
      dispatch(setAgentAuth());

      // 2️⃣ Get Stores
      const storeRes = await fetch("/api/scheme/agent-store", {
        method: "POST",
      });

      const storeData = await storeRes.json();

      dispatch(setAgentStores(storeData.Entities || []));

      setLoading(false);

      // 3️⃣ Move to Store Selection
      onSuccess();

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={storeAgentLogin}>
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-2xl">Store Login</h1>

        <div className="flex flex-col gap-5 w-full">
          <Field>
            <Input
              className="h-12"
              type="text"
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              placeholder="Enter Store Code"
              required
            />
          </Field>

          <InputGroup className="h-12 relative">
            <InputGroupInput
              placeholder="Enter password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div
              className="w-15 h-full flex justify-center items-center cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <Eye size={18} color="gray" />
              ) : (
                <EyeOff size={18} color="gray" />
              )}
            </div>
          </InputGroup>

          <Field>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full uppercase text-md"
            >
              {loading ? "Logging..." : "Login"}
            </Button>
          </Field>
        </div>
      </div>
    </form>
  );
}