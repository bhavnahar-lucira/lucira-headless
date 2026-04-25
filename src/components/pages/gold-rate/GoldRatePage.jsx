"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, ShoppingBag } from "lucide-react";
import FAQSection from "./FAQSection";
import GoldCalculator from "./GoldCalculator";
import InvestmentSection from "./InvestmentSection";
import PriceTable from "./PriceTable";
import InformationContent from "./InformationContent";
import { GOLD_RATE_TEMPLATE } from "@/data/goldRateTemplate";

const stateCityMap = {
  'andaman-and-nicobar-islands': ['Port Blair'],
  'andhra-pradesh': ['Chirala', 'Guntur', 'Hindupur', 'Kagaznagar', 'Kakinada', 'Kurnool', 'Machilipatnam', 'Nandyal', 'Nellore', 'Ongole', 'Proddatur', 'Rajahmundry', 'Tirupati', 'Vishakhapatnam', 'Vizianagaram'],
  'arunachal-pradesh': ['Itanagar'],
  assam: ['Dibrugarh', 'Dispur', 'Guwahati', 'Jorhat', 'Silchar', 'Tezpur'],
  bihar: ['Aurangabad', 'Bhagalpur', 'Gaya', 'Muzaffarpur', 'Patna', 'Purnea'],
  chandigarh: ['Chandigarh'],
  chhattisgarh: ['Bhilai', 'Bilaspur', 'Raipur'],
  'dadra-and-nagar-haveli': ['Silvassa'],
  'daman-and-diu': ['Daman', 'Diu'],
  delhi: ['Delhi', 'New Delhi'],
  goa: ['Panaji'],
  gujarat: ['Ahmedabad', 'Bhavnagar', 'Bhuj', 'Ghandinagar', 'Navsari', 'Porbandar', 'Rajkot', 'Surat', 'Vadodara'],
  haryana: ['Ambala', 'Bhiwani', 'Faridabad', 'Gurugram', 'Hisar', 'Karnal', 'Panchkula', 'Panipat', 'Rohtak', 'Sirsa', 'Sonipat'],
  'himachal-pradesh': ['Shimla'],
  'jammu-and-kashmir': ['Baramula', 'Jammu', 'Saidpur', 'Srinagar'],
  jharkhand: ['Dhanbad', 'Jamshedpur', 'Ranchi', 'Jorapokhar'],
  karnataka: ['Belgaum', 'Bellary', 'Bengaluru', 'Bidar', 'Bijapur', 'Chikka Mandya', 'Davangere', 'Gulbarga', 'Hospet', 'Hubli', 'Kolar', 'Mangalore', 'Mysore', 'Raichur', 'Shimoga'],
  kerala: ['Alappuzha', 'Calicut', 'Kochi', 'Kollam', 'Thiruvananthapuram'],
  lakshadweep: ['Kavaratti'],
  'madhya-pradesh': ['Bhopal', 'Gwalior', 'Indore', 'Jabalpur', 'Ratlam', 'Saugor', 'Ujjain'],
  maharashtra: ['Ahmadnagar', 'Akola', 'Amaravati', 'Aurangabad', 'Bhiwandi', 'Bhusaval', 'Chanda', 'Kalyan', 'Khanapur', 'Kolhapur', 'Latur', 'Malegaon Camp', 'Mumbai', 'Nanded', 'Nasik', 'Parbhani', 'Pune', 'Sangli'],
  manipur: ['Imphal'],
  meghalaya: ['Shillong'],
  mizoram: ['Aizawl'],
  nagaland: ['Kohima'],
  odisha: ['Bhubaneshwar', 'Brahmapur', 'Cuttack', 'Puri', 'Raurkela', 'Samlaipadar', 'Brajrajnagar', 'Talcher'],
  puducherry: ['Puducherry'],
  punjab: ['Abohar', 'Amritsar', 'Haripur', 'Ludhiana', 'Pathankot', 'Patiala'],
  rajasthan: ['Ajmer', 'Alwar', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Jaipur', 'Jodhpur', 'Kota', 'Pali', 'Rampura', 'Sikar', 'Tonk', 'Udaipur'],
  sikkim: ['Gangtok'],
  'tamil-nadu': ['Chennai', 'Coimbatore', 'Cuddalore', 'Dindigul', 'Karur', 'Krishnapuram', 'Kumbakonam', 'Madurai', 'Nagercoil', 'Rajapalaiyam', 'Salem', 'Thanjavur', 'Tiruchchirappalli', 'Tirunelveli', 'Tiruvannamalai', 'Tuticorin', 'Valparai', 'Vellore'],
  telangana: ['Adilabad', 'Hyderabad', 'Karimnagar', 'Khammam', 'Mahabubnagar', 'Nalgonda', 'Nizamabad', 'Ramagundam', 'Warangal'],
  tripura: ['Agartala'],
  'uttar-pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Bakshpur', 'Bamanpuri', 'Bareilly', 'Bharauri', 'Budaun', 'Bulandshahr', 'Firozabad', 'Fyzabad', 'Ghaziabad', 'Gopalpur', 'Hapur', 'Hata', 'Jhansi', 'Lucknow', 'Mathura', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Saharanpur', 'Saidapur', 'Shahbazpur', 'Tharati Etawah', 'Varanasi'],
  uttarakhand: ['DehraDun'],
  'west-bengal': ['Alipurduar', 'Asansol', 'Barddhaman', 'Bhatpara', 'Haldia', 'Haora', 'Kolkata', 'Krishnanagar', 'Shiliguri'],
};

export default function GoldRatePage({ page }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedState, setSelectedState] = useState(page?.state?.value?.toLowerCase().replace(/\s+/g, '-') || 'maharashtra');
  const [selectedCity, setSelectedCity] = useState(page?.city?.value?.toLowerCase().replace(/\s+/g, '-') || 'mumbai');
  const [currentDate, setCurrentDate] = useState("");
  const [rates, setRates] = useState(null);

  const cityName = page?.city?.value || "Mumbai";
  const stateName = page?.state?.value || "Maharashtra";

  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const getDaySuffix = (d) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    const formattedDate = `${day}${getDaySuffix(day)} ${today.toLocaleString('en-IN', { month: 'short' })}, ${today.getFullYear()}`;
    setCurrentDate(formattedDate);

    async function fetchRates() {
        try {
            const res = await fetch("/api/gold-rates");
            if (res.ok) {
                const data = await res.json();
                setRates(data);
            }
        } catch (err) {
            console.error("Failed to fetch rates:", err);
        }
    }
    fetchRates();
  }, []);

  const goldWidgetSettings = useMemo(() => {
    const base = GOLD_RATE_TEMPLATE.sections.gold_calculate_widget_HCyUVc.settings;
    if (!rates) return base;
    return {
        ...base,
        rate_today: `₹${(Number(rates.gold_price_24k) || 154002).toLocaleString('en-IN')}`,
        rate_yesterday: `₹${(Number(rates.gold_price_24k_yesterday) || 155053).toLocaleString('en-IN')}`,
        rate_avg: `₹${(Number(rates.gold_price_22k) || 141682).toLocaleString('en-IN')}`,
    };
  }, [rates]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    if (stateCityMap[newState] && stateCityMap[newState].length > 0) {
        setSelectedCity(stateCityMap[newState][0].toLowerCase().replace(/\s+/g, '-'));
    }
  };

  const handleNavigate = () => {
    window.location.href = `/pages/${selectedCity}-gold-rate-today`;
  };

  const todayRateNum = parseInt(goldWidgetSettings.rate_today.replace(/[₹,]/g, ''));
  const yesterdayRateNum = parseInt(goldWidgetSettings.rate_yesterday.replace(/[₹,]/g, ''));
  const diff = todayRateNum - yesterdayRateNum;
  const THRESHOLD = 500;

  return (
    <div className="gold-rate-page bg-white min-h-screen font-figtree overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[650px] md:h-screen w-full flex items-center justify-center overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://www.lucirajewelry.com/cdn/shop/files/baneer-gold.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/40 z-[1]" />
        
        <div className="container-main relative z-10 w-full px-4 flex flex-col items-center">
            <div className="max-w-2xl w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 gold-cta-block">
                    <h1 className="text-white text-[18px] md:text-[28px] font-medium tracking-tight font-abhaya uppercase leading-tight">
                        Todays Gold rate in {cityName}
                    </h1>
                    <button 
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="text-white text-[14px] md:text-[18px] font-medium underline underline-offset-4 tracking-[0.05em] font-figtree opacity-90 hover:opacity-100 transition-opacity text-left md:text-right"
                    >
                        {isFlipped ? "View Todays Gold Rate" : "Is Gold A Wise Investment?"}
                    </button>
                </div>

                <div className="perspective-1200 w-full">
                    <div className={`relative transition-transform duration-700 preserve-3d h-[240px] md:h-[200px] ${isFlipped ? 'rotate-x-180' : ''}`}>
                        {/* Front Face */}
                        <div className="absolute inset-0 backface-hidden bg-white rounded-2xl p-6 md:p-8 shadow-2xl grid grid-cols-2 gap-8 items-center">
                            <div className="space-y-2">
                                <p className="text-[12px] md:text-[14px] text-zinc-400 uppercase tracking-widest font-bold font-figtree">Gold Rate: 24 KT</p>
                                <p className="text-[24px] md:text-[36px] font-bold text-zinc-900 leading-none font-figtree">
                                    <span className="text-[18px] md:text-[24px] mr-1 font-medium">₹</span>{goldWidgetSettings.rate_today.replace('₹', '')}
                                    <span className="text-[10px] md:text-[12px] font-normal text-zinc-400 ml-1 tracking-widest uppercase">/ 10 gm</span>
                                </p>
                            </div>
                            <div className="space-y-2 border-l border-zinc-100 pl-8 md:pl-12">
                                <p className="text-[12px] md:text-[14px] text-zinc-400 uppercase tracking-widest font-bold font-figtree">Gold Rate: 22 KT</p>
                                <p className="text-[24px] md:text-[36px] font-bold text-zinc-900 leading-none font-figtree">
                                    <span className="text-[18px] md:text-[24px] mr-1 font-medium">₹</span>{goldWidgetSettings.rate_avg.replace('₹', '')}
                                    <span className="text-[10px] md:text-[12px] font-normal text-zinc-400 ml-1 tracking-widest uppercase">/ 10 gm</span>
                                </p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-zinc-50">
                                <p className="text-[11px] md:text-[13px] text-zinc-400 uppercase tracking-widest font-bold font-figtree flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Last Updated - {currentDate}, 10:00 AM
                                </p>
                            </div>
                        </div>

                        {/* Back Face */}
                        <div className="absolute inset-0 backface-hidden bg-white rounded-2xl rotate-x-180 gold-flip-back">
                            <div className="gold-flip-back__image-col">
                                {goldWidgetSettings.flip_founder_image && (
                                    <img 
                                        src={goldWidgetSettings.flip_founder_image.startsWith('shopify://') 
                                            ? goldWidgetSettings.flip_founder_image.replace('shopify://shop_images/', 'https://www.lucirajewelry.com/cdn/shop/files/')
                                            : goldWidgetSettings.flip_founder_image
                                        } 
                                        alt={goldWidgetSettings.flip_founder_name}
                                        className="gold-flip-back__img"
                                    />
                                )}
                                <p className="gold-flip-back__name">{goldWidgetSettings.flip_founder_name}</p>
                                <p className="gold-flip-back__designation">{goldWidgetSettings.flip_founder_designation}</p>
                            </div>
                            <div className="gold-flip-back__content-col">
                                <h3 className="gold-flip-back__title">{goldWidgetSettings.flip_card_title}</h3>
                                <p className="gold-flip-back__desc">{goldWidgetSettings.flip_card_description}</p>
                                {goldWidgetSettings.flip_card_link_label && (
                                    <Link 
                                        href={goldWidgetSettings.flip_card_link_url || "#"}
                                        className="gold-flip-back__link"
                                    >
                                        {goldWidgetSettings.flip_card_link_label}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Selector */}
                <div className="mt-10 flex flex-col gap-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="absolute -top-2 left-4 px-2 bg-transparent text-[10px] text-white uppercase tracking-[0.2em] z-10 font-bold font-figtree">State</label>
                            <select 
                                value={selectedState}
                                onChange={handleStateChange}
                                className="w-full h-14 bg-white/10 backdrop-blur-md border-2 border-white/50 rounded-xl px-4 text-white font-bold uppercase appearance-none focus:outline-none focus:border-white transition-all cursor-pointer font-figtree"
                            >
                                {Object.keys(stateCityMap).map(state => (
                                    <option key={state} value={state} className="text-zinc-900">{state.replace(/-/g, ' ')}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={20} />
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2 left-4 px-2 bg-transparent text-[10px] text-white uppercase tracking-[0.2em] z-10 font-bold font-figtree">City</label>
                            <select 
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full h-14 bg-white/10 backdrop-blur-md border-2 border-white/50 rounded-xl px-4 text-white font-bold uppercase appearance-none focus:outline-none focus:border-white transition-all cursor-pointer font-figtree"
                            >
                                {(stateCityMap[selectedState] || []).map(city => (
                                    <option key={city} value={city.toLowerCase().replace(/\s+/g, '-')} className="text-zinc-900">{city}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={20} />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                        <button onClick={handleNavigate} className="flex-1 h-14 bg-white text-zinc-900 font-bold text-[14px] md:text-[16px] uppercase rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all font-figtree">
                            Check Gold Rate <ArrowRight size={18} className="text-primary" />
                        </button>
                        <Link href="/" className="flex-1 h-14 bg-primary text-white font-bold text-[14px] md:text-[16px] uppercase rounded-xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all font-figtree">
                            <ShoppingBag size={18} /> Explore Lucira
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Calculator Section */}
      <GoldCalculator cityName={cityName} baseRate={todayRateNum} />

      {/* Loop through all sections from template JSON in exact order */}
      <div className="sections-wrapper">
          {GOLD_RATE_TEMPLATE.order.map((sectionId) => {
              const section = GOLD_RATE_TEMPLATE.sections[sectionId];
              if (!section) return null;

              switch (section.type) {
                  case 'gold-calculate-widget':
                      return (
                        <InvestmentSection 
                            key={sectionId} 
                            cityName={cityName} 
                            settings={section.settings} 
                        />
                      );
                  case 'information-content-info':
                      return (
                        <InformationContent 
                            key={sectionId} 
                            cityName={cityName} 
                            stateName={stateName} 
                            sectionData={section} 
                        />
                      );
                  case 'faq-section':
                      return (
                        <FAQSection 
                            key={sectionId} 
                            cityName={cityName} 
                            stateName={stateName} 
                            todayRate={todayRateNum}
                            sectionData={section}
                        />
                      );
                  default:
                      return null;
              }
          })}
      </div>

      <PriceTable baseRate={todayRateNum} />

      {/* Logic for Stable/Rise/Fall Info */}
      <section className="py-20 md:py-32 bg-zinc-50 border-t border-zinc-100">
        <div className="container-main px-4">
            <h2 className="text-[18px] md:text-[28px] font-medium text-zinc-900 mb-12 uppercase tracking-tight font-abhaya text-center">
                Gold Rate Today in {cityName} – {currentDate}
            </h2>
            
            <div className="max-w-4xl mx-auto prose prose-zinc prose-lg prose-p:text-[14px] md:prose-p:text-[18px] prose-p:font-figtree prose-headings:font-abhaya prose-headings:uppercase">
                {diff > THRESHOLD && (
                    <div className="mb-12 p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
                        <h3 className="text-[18px] md:text-[24px] font-bold mb-6 text-zinc-900">Gold Rate Rises</h3>
                        <p className="text-zinc-600 leading-relaxed">
                        In {cityName} on {currentDate}, 24-carat gold is priced at ₹{(todayRateNum).toLocaleString('en-IN')} per 10 grams, 
                        while 22-carat gold stands at ₹{Math.round(todayRateNum * (22/24)).toLocaleString('en-IN')} per 10 grams.
                        </p>
                    </div>
                )}
                {diff < -THRESHOLD && (
                    <div className="mb-12 p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
                        <h3 className="text-[18px] md:text-[24px] font-bold mb-6 text-zinc-900">Gold Rate Falls</h3>
                        <p className="text-zinc-600 leading-relaxed">
                        In {cityName} on {currentDate}, 24-carat gold is available at ₹{(todayRateNum).toLocaleString('en-IN')} per 10 grams, 
                        with 22-carat gold priced at ₹{Math.round(todayRateNum * (22/24)).toLocaleString('en-IN')} per 10 grams.
                        </p>
                    </div>
                )}
                {(diff <= THRESHOLD && diff >= -THRESHOLD) && (
                    <div className="mb-12 p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
                        <h3 className="text-[18px] md:text-[24px] font-bold mb-6 text-zinc-900">Gold Rate Remains Stable</h3>
                        <p className="text-zinc-600 leading-relaxed">
                        In {cityName} on {currentDate}, gold prices remain steady with 24-carat gold at ₹{(todayRateNum).toLocaleString('en-IN')} per 10 grams 
                        and 22-carat gold at ₹{Math.round(todayRateNum * (22/24)).toLocaleString('en-IN')} per 10 grams.
                        </p>
                    </div>
                )}

                {page.body && (
                    <div 
                        className="mt-16 footer-pages pt-16 border-t border-zinc-100 prose-headings:text-[18px] md:prose-headings:text-[28px] prose-p:text-[14px] md:prose-p:text-[18px]"
                        dangerouslySetInnerHTML={{ __html: page.body.replaceAll('[current_date]', currentDate) }}
                    />
                )}
            </div>
        </div>
      </section>

      <style jsx>{`
        .perspective-1200 { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-x-180 { transform: rotateX(180deg); }
        .font-abhaya { font-family: var(--font-abhaya), serif; }
        .font-figtree { font-family: var(--font-figtree), sans-serif; }
        
        .gold-flip-back {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 32px;
          gap: 32px;
          box-sizing: border-box;
          background: #fff;
          box-shadow: 0 0 10px rgba(0,0,0,.15);
        }

        .gold-flip-back__image-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex-shrink: 0;
        }

        .gold-flip-back__img {
          width: 100px;
          height: 108px;
          object-fit: cover;
          border-radius: 8px;
          display: block;
        }

        .gold-flip-back__name {
          font-family: var(--font-figtree);
          font-weight: 600;
          color: #1a1a1a;
          margin: 8px 0 2px 0;
          font-size: 14px;
          text-transform: uppercase;
        }

        .gold-flip-back__designation {
          font-family: var(--font-figtree);
          font-size: 10px;
          color: #666;
          margin: 0;
          text-transform: uppercase;
          font-weight: 500;
        }

        .gold-flip-back__content-col {
          flex: 1;
          text-align: left;
        }

        .gold-flip-back__title {
          font-family: var(--font-abhaya);
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .gold-flip-back__desc {
          font-family: var(--font-figtree);
          font-size: 14px;
          color: #444;
          line-height: 1.5;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .gold-flip-back__link {
          font-family: var(--font-figtree);
          font-size: 14px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 4px;
          text-transform: uppercase;
        }

        @media (max-width: 767px) {
          .gold-flip-back {
            padding: 16px;
            gap: 16px;
          }
          .gold-flip-back__img {
            width: 70px;
            height: 75px;
          }
          .gold-flip-back__title {
            font-size: 16px;
          }
          .gold-flip-back__desc {
            font-size: 12px;
            -webkit-line-clamp: 3;
          }
          .gold-flip-back__name {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
