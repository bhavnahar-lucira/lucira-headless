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
      <DialogContent className="max-w-[95vw] sm:max-w-none w-auto p-0 border-none bg-transparent shadow-none overflow-visible">
        <OtpSpinAuth onSuccess={() => onOpenChange(false)} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
