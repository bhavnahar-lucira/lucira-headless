"use client";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";

export default function ContactSheet({ open, onOpenChange }) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle className="font-normal text-base">
                        Still confused? Let us guide you
                    </DrawerTitle>
                </DrawerHeader>

                <div className="w-full px-4 flex flex-col gap-3">

                    <a
                        href="tel:9004436052"
                        className="flex items-center gap-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition"
                    >
                        <span className="flex w-10 h-10 items-center justify-center">
                            <PhoneCall size={20} strokeWidth={1.5} />
                        </span>
                        <span className="text-base font-medium">
                            Call 9004436052
                        </span>
                    </a>
                   
                    <a
                        href="https://api.whatsapp.com/send/?phone=%2B919004435760&text=Hi%2C+I+want+to+get+more+information+about+Lucira&type=phone_number&app_absent=0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition"
                    >
                        <span className="flex w-10 h-10 items-center justify-center">
                           
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M20.52 3.48A11.82 11.82 0 0012.04 0C5.42 0 .06 5.36.06 11.98c0 2.11.55 4.17 1.6 6L0 24l6.17-1.62a11.9 11.9 0 005.86 1.5h.01c6.62 0 11.98-5.36 11.98-11.98a11.9 11.9 0 00-3.5-8.42z"
                                    fill="#25D366"
                                />
                                <path
                                    d="M17.34 14.26c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"
                                    fill="#ffffff"
                                />
                            </svg>
                        </span>
                        <span className="text-base font-medium">
                            WhatsApp 9004435760
                        </span>
                    </a>

                </div>

                <DrawerFooter className="pt-3">
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full h-12">
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
