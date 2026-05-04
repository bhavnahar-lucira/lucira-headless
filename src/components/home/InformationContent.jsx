"use client";

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { informationContentData } from '@/data/informationContent';

const InformationContent = () => {
  const { settings, blocks, block_order } = informationContentData;

  // Filter blocks by type
  const storeLocations = block_order
    .map(id => blocks[id])
    .filter(block => block && block.type === 'store_location');

  const contentBlocks = block_order
    .map(id => blocks[id])
    .filter(block => block && (block.type === 'richtext' || block.type === 'heading'));

  return (
    <section className="information-content-section bg-white py-2 lg:pt-8 lg:pb-4 border-t border-zinc-100">
      <div className="container-main">
        {/* Stores Section */}
        {storeLocations.length > 0 && (
          <div className="address-locations-footer mb-16">
            <h3 className="text-[20px] lg:text-[24px] font-bold font-abhaya text-zinc-900 mb-8 pb-4 border-b border-zinc-100 tracking-tight">
              {settings.stores_heading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-x-0">
              {storeLocations.map((block, index) => (
                <div
                  key={index}
                  className={`store-location-item lg:px-8 ${index % 4 !== 3 && index !== storeLocations.length - 1
                    ? 'lg:border-r lg:border-zinc-100'
                    : ''
                    } ${index % 4 === 0 ? 'lg:pl-0' : ''}`}
                >
                  <h4 className="text-[14px] lg:text-[16px] font-bold font-figtree text-zinc-800 mb-5 leading-tight tracking-tight uppercase">
                    {block.settings.store_name}
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-[12px] lg:text-[14px] text-zinc-600">
                      <Phone size={14} className="mt-1 shrink-0 text-[#5A413F] opacity-80" />
                      <a href={`tel:${block.settings.phone}`} className="hover:text-[#5A413F] transition-colors leading-normal font-medium">
                        {block.settings.phone}
                      </a>
                    </li>
                    <li className="flex items-start gap-3 text-[12px] lg:text-[14px] text-zinc-600">
                      <Mail size={14} className="mt-1 shrink-0 text-[#5A413F] opacity-80" />
                      <a href={`mailto:${block.settings.email}`} className="hover:text-[#5A413F] transition-colors leading-normal font-medium break-all">
                        {block.settings.email}
                      </a>
                    </li>
                    <li className="flex items-start gap-3 text-[12px] lg:text-[14px] text-zinc-600 font-medium">
                      <MapPin size={14} className="mt-1 shrink-0 text-[#5A413F] opacity-80" />
                      {block.settings.map_url ? (
                        <a
                          href={block.settings.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#5A413F] transition-colors leading-relaxed"
                        >
                          {block.settings.address}
                        </a>
                      ) : (
                        <span className="leading-relaxed">{block.settings.address}</span>
                      )}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rich Text Content Wrapper */}
        <div className="information-content-wrapper footer-pages border-t border-zinc-100 pt-10 !text-[12px] lg:!text-[14px]">
          {contentBlocks.map((block, index) => (
            <div key={index} className="mb-2 last:mb-0">
              {block.type === 'heading' ? (
                <h2 className="text-[16px] lg:text-[20px] font-bold text-zinc-900 mt-9 mb-4 pb-2 border-b border-zinc-200 font-abhaya tracking-tight">
                  {block.settings.text}
                </h2>
              ) : (
                <div
                  className="richtext-content [&_p]:!text-[12px] lg:[&_p]:!text-[14px] [&_h3]:!text-[14px] lg:[&_h3]:!text-[16px]"
                  dangerouslySetInnerHTML={{ __html: block.settings.content }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InformationContent;
