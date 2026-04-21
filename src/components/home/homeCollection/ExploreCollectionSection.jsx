"use client";

import { useState, useEffect } from "react";
import CollectionSection from "./CollectionSection";
import CollectionSlider from "./CollectionSlider";

const COLLECTION_HANDLE_MAP = {
  "On The Move": "sports-collection",
  "Cotton Candy": "cotton-candy",
  Hexa: "hexa",
  "9KT Collection": "9kt-collection",
};

export default function ExploreCollectionSection() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("On The Move");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollectionProducts() {
      setLoading(true);
      try {
        const handle = COLLECTION_HANDLE_MAP[activeTab] || "sports-collection";
        const res = await fetch(`/api/products/search?handle=${encodeURIComponent(handle)}&limit=10`);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch collection products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCollectionProducts();
  }, [activeTab]);

  return (
    <CollectionSection 
      title="Explore By Collections"
      tabs={Object.keys(COLLECTION_HANDLE_MAP)}
      page="home"
      colCat="shop all collections"
      onTabChange={(tab) => setActiveTab(tab)}
      loading={loading}
    >        
      <CollectionSlider 
        products={products.length > 0 ? products : (loading ? [] : null)} 
        loading={loading}
      />
    </CollectionSection>
  );
}
