"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sheet } from "react-modal-sheet";
import { OtpSpinAuth } from "./OtpSpinAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function AuthDialog({ open, onOpenChange, onSuccess }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [currentStep, setCurrentStep] = useState("login");

  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleStepChange = (step) => {
    if (isMobile) {
      // First close, then switch, then open again to trigger animation
      onOpenChange(false);
      setTimeout(() => {
        setCurrentStep(step);
        onOpenChange(true);
      }, 300);
    } else {
      setCurrentStep(step);
    }
  };

  if (isMobile) {
    return (
      <Sheet 
        isOpen={open} 
        onClose={() => onOpenChange(false)}
      >
        <Sheet.Container className="!rounded-t-[30px] !bg-[#FFFEFC] !h-auto">
          <Sheet.Header />
          <Sheet.Content className="!pb-10">
            <div className="sr-only">
              <h2>{currentStep === "register" ? "Registration" : "Authentication"}</h2>
              <p>{currentStep === "register" ? "Join Lucira to win rewards." : "Login to your account."}</p>
            </div>
            <div className="custom-scrollbar-hide">
              <OtpSpinAuth 
                onSuccess={handleSuccess} 
                onClose={() => onOpenChange(false)} 
                initialStep={currentStep}
                onStepChange={handleStepChange}
              />
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => onOpenChange(false)} />
      </Sheet>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[1200px] p-0 border-none bg-transparent shadow-none overflow-visible" showCloseButton={false}>
        <div className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Login or register to access your account and win prizes.
          </DialogDescription>
        </div>
        <OtpSpinAuth 
          onSuccess={handleSuccess} 
          onClose={() => onOpenChange(false)} 
          initialStep={currentStep}
          onStepChange={handleStepChange}
        />
      </DialogContent>
    </Dialog>
  );
}