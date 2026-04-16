"use client";
import { useState } from "react";
import { ShoppingCart, HeartPlus, Share, Check } from "lucide-react";

export default function AtcBar() {

    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e) => {

        /* ripple */
        const button = e.currentTarget;
        const circle = document.createElement("span");

        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`;

        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) ripple.remove();

        button.appendChild(circle);

        /* simulate API */

        setLoading(true);

        setTimeout(() => {

            setLoading(false);
            setAdded(true);

            setTimeout(() => {
                setAdded(false);
            }, 2000);

        }, 1200);
    };

    return (
        <div className="flex justify-between gap-4 items-center fixed left-0 bottom-0 z-10 w-full lg:sticky lg:bottom-0 shadow-[rgba(0,0,0,0.16)_0px_10px_36px_0px] py-4 bg-gray-50">
            <button
                onClick={handleAddToCart}
                className={`relative overflow-hidden h-12 flex-1 flex items-center justify-center gap-2 rounded-md text-white transition-all duration-300 hover:cursor-pointer
                ${added ? "bg-green-600" : "bg-linear-to-r from-primary/90 to-primary gold-shimmer"}
                ${loading ? "cursor-not-allowed opacity-80" : "hover:scale-[1.02]"}`}
            >

                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                    </>
                ) : added ? (
                    <>
                        <Check size={20} />
                        Added
                    </>
                ) : (
                    <>
                        <ShoppingCart className="animate-cart-luxury" size={20} />
                        Add to Cart
                    </>
                )}

            </button>
            <div className="border border-primary-800 rounded-md w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-white cursor-pointer transition">
                <HeartPlus size={20} />
            </div>
            <div className="border border-primary-800 rounded-md w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-white cursor-pointer transition">
                <Share size={20} />
            </div>
        </div>
    );
}