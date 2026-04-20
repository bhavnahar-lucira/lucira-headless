"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { OtpSpinAuth } from "./OtpSpinAuth";

export function AuthDialog({ open, onOpenChange }) {
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
        <OtpSpinAuth onSuccess={() => onOpenChange(false)} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}