// src/lib/gtm.js

export const pushToDataLayer = (data) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
};

export const pushPageView = (pageData) => {
  pushToDataLayer({
    event: 'pageView',
    pageData: pageData
  });
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

export const pushProductClick = (data) => {
  pushToDataLayer({
    event: "productClick",
    products: data
  });
};

export const pushProductView = (productData) => {
  pushToDataLayer({
    event: "productView",
    products: productData
  });
};

export const pushAddToCart = (data) => {
  pushToDataLayer({
    event: "addToCart",
    eventId: data.eventId,
    products: data.products
  });
};

export const pushAddToWishlist = (data) => {
  pushToDataLayer({
    event: "addToWishlist",
    products: data
  });
};

export const pushViewCart = (cartData) => {
  pushToDataLayer({
    event: "viewCart",
    cart: cartData
  });
};

export const pushBeginCheckout = (checkoutData) => {
  pushToDataLayer({
    event: "begin_checkout",
    eventModel: checkoutData
  });
};

export const pushAddShippingInfo = (shippingData) => {
  pushToDataLayer({
    event: "add_shipping_info",
    eventModel: shippingData
  });
};

export const pushAddPaymentInfo = (paymentData) => {
  pushToDataLayer({
    event: "add_payment_info",
    eventModel: paymentData
  });
};

export const pushPurchase = (purchaseData) => {
  pushToDataLayer({
    event: 'purchase',
    ecommerce: purchaseData
  });
};

export const pushPaymentFailure = (failureData) => {
  pushToDataLayer({
    event: 'Payment failure',
    ecommerce: failureData
  });
};

export const pushRemoveFromCart = (data) => {
  pushToDataLayer({
    event: "removeFromCart",
    cart: data
  });
};

export const pushRemoveFromWishlist = (data) => {
  pushToDataLayer({
    event: "removeFromWishlist",
    products: data
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