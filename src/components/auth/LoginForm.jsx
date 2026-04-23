"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, setAvatar } from "@/redux/features/user/userSlice";
import { mergeGuestWishlist } from "@/redux/features/wishlist/wishlistSlice";
import { mergeCart } from "@/redux/features/cart/cartSlice";
import {
  sendOtpApi,
  verifyOtpApi,
  registerCustomer,
} from "@/lib/api";

export function LoginForm({ onSuccess, initialMobile = "", initialStep = "login" }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState(initialStep);
  const [mobile, setMobile] = useState(initialMobile || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (step === "success" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === "success" && countdown === 0) {
      router.replace("/admin");
    }
    return () => clearInterval(timer);
  }, [step, countdown, router]);

  const mobileRef = useRef();
  const otpRef = useRef();
  const firstNameRef = useRef();

  const validMobileNum = (num) => /^[6-9]\d{9}$/.test(String(num || "").trim());
  const validMobile = () => validMobileNum(mobile);

  useEffect(() => {
    if (initialMobile && validMobileNum(initialMobile)) {
      setMobile(String(initialMobile).trim());
    }
  }, [initialMobile]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (step === "login") {
      setTimeout(() => mobileRef.current?.focus(), 100);
    } else if (step === "otp-login") {
      setTimeout(() => otpRef.current?.focus(), 100);
    } else if (step === "register") {
      setTimeout(() => firstNameRef.current?.focus(), 100);
    }
  }, [step]);

  const loginSuccess = async (data) => {
    const user = data.user || data.customer;
    const userId = user?.id;
    
    dispatch(
      login({
        id: userId,
        mobile,
        first_name: user?.first_name,
        last_name: user?.last_name,
        name:
          user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : "User",
      })
    );

    // Fetch avatar immediately after login
    try {
      const avRes = await fetch("/api/customer/profile/avatar");
      if (avRes.ok) {
        const avData = await avRes.json();
        if (avData.avatar) {
          dispatch(setAvatar(avData.avatar));
        }
      }
    } catch (err) {
      console.error("Avatar fetch error on login:", err);
    }

    try {
      await dispatch(mergeCart({ userId })).unwrap();
    } catch (err) {
      console.error("Cart merge failed:", err);
    }

    try {
      await dispatch(mergeGuestWishlist()).unwrap();
    } catch (err) {
      console.error("Wishlist merge failed:", err);
    }

    toast.success("Login Successful");
    if (onSuccess) onSuccess();
    else router.push("/");
    router.refresh();
  };

  const sendLoginOtp = async () => {
    if (!validMobile()) return toast.error("Enter valid mobile");

    try {
      setLoading(true);
      await sendOtpApi(mobile);
      toast.success("OTP Sent");
      setStep("otp-login");
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async () => {
    if (otp.length < 4) return toast.error("Invalid OTP");

    try {
      setLoading(true);
      const data = await verifyOtpApi(mobile, otp);

      if (data.status === "REGISTER_REQUIRED" || data.type === "register") {
        setStep("register");
        return;
      }

      if (data.status === "LOGIN" || data.type === "success") {
        loginSuccess(data);
      }
    } catch (err) {
      toast.error(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    if (!firstName.trim() || !lastName.trim())
      return toast.error("Enter full name");

    if (!email.trim()) return toast.error("Enter email");

    try {
      setLoading(true);
      const data = await registerCustomer({
        firstName,
        lastName,
        email,
        mobile,
      });

      if (data.status === "REGISTER_SUCCESS" || data.type === "success") {
        loginSuccess(data);
      }
    } catch (err) {
      toast.error(err.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === "login" && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
            <div className="flex items-center border border-gray-200 rounded-md h-11 px-3 bg-white focus-within:border-black transition-all">
              <span className="text-sm text-gray-500 mr-2 border-r border-gray-200 pr-2">+91</span>
              <input
                ref={mobileRef}
                type="tel"
                placeholder="Mobile Number"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full h-full text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          <Button
            onClick={sendLoginOtp}
            disabled={loading}
            className="h-12 w-full bg-[#5f4745] hover:bg-[#4a3634] text-white font-semibold transition-colors mt-4"
          >
            {loading ? "Sending..." : "REQUEST OTP"}
          </Button>

          <p
            className="text-center text-sm text-gray-600 mt-4"
          >
            New user?{" "}
            <span 
              className="text-[#5a413f] font-bold underline cursor-pointer"
              onClick={() => router.push("/register")}
            >
              Register
            </span>
          </p>
        </>
      )}

      {step === "otp-login" && (
        <>
          <Input
            ref={otpRef}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="h-11"
          />
          <Button
            onClick={verifyLoginOtp}
            disabled={loading}
            className="h-12 w-full bg-[#5f4745] hover:bg-[#4a3634] text-white font-semibold transition-colors mt-4"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </>
      )}

      {step === "register" && (
        <>
          {/* ... existing register fields ... */}
          <p
            className="text-center text-sm text-gray-600 mt-4"
          >
            Already registered?{" "}
            <span 
              className="text-[#5a413f] font-bold underline cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </p>
        </>
      )}
    </div>
  );
}