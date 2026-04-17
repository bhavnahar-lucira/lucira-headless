"use client";

import { useDispatch, useSelector } from "react-redux";
import { 
  openCart, 
  closeCart, 
  toggleCart, 
  setCart,
  addToCart as addToCartThunk,
  removeFromCart as removeFromCartThunk,
  updateCartItem as updateCartItemThunk
} from "@/redux/features/cart/cartSlice";
import { selectCart } from "@/redux/features/cart/cartSelectors";
import { toast } from "react-toastify";

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const addToCart = async (product) => {
    try {
      await dispatch(addToCartThunk({ userId, product })).unwrap();
      // dispatch(openCart());
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCart = async (variantId) => {
    try {
      await dispatch(removeFromCartThunk({ userId, variantId })).unwrap();
    } catch (err) {
      console.error("Remove from cart error:", err);
      toast.error("Failed to remove from cart");
    }
  };

  const updateCartItem = async (payload) => {
    try {
      await dispatch(updateCartItemThunk({ userId, ...payload })).unwrap();
    } catch (err) {
      console.error("Update cart error:", err);
      toast.error("Failed to update cart");
    }
  };

  return {
    ...cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    openCart: () => dispatch(openCart()),
    closeCart: () => dispatch(closeCart()),
    toggleCart: () => dispatch(toggleCart()),
  };
};
