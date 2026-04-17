// src/lib/gtm.js

export const pushToDataLayer = (data) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
};

export const pushPageType = (pageType) => {
  pushToDataLayer({ Pagetype: pageType }); // Note the capital P in Pagetype as per spec
};

export const pushPromoClick = (promoClickData) => {
  pushToDataLayer({
    event: 'promoClick',
    promoClick: promoClickData
  });
};

export const pushPromoView = (promoViewData) => {
  pushToDataLayer({
    event: 'promoView',
    promoView: promoViewData
  });
};

export const pushProductImpression = (products) => {
  pushToDataLayer({
    event: 'productImpression',
    products: products
  });
};

export const pushProductClick = (products) => {
  pushToDataLayer({
    event: "productClick",
    products: products
  });
};

export const pushProductView = (products) => {
  pushToDataLayer({
    event: "productView",
    products: products
  });
};

export const pushAddToCart = (products) => {
  pushToDataLayer({
    event: "addToCart",
    products: products
  });
};

export const pushAddToWishlist = (products) => {
  pushToDataLayer({
    event: "addToWishlist",
    products: products
  });
};

export const pushViewCart = (cartData) => {
  pushToDataLayer({
    event: "viewCart",
    cart: cartData
  });
};

export const pushBeginCheckout = (cartData) => {
  pushToDataLayer({
    event: "beginCheckout",
    cart: cartData
  });
};

export const pushRemoveFromCart = (cartItem) => {
  pushToDataLayer({
    event: "removeFromCart",
    cart: cartItem
  });
};

export const pushRemoveFromWishlist = (productItem) => {
  pushToDataLayer({
    event: "removeFromWishlist",
    removed_product: productItem
  });
};

export const pushCustomerData = (customerData) => {
  pushToDataLayer({
    event: 'customerData',
    customer: customerData
  });
};

export const pushMarketingData = (marketingData) => {
  pushToDataLayer({
    event: 'marketingData',
    marketing: marketingData
  });
};

export const pushNewsletterSubscription = (email) => {
  pushToDataLayer({
    event: 'newsletterSubscription',
    newsletter: {
      email: email
    }
  });
};

export const pushSignup = (userData) => {
  pushToDataLayer({
    event: "signup",
    user: userData
  });
};

export const pushLogout = (userData) => {
  pushToDataLayer({
    event: 'logout',
    User: userData // Note uppercase 'User' as per spec
  });
};

export const pushLogin = (userData) => {
  pushToDataLayer({
    event: 'login',
    User: userData // Note uppercase 'User' as per spec
  });
};

// Helper for formatting price safely
export const formatGtmPrice = (price) => {
  const p = parseFloat(price);
  return isNaN(p) ? 0.00 : parseFloat(p.toFixed(2));
};
