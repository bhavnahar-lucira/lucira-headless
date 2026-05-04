"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import Image from "next/image";
import { pushPromoClick, getNumericId } from "@/lib/gtm";

export default function PriceSavingsDetails({ priceData, product, activeVariant }) {
  const priceBreakup = priceData?.price_breakup;
  if (!priceBreakup) return null;

  const handleTabChange = (value) => {
    if (!product || !activeVariant) return;

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : "";
    const productImageUrl = activeVariant?.image || product.images?.[0]?.url || "";
    
    // Calculate values safely from raw_breakup
    const rawBreakup = priceData.raw_breakup || {};
    
    const savingsAmount = value === 'comparison' ? (parseFloat(String(priceBreakup.comparison?.savings || "0").replace(/[^\d.]/g, '')) || 0) : 0;
    
    const promoData = {
      // Promotion Info
      creative_name: value === 'price' ? 'priceBreakup' : 'yourSavings',
      promo_id: activeVariant.sku || "",
      promo_name: product.title || "",
      promo_position: value === 'comparison' && savingsAmount ? `₹${savingsAmount}` : 'Product Details Section',
      position: '-',

      // Product Info
      product_id: String(getNumericId(product.shopifyId || product.id)),
      product_name: product.title || "",
      sku: activeVariant.sku || "",
      variant_id: String(getNumericId(activeVariant.id || activeVariant.shopifyId)),
      location_id: String(getNumericId(activeVariant.id || activeVariant.shopifyId)),

      // URL & Image
      product_url: `${currentOrigin}/products/${product.handle}`,
      product_image: productImageUrl.startsWith('//') ? 'https:' + productImageUrl : productImageUrl,

      // Pricing
      price: Number(activeVariant.price || 0),
      offer_price: Number(activeVariant.price || 0),

      // Price Breakup Values (Technical Data)
      metal_label: `${activeVariant.metafields?.metal_purity || ""} ${activeVariant.metafields?.metal_color || ""} Gold`,
      gold_rate_per_g: rawBreakup.metal?.rate_per_gram || 0,
      metal_price: rawBreakup.metal?.cost || 0,

      diamond_price_original: rawBreakup.diamond?.original || 0,
      diamond_price_final: rawBreakup.diamond?.final || 0,
      diamond_discount_percent: rawBreakup.diamond?.discount_percent || 0,
      diamond_pcs: rawBreakup.diamond?.pcs || 0,

      making_charges_original: rawBreakup.making_charges?.original || 0,
      making_charges_final: rawBreakup.making_charges?.final || 0,
      making_charges_discount_pct: rawBreakup.making_charges?.discount_percent || 0,

      gst_percent: rawBreakup.gst?.percent || 0,
      gst_amount: rawBreakup.gst?.amount || 0,

      gemstone_price_original: rawBreakup.gemstone?.original || 0,
      gemstone_price_final: rawBreakup.gemstone?.final || 0,
      gemstone_pcs: rawBreakup.gemstone?.pcs || 0,

      grand_total: rawBreakup.total || Number(activeVariant.price || 0),

      // Savings
      savings_amount: savingsAmount,

      // Optional
      email: '',
      phone: ''
    };

    pushPromoClick(promoData);
  };

  return (
    <div className="mt-6">
      <h2 className="text-base font-semibold tracking-tight mb-4 uppercase tracking-wider">Price & Savings Details:</h2>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
        <Tabs defaultValue="price" className="w-full" onValueChange={handleTabChange}>
          <TabsList className={`grid ${priceBreakup.comparison ? 'grid-cols-2' : 'grid-cols-1'} bg-gray-100 p-1 rounded-lg mb-6 w-full h-12!`}>
            <TabsTrigger 
              value="price" 
              className="flex items-center justify-center gap-2 text-[13px] font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all h-full hover:cursor-pointer uppercase tracking-tight"
            >
              Price Breakup
            </TabsTrigger>
            {priceBreakup.comparison && (
              <TabsTrigger 
                value="comparison" 
                className="flex items-center justify-center gap-2 text-[13px] font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all h-full hover:cursor-pointer uppercase tracking-tight"
              >
                Comparison
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="price" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {priceBreakup.price?.map((item, index) => (
                <PriceRow 
                  key={index} 
                  label={item.label} 
                  value={item.value} 
                  oldValue={item.oldValue} 
                  discount={item.discount}
                />
              ))}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-base font-bold text-gray-900 uppercase">Grand Total</span>
                <span className="text-lg font-bold text-gray-900">{priceBreakup.grand_total}</span>
              </div>
            </motion.div>
          </TabsContent>

          {priceBreakup.comparison && (
            <TabsContent value="comparison" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-1">Attributes</div>
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center leading-tight">Lucira<br/>Grown</div>
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center leading-tight">Mined<br/>Diamond</div>
                </div>

                <ComparisonRow label="Price" lucira={priceBreakup.comparison?.price?.lucira} mined={priceBreakup.comparison?.price?.mined} isPrice />
                <ComparisonRow label="Carat" lucira={priceBreakup.comparison?.carat} mined={priceBreakup.comparison?.carat} />
                <ComparisonRow label="Clarity" lucira={priceBreakup.comparison?.clarity?.lucira} mined={priceBreakup.comparison?.clarity?.mined} />
                <ComparisonRow label="Color" lucira={priceBreakup.comparison?.color?.lucira} mined={priceBreakup.comparison?.color?.mined} />

                <div className="grid grid-cols-3 gap-4 pt-4 mt-2 bg-[#F0F7F4] -mx-5 px-5 py-4 border-t border-[#D5E6DE]">
                  <div className="text-sm font-bold text-gray-900 uppercase pt-0.5">Total Saving</div>
                  <div className="text-base font-bold text-[#1E7D4E] text-center">{priceBreakup.comparison?.savings}</div>
                  <div className="text-base font-bold text-gray-400 text-center">₹ 0</div>
                </div>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function ComparisonRow({ label, lucira, mined, isPrice }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div className="text-sm font-semibold text-gray-500">{label}</div>
      <div className={`text-sm font-bold text-center ${isPrice ? 'text-gray-900' : 'text-gray-900'}`}>{lucira}</div>
      <div className={`text-sm font-bold text-center ${isPrice ? 'text-gray-900' : 'text-gray-900'}`}>{mined}</div>
    </div>
  );
}

function PriceRow({ label, value, oldValue, isSaving, discount }) {
  return (
    <div className="flex justify-between items-center text-[13px] border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2">
        <span className="text-gray-600 font-medium">{label}</span>
        {discount && (
          <span className="bg-[#E3F5E0] text-[#1E7D4E] text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap uppercase">
            {discount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {oldValue && (
          <span className="text-gray-300 line-through font-bold">{oldValue}</span>
        )}
        <span className={`font-bold ${isSaving ? 'text-[#1E7D4E]' : 'text-gray-900'}`}>{value}</span>
      </div>
    </div>
  );
}
