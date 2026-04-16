"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { OtpSpinAuth } from "./OtpSpinAuth";

export function AuthDialog({ open, onOpenChange }) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-[fit-content] p-0 border-none bg-transparent">
        <OtpSpinAuth onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
