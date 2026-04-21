import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helper to get or create session ID
const getSessionId = () => {
  if (typeof window === "undefined") return null;
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async ({ userId }) => {
    const sessionId = getSessionId();
    const response = await fetch(`/api/cart/get?userId=${userId || ''}&sessionId=${sessionId || ''}`);
    if (!response.ok) throw new Error('Failed to fetch cart');
    return await response.json();
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, sessionId, product }) => {
    const finalSessionId = sessionId || getSessionId();
    const response = await fetch(`/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId: finalSessionId, product }),
    });
    if (!response.ok) throw new Error('Failed to add to cart');
    return await response.json();
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ userId, sessionId, variantId }) => {
    const finalSessionId = sessionId || getSessionId();
    const response = await fetch(`/api/cart/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId: finalSessionId, variantId }),
    });
    if (!response.ok) throw new Error('Failed to remove from cart');
    return await response.json();
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ userId, sessionId, currentVariantId, nextVariantId, quantity, size, price, variantTitle, inStock, sku }) => {
    const finalSessionId = sessionId || getSessionId();
    const response = await fetch(`/api/cart/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId: finalSessionId,
        currentVariantId,
        nextVariantId,
        quantity,
        size,
        price,
        variantTitle,
        inStock,
        sku,
      }),
    });
    if (!response.ok) throw new Error('Failed to update cart');
    return await response.json();
  }
);

export const mergeCart = createAsyncThunk(
  "cart/mergeCart",
  async ({ userId }) => {
    const sessionId = getSessionId();
    console.log("REDUX MERGE START:", { userId, sessionId });
    const response = await fetch(`/api/cart/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId }),
    });
    if (!response.ok) throw new Error('Failed to merge cart');
    const data = await response.json();
    console.log("REDUX MERGE SUCCESS:", data);
    return data;
  }
);

export const repriceCartForCheckout = createAsyncThunk(
  "cart/repriceCartForCheckout",
  async ({ userId }) => {
    const sessionId = getSessionId();
    const response = await fetch("/api/cart/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, sessionId }),
    });
    if (!response.ok) throw new Error("Failed to recalculate checkout cart");
    return await response.json();
  }
);

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  appliedCoupon: null,
  nectorPoints: null, // { coin_value: 0, fiat_value: 0, points_label: "" }
  isCartOpen: false,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.appliedCoupon = null;
      state.nectorPoints = null;
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    },
    applyPoints: (state, action) => {
      state.nectorPoints = action.payload;
    },
    removePoints: (state) => {
      state.nectorPoints = null;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(repriceCartForCheckout.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      });
  },
});

export const { 
  clearCart, 
  applyCoupon, 
  removeCoupon, 
  applyPoints,
  removePoints,
  openCart, 
  closeCart, 
  toggleCart 
} = cartSlice.actions;
export default cartSlice.reducer;
