"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, X, ChevronRight } from "lucide-react";
import { Sheet } from "react-modal-sheet";
import { SizeGuideMobile } from "./SizeGuideMobile";

export function ProductCustomizerMobile({
  activeColor,
  activeKarat,
  selectedSize,
  handleGoldSelection,
  handleSizeSelection,
  availableSizes,
  product,
  isColorInStock,
  isSizeInStock,
  nearestStore,
  availableStores,
  availableStoreCount,
  deliveryInfo,
  getStoreDisplayName,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getGoldColor = (metal) => {
    if (metal.includes("White")) return "linear-gradient(143.06deg, #dfdfdf 29.61%, #f3f3f3 48.83%, #dfdfdf 66.43%)";
    if (metal.includes("Rose")) return "linear-gradient(154.36deg, #f2b5b5 10.36%, #f8dbdb 68.09%)";
    return "linear-gradient(147.45deg, #c59922 17.98%, #ead59e 48.14%, #c59922 83.84%)";
  };

  const combinations = [];
  product.variants?.forEach((v) => {
    const parts = v.color.split(" ");
    if (parts.length >= 3) {
      const karat = parts[0];
      const metal = parts.slice(1).join(" ");
      if (!combinations.find((c) => c.karat === karat && c.metal === metal)) {
        combinations.push({ karat, metal });
      }
    }
  });

  const metalOrder = ["White Gold", "Yellow Gold", "Rose Gold"];
  combinations.sort((a, b) => {
    if (a.karat !== b.karat) return a.karat.localeCompare(b.karat);
    return metalOrder.indexOf(a.metal) - metalOrder.indexOf(b.metal);
  });

  return (
    <div className="space-y-4 mt-4 lg:hidden">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
          SIZE & CUSTOMIZATION
        </h3>
        <SizeGuideMobile nearestStore={nearestStore} availableStores={availableStores} availableStoreCount={availableStoreCount} deliveryInfo={deliveryInfo} getStoreDisplayName={getStoreDisplayName}>
          <button className="text-sm font-medium text-[#A67C7C] hover:cursor-pointer">
            Size Guide
          </button>
        </SizeGuideMobile>
      </div>

      <div className="border border-gray-200 rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full border border-gray-100 shadow-inner`}
              style={{ background: getGoldColor(activeColor) }}
            ></div>
            <span className="text-sm font-medium text-gray-900">
              {activeKarat} {activeColor}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="text-sm font-medium text-gray-900">
            Size : {selectedSize} IND
          </div>
        </div>

        <button 
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-[#F9F9F9] rounded-xl text-[#A67C7C] font-bold text-sm uppercase tracking-widest"
        >
          CUSTOMIZE
        </button>

        <Sheet 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)}
          detents={[0.9, 0.5]}
        >
          <Sheet.Container>
            <Sheet.Header />
            <Sheet.Content>
              <div className="px-6 pb-8 flex flex-col h-full">
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold">Customize</h2>
                  <button onClick={() => setIsOpen(false)} className="p-2">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="mt-6 space-y-8 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {/* Gold Selection */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider">
                      Select Gold Color & Karat:{" "}
                      <span className="text-gray-400 normal-case font-medium ml-1">
                        {activeKarat} {activeColor}
                      </span>
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {combinations.map(({ karat, metal }) => (
                        <div
                          key={`${karat}-${metal}`}
                          onClick={() => handleGoldSelection(metal, karat)}
                          className={`border rounded-xl py-3 px-2 cursor-pointer relative flex flex-col items-center gap-3 transition-all ${
                            activeColor === metal && activeKarat === karat
                              ? "border-black bg-white ring-1 ring-black shadow-sm"
                              : "border-gray-200 bg-[#F9F9F9]"
                          }`}
                        >
                          {isColorInStock(metal, karat) && (
                            <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#2DB36F]"></span>
                          )}
                          <div
                            className={`w-7 h-7 rounded-full border border-gray-100 shadow-inner`}
                            style={{ background: getGoldColor(metal) }}
                          ></div>
                          <div className="text-[11px] text-center text-black leading-tight uppercase font-bold flex flex-col gap-0.5">
                            <span>{karat}</span>
                            <span>{metal.replace(" Gold", "")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ring Size */}
                  {availableSizes.length > 0 &&
                    availableSizes[0] !== null &&
                    availableSizes[0] !== undefined && (
                      <div className="space-y-4 pb-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold uppercase tracking-wider">
                            Select Ring Size:{" "}
                            <span className="text-gray-400 normal-case font-medium ml-1">
                              {selectedSize} IND
                            </span>
                          </h4>
                        </div>

                        <div className="grid grid-cols-5 gap-3">                          {availableSizes.map((sizeStr) => {
                            const inStock = isSizeInStock(sizeStr);
                            return (
                              <button
                                key={`size-${sizeStr}`}
                                onClick={() => handleSizeSelection(sizeStr)}
                                className={`relative border rounded-lg h-12 flex items-center justify-center text-sm transition-all ${
                                  sizeStr === selectedSize
                                    ? "border-black bg-white ring-1 ring-black font-bold"
                                    : "border-gray-200 bg-[#F9F9F9] font-medium"
                                }`}
                              >
                                {sizeStr}
                                {inStock && (
                                  <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-[#2DB36F] rounded-full"></span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
                
                <div className="pt-6 pb-2">
                   <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-primary text-white rounded-full font-bold text-sm uppercase tracking-widest"
                  >
                    DONE
                  </button>
                </div>
              </div>
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onClick={() => setIsOpen(false)} />
        </Sheet>
      </div>
    </div>
  );
}
