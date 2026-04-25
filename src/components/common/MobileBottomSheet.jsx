"use client";

import React from "react";
import { Sheet } from "react-modal-sheet";
import { X } from "lucide-react";

export function MobileBottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  detents = [0.9, 0.5],
  footer 
}) {
  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose}
      detents={detents}
    >
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>
          <div className="px-6 pb-8 flex flex-col h-full bg-white rounded-t-[32px]">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#443360]">{title}</h2>
              <button onClick={onClose} className="p-2">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {children}
            </div>
            
            {footer && (
              <div className="pt-6 pb-2">
                {footer}
              </div>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onClick={onClose} />
    </Sheet>
  );
}
