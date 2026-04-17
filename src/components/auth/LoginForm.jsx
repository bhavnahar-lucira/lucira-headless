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

export function LoginForm({ onSuccess, initialMobile = "" }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState("login");
  const [mobile, setMobile] = useState(initialMobile || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

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
          <Input
            ref={mobileRef}
            placeholder="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="h-11"
          />
          <Button
            onClick={sendLoginOtp}
            disabled={loading}
            className="h-14 w-full"
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>
          <p
            className="text-center text-sm cursor-pointer"
            onClick={() => setStep("register")}
          >
            New user? Register
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
            className="h-14 w-full"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </>
      )}

      {step === "register" && (
        <>
          <div className="text-sm text-gray-600">
            <p className="font-medium">Mobile Number</p>
            <p className="text-base font-semibold">{mobile}</p>
          </div>

          <Input
            ref={firstNameRef}
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-11"
          />

          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-11"
          />

          <Input
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />

          <Button
            onClick={registerUser}
            disabled={loading}
            className="h-14 w-full"
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          <p
            className="text-center text-sm cursor-pointer"
            onClick={() => setStep("login")}
          >
            Already registered? Login
          </p>
        </>
      )}
    </div>
  );
}
