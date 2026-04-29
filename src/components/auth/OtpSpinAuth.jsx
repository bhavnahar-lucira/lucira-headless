"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { motion, useAnimation } from "framer-motion";
import {
  sendOtpApi,
  verifyOtpApi,
  registerCustomer,
} from "@/lib/api";
import { login, setAvatar } from "@/redux/features/user/userSlice";
import { mergeGuestWishlist } from "@/redux/features/wishlist/wishlistSlice";
import { mergeCart } from "@/redux/features/cart/cartSlice";
import "./OtpSpinAuth.css";

const SPIN_PRIZES = [
  { label: "₹1,500 OFF", value: "1500_off", chance: 33.33 },
  { label: "₹1,000 OFF", value: "1000_off", chance: 33.33 },
  { label: "₹750 OFF", value: "750_off", chance: 33.34 },
  { label: "Diamond Pendant", value: "diamond_pendant", chance: 0 },
  { label: "₹5,000 OFF", value: "5000_off", chance: 0 },
  { label: "₹10,000 OFF", value: "10000_off", chance: 0 },
];

const WHEEL_SEGMENTS = [
  { value: "diamond_pendant", label: "Diamond Pendant", centerAngle: 0 },
  { value: "1500_off", label: "₹1,500 OFF", centerAngle: 60 },
  { value: "10000_off", label: "₹10,000 OFF", centerAngle: 120 },
  { value: "1000_off", label: "₹1,000 OFF", centerAngle: 180 },
  { value: "5000_off", label: "₹5,000 OFF", centerAngle: 240 },
  { value: "750_off", label: "₹750 OFF", centerAngle: 300 },
];

const COUPON_MAP = {
  "750_off": "GRAND750",
  "1000_off": "GRAND1000",
  "1500_off": "GRAND1500",
};

