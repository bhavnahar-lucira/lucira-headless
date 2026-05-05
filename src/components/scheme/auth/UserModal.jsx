"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { setCustomer } from "@/redux/features/scheme/customerSlice";
import { useState } from "react";
import { toast } from "react-toastify";

export function UserModal({ open, onOpenChange }) {
  const router = useRouter();
  const dispatch = useDispatch();

  /* ================= STATE ================= */
  const [step, setStep] = useState("login");
  const [mobile, setMobile] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= HELPERS ================= */
  const validMobile = () => /^[6-9]\d{9}$/.test(mobile);

  const resetModal = () => {
    setStep("login");
    setMobile("");
    setFirstName("");
    setLastName("");
    setOtp("");
    setOtpVerified(false);
    setLoading(false);
  };

  const loginSuccess = async (party_id, mobile, name) => {
    const payload = { party_id, mobile, name };
    dispatch(setCustomer(payload));

    await fetch("/api/scheme/session/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    onOpenChange(false);
    resetModal();
    router.push("/dashboard/scheme");
  };

  /* ================= LOGIN FLOW ================= */

  const sendLoginOtp = async () => {
    if (!validMobile()) return toast.error("Enter valid mobile");

    setLoading(true);
    const res = await fetch("/api/scheme/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    setLoading(false);

    if (!res.ok) return toast.error("Failed to send OTP");

    toast.success("OTP sent");
    setStep("otp-login");
  };

  const verifyLoginOtp = async () => {
    if (otp.length !== 4) return toast.error("Invalid OTP");

    setLoading(true);
    const otpRes = await fetch("/api/scheme/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });

    if (!otpRes.ok) {
      setLoading(false);
      return toast.error("Incorrect OTP");
    }

    setOtpVerified(true);

    // 🔍 Check customer
    const res = await fetch("/api/scheme/customer/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });

    const user = (await res.json())?.Entities?.[0];
    setLoading(false);

    if (!user?.party_id) {
      toast.info("Mobile verified. Please complete registration.");
      return setStep("register");
    }

    loginSuccess(user.party_id, user.mobile, user.party_name);
  };

  /* ================= REGISTER FLOW ================= */

  const registerUser = async () => {
    if (!firstName.trim() || !lastName.trim())
      return toast.error("Enter full name");
    if (!validMobile()) return toast.error("Enter valid mobile");

    // ✅ OTP already verified → no resend
    if (otpVerified) {
      return createCustomer();
    }

    setLoading(true);
    const res = await fetch("/api/scheme/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    setLoading(false);

    if (!res.ok) return toast.error("Failed to send OTP");

    toast.success("OTP sent");
    setStep("otp-register");
  };

  const verifyRegisterOtp = async () => {
    if (otp.length !== 4) return toast.error("Invalid OTP");

    setLoading(true);
    const otpRes = await fetch("/api/scheme/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });

    if (!otpRes.ok) {
      setLoading(false);
      return toast.error("Incorrect OTP");
    }

    setOtpVerified(true);
    await createCustomer();
  };

  const createCustomer = async () => {
    setLoading(true);

    // 🔍 Check again (safety)
    const checkRes = await fetch("/api/scheme/customer/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });

    const existing = (await checkRes.json())?.Entities?.[0];

    if (existing?.party_id) {
      setLoading(false);
      toast.info("Account already exists. Logging you in.");
      return loginSuccess(
        existing.party_id,
        existing.mobile,
        existing.party_name
      );
    }

    // ✅ Create new
    const res = await fetch("/api/scheme/customer/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        phone: mobile,
      }),
    });

    const user = await res.json();
    setLoading(false);

    loginSuccess(user.EntityId, mobile, `${firstName} ${""} ${lastName}`);
  };

  /* ================= UI ================= */


  return (
    <Dialog open={open} 
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetModal();
      }}
    >
      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            {step==="login"&&"Login"}
            {step==="otp-login"&&"Verify OTP"}
            {step==="register"&&"Register"}
            {step==="otp-register"&&"Verify OTP"}
          </DialogTitle>
        </DialogHeader>

        {step==="login" && <>
          <Input placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)}  className="h-11"/>
          <Button onClick={sendLoginOtp} disabled={loading} className="cursor-pointer h-14">
            {loading?"Sending...":"Send OTP"}
          </Button>
          <p className="text-center text-sm cursor-pointer" onClick={()=>setStep("register")}>New user? Register</p>
        </>}

        {step==="otp-login" && <>
          <Input placeholder="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} className="h-11"/>
          <Button onClick={verifyLoginOtp} disabled={loading} className="cursor-pointer h-14">
            {loading?"Verifying...":"Verify"}
          </Button>
        </>}

        {step==="register" && <>
          <Input placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} className="h-11"/>
          <Input placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} className="h-11"/>
          <Input placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} className="h-11"/>
          <Button onClick={registerUser} disabled={loading} className="cursor-pointer h-14">
            {loading
                ? "Processing..."
                : otpVerified
                ? "Register"
                : "Send OTP"}
          </Button>
          <p className="text-center text-sm cursor-pointer" onClick={()=>setStep("login")}>Already registered? Login</p>
        </>}

        {step==="otp-register" && <>
          <Input placeholder="Enter OTP"value={otp}  onChange={e=>setOtp(e.target.value)} className="h-11"/>
          <Button onClick={verifyRegisterOtp} disabled={loading} className="cursor-pointer h-14">
            {loading?"Verifying...":"Verify & Register"}
          </Button>
        </>}

      </DialogContent>
    </Dialog>
  );
}
