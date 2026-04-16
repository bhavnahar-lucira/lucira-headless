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
      <DialogContent className="max-w-none w-auto p-0 border-none bg-transparent shadow-none">
        <OtpSpinAuth onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