export function OtpSpinAuth({ 
  onSuccess, 
  onClose, 
  initialMobile = "", 
  initialStep = "login", 
  onStepChange,
  forceShowWheel = false,
  overrideHeading = "",
  overrideSubtext = ""
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const controls = useAnimation();

  const [step, setStep] = useState(initialStep); // login, otp, register, success
  const [mobile, setMobile] = useState(initialMobile);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (initialMobile) setMobile(initialMobile);
  }, [initialMobile]);
  
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [consent, setConsent] = useState(true);

  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const mobileRef = useRef();
  const firstNameRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer]);

  // WebOTP API listener
  useEffect(() => {
    if ("OTPCredential" in window && (step === "otp")) {
      const ac = new AbortController();
      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: ac.signal,
        })
        .then((otpData) => {
          if (otpData && otpData.code) {
            handleAutoFillOtp(otpData.code);
          }
        })
        .catch((err) => console.log("WebOTP Error:", err));
      return () => ac.abort();
    }
  }, [step]);

  // Focus management for different steps
  useEffect(() => {
    if (step === "login") {
      setTimeout(() => mobileRef.current?.focus(), 100);
    } else if (step === "otp") {
      setTimeout(() => otpRefs[0]?.current?.focus(), 100);
    } else if (step === "register") {
      setTimeout(() => firstNameRef.current?.focus(), 100);
    }
  }, [step]);

  const handleAutoFillOtp = (code) => {
    const cleanCode = code.replace(/\D/g, "").slice(0, 4);
    if (cleanCode.length === 4) {
      const newOtp = cleanCode.split("");
      setOtp(newOtp);
      handleVerifyOtp(cleanCode);
    }
  };

  const loginSuccess = async (data, skipRedirect = false) => {
    const user = data.user || data.customer;
    const userId = user?.id;
    
    dispatch(
      login({
        id: userId,
        mobile,
        name:
          user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : "User",
      })
    );

    try {
      const avRes = await fetch("/api/customer/profile/avatar");
      if (avRes.ok) {
        const avData = await avRes.json();
        if (avData.avatar) dispatch(setAvatar(avData.avatar));
      }
    } catch (err) {}

    await dispatch(mergeCart({ userId })).unwrap();
    await dispatch(mergeGuestWishlist()).unwrap();

    if (!skipRedirect) {
      toast.success("Login Successful");
      if (onSuccess) onSuccess();
      else router.push("/");
      router.refresh();
    }
  };

  const handleSendOtp = async () => {
    if (mobile.length !== 10) return toast.error("Enter valid 10-digit mobile");
    setLoading(true);
    try {
      await sendOtpApi(mobile);
      toast.success("OTP Sent");
      setStep("otp");
      setTimer(30);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (overrideOtp) => {
    const otpValue = typeof overrideOtp === "string" ? overrideOtp : otp.join("");
    if (otpValue.length !== 4) return toast.error("Enter 4-digit OTP");
    setLoading(true);
    try {
      const data = await verifyOtpApi(mobile, otpValue);
      if (data.status === "REGISTER_REQUIRED" || data.type === "register") {
        setStep("register");
      } else if (data.status === "LOGIN" || data.type === "success") {
        loginSuccess(data);
      }
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current.focus();
    }
    
    // Auto-verify if 4 digits are entered
    if (index === 3 && value) {
      const finalOtp = [...newOtp];
      finalOtp[3] = value.slice(-1);
      if (finalOtp.every(d => d !== "")) {
        // We call it after a tiny delay so the last digit is visible
        setTimeout(() => {
           const otpVal = finalOtp.join("");
           if (otpVal.length === 4) {
             handleVerifyOtp(otpVal); 
           }
        }, 50);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const getWeightedPrize = () => {
    const totalChance = SPIN_PRIZES.reduce((sum, p) => sum + p.chance, 0);
    let random = Math.random() * totalChance;
    for (const prize of SPIN_PRIZES) {
      if (random < prize.chance) return prize;
      random -= prize.chance;
    }
    return SPIN_PRIZES[0];
  };

  const handleSpinAndRegister = async () => {
    if (!firstName || !lastName || !email) return toast.error("Please fill all fields");

    setIsSpinning(true);
    const prize = getWeightedPrize();
    setWonPrize(prize);

    const segment = WHEEL_SEGMENTS.find((s) => s.value === prize.value) || WHEEL_SEGMENTS[0];
    const extraSpins = 360 * 5;
    const targetRotation = -segment.centerAngle;
    const finalRotation = -(extraSpins + Math.abs(targetRotation));

    await controls.start({
      rotate: finalRotation,
      transition: { duration: 4, ease: [0.17, 0.67, 0.12, 0.99] },
    });

    // After spin animation
    setTimeout(async () => {
      try {
        setLoading(true);
        const data = await registerCustomer({
          firstName,
          lastName,
          email,
          mobile,
          wonPrize: prize.value,
          prizeLabel: prize.label,
        });

        if (data.status === "REGISTER_SUCCESS" || data.type === "success") {
          loginSuccess(data, true);
          setStep("success");
        }
      } catch (err) {
        toast.error(err.message || "Registration failed");
        setIsSpinning(false);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const copyCoupon = () => {
    const code = COUPON_MAP[wonPrize?.value] || "LUCIRA10";
    navigator.clipboard.writeText(code);
    toast.success("Coupon copied!");
  };

  const showWheel = step === "register" || forceShowWheel;

  return (
    <div className={`otp-spin-auth-wrapper ${showWheel ? "signup-active" : "login-active"}`}>
      <button 
        className="close-button" 
        onClick={onClose || onSuccess}
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {/* Background/Side Image Container */}
      {showWheel ? (
        <div className="spin-wheel-wrapper">
          <div className="wheel-container">
            <motion.img
              src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Below_Banner_Trust_Icon_Strip_1_1.png?v=1770784760"
              alt="Spin the Wheel"
              className="spin-wheel-image"
              animate={controls}
              initial={{ rotate: 0 }}
            />
            <img
              src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Spin_The_Wheel_Spinner_1.png?v=1769229971"
              alt="Spin CTA"
              className="spin-wheel-cta"
            />
          </div>
        </div>
      ) : (
        (step === "login" || step === "otp" || step === "success") && (
          <div className="login-image-side" />
        )
      )}

      <div className="otp-form-wrapper">
        <div className="otp-heading">
          <img
            src="https://www.lucirajewelry.com/cdn/shop/files/LJ_Logo_Pink.svg"
            width="120"
            height="49"
            alt="lucira jewelry logo"
          />
        </div>

        {step === "login" && (
          <>
            <p className="heading">{overrideHeading || "WELCOME TO LUCIRA"}</p>
            <p className="subtext">{overrideSubtext || "Welcome To The Jewelry World Of Lucira!"}</p>
            <div className="mobile-wrap">
              <span className="country-code">+91</span>
              <input
                ref={mobileRef}
                type="tel"
                placeholder="Enter Phone Number"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="consent-wrapper">
              <label className="consent-label">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  I accept that I have read & understood Privacy Policy and T&Cs.
                </span>
              </label>
            </div>
            <button className="btn-primary" onClick={handleSendOtp} disabled={loading}>
              {loading ? "SENDING..." : "REQUEST OTP"}
            </button>
            <div className="safe-secure-text">
              <span>100% Secured & Spam Free</span>
            </div>
            <p className="register-link">
              New user? <span className="cursor-pointer font-bold underline" onClick={() => onStepChange ? onStepChange("register") : setStep("register")}>Register</span>
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="heading">{overrideHeading || "VERIFY OTP"}</p>
            <p className="subtext">{overrideSubtext || `Sent to +91 ${mobile}`}</p>
            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="tel"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>
            <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "VERIFYING..." : "VERIFY OTP"}
            </button>
            <p id="otp-timer">
              {timer > 0 ? (
                `Resend OTP in 00:${timer < 10 ? `0${timer}` : timer}`
              ) : (
                <span className="cursor-pointer underline font-bold" onClick={handleSendOtp}>
                  Resend OTP
                </span>
              )}
            </p>
          </>
        )}

        {step === "register" && (
          <div className="signupSection">
            <p className="heading">Register to Win a Reward</p>
            <p className="subtext">Try Your Luck! Win a Diamond Pendant</p>
            <div className="registration-form-inputs">
              <div className="registration-form-row-wrapper">
                <div className="grid-column">
                  <label>First Name <span className="red-required">*</span></label>
                  <input
                    ref={firstNameRef}
                    type="text"
                    className="field-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="grid-column">
                  <label>Last Name <span className="red-required">*</span></label>
                  <input
                    type="text"
                    className="field-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <label>Email Address <span className="red-required">*</span></label>
              <input
                type="email"
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label>Phone Number</label>
              <div className="mobile-wrap mb-3">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  maxLength="10"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="consent-wrapper">
                <label className="consent-label">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    I accept that I have read & understood Privacy Policy and T&Cs.
                  </span>
                </label>
              </div>

              <button
                className="btn-primary"
                onClick={handleSpinAndRegister}
                disabled={isSpinning || loading}
              >
                {isSpinning ? "SPINNING..." : "SPIN & CREATE ACCOUNT"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="success-section" id="successSection">
            <div className="text-4xl mb-4 text-center">🎉</div>
            <p className="heading">Your Account has been created Successfully</p>
            <p className="subtext" style={{ maxWidth: "280px", margin: "14px auto" }}>
              Your reward is ready, Apply this on checkout
            </p>
            <div className="coupon-box">
              <span id="couponCode">{COUPON_MAP[wonPrize?.value] || "LUCIRA10"}</span>
              <button className="copy-btn" onClick={copyCoupon}>
                📋
              </button>
            </div>
            <button 
              className="btn-primary mt-4" 
              onClick={() => {
                if (onSuccess) onSuccess();
                else router.push("/");
                router.refresh();
              }}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}

        {step === "register" && (
          <p className="register-link" style={{ marginBottom: "5px" }}>
            Already have an account?{" "}
            <span
              className="cursor-pointer font-bold underline"
              onClick={() => onStepChange ? onStepChange("login") : setStep("login")}
            >
              Login
            </span>
          </p>
        )}

      </div>
    </div>
  );
}