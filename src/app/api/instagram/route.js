import { NextResponse } from "next/server";

const INSTA_DATA = [
  { 
    id: "1", 
    image: "/images/blogs/1.jpg", 
    isVideo: false,
    caption: "The perfect stack doesn't exi... oh wait. ✨ Our signature marquise and round cut rings are made for each other. #LuciraJewelry"
  },
  { 
    id: "2", 
    image: "/images/blogs/2.jpg", 
    isVideo: true,
    videoUrl: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f8b91e03c4740e6b497e9fd12cfb809/6f8b91e03c4740e6b497e9fd12cfb809.HD-1080p-7.2Mbps-26162134.mp4",
    caption: "POV: You just found your forever ring. 💍 Watch the sparkle in every light. #EngagementRing #DiamondRing"
  },
  { 
    id: "3", 
    image: "/images/blogs/3.jpg", 
    isVideo: false,
    caption: "Elegance in every detail. Handcrafted with love, for your most precious moments. 💖 #HandcraftedJewelry #Lucira"
  },
  { 
    id: "4", 
    image: "/images/blogs/4.jpg", 
    isVideo: true,
    videoUrl: "https://www.lucirajewelry.com/cdn/shop/videos/c/vp/6f8b91e03c4740e6b497e9fd12cfb809/6f8b91e03c4740e6b497e9fd12cfb809.HD-1080p-7.2Mbps-26162134.mp4",
    caption: "Golden hour glow with our new collection. ✨ Which one is your favorite? #GoldJewelry #NewCollection"
  },
  { 
    id: "5", 
    image: "/images/love/1.jpg", 
    isVideo: false,
    caption: "A promise that lasts a lifetime. 💍 Explore our solitaire collection today. #DiamondSolitaire #LuciraLove"
  },
  { 
    id: "6", 
    image: "/images/love/2.jpg", 
    isVideo: false,
    caption: "Modern statements for the contemporary woman. 💎 #FineJewelry #ModernLuxury"
  },
];

export async function GET() {
  // In a real scenario, you would fetch from Instagram API here
  return NextResponse.json(INSTA_DATA);
}
