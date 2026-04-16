"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";

export function AuthDialog({ open, onOpenChange, initialMobile = "" }) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <LoginForm 
            initialMobile={initialMobile} 
            onSuccess={() => onOpenChange(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
