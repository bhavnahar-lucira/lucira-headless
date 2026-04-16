"use client";

import { useDispatch, useSelector } from "react-redux";
import { openCart, closeCart, toggleCart, setCart } from "@/redux/features/cart/cartSlice";
import { selectCart } from "@/redux/features/cart/cartSelectors";
import { toast } from "react-toastify";

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);

  const addToCart = async (item) => {
    // For now, just open the cart drawer to show the UI
    // In a real implementation, this would call the Shopify API
    dispatch(openCart());
    
    // Optional: add a small delay or check for success
    // toast.success("Added to cart!");
  };

  return {
    ...cart,
    addToCart,
    openCart: () => dispatch(openCart()),
    closeCart: () => dispatch(closeCart()),
    toggleCart: () => dispatch(toggleCart()),
  };
};
