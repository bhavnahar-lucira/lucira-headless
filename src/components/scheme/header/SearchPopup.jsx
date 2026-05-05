'use client';
import React, { useEffect, useState } from 'react';
import { X, SearchIcon, Search  } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import useWindowSize from '@/hooks/useWindowSize';
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio"  


    //local storage
    const RECENT_KEY = "lucira_recent_searches";
    const getRecentSearches = () => {
    if (typeof window === "undefined") return [];
        return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    };
    const saveRecentSearch = (query) => {
        if (!query || query.length < 2) return;

        let recent = getRecentSearches();
        // Remove duplicate
        recent = recent.filter(item => item.toLowerCase() !== query.toLowerCase());
        // Add to top
        recent.unshift(query);
        // Limit to 6
        recent = recent.slice(0, 6);
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    };

const SearchPopup = ({ toggleSearch }) => {
    const [recentSearches, setRecentSearches] = useState([]);
    const [isClosing, setIsClosing] = useState(false);
    const { width } = useWindowSize();
   //animation
    const [isFocused, setIsFocused] = useState(false);
    //search
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query);

    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && suggestions.length > 0) {
            setQuery(suggestions[0]);
        }
    };
    const highlight = (text, q) => {
        const regex = new RegExp(`(${q})`, "gi");
        return text.replace(regex, "<strong>$1</strong>");
    };

    useEffect(() => {
        if (!debouncedQuery) return;

        const fetchSearch = async () => {
            setLoading(true);
            const res = await fetch(`/api/scheme/shopify/search?q=${debouncedQuery}`);
            const data = await res.json();

            setSuggestions(data.suggestions || []);
            setResults(data.products || []);

            if (data.products?.length > 0) {
            saveRecentSearch(debouncedQuery);
            setRecentSearches(getRecentSearches());
            }

            setLoading(false);
        };

        fetchSearch();
        }, [debouncedQuery]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      toggleSearch(); 
      setIsClosing(false);
    }, 300);
  };
 
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "ArrowDown") {/* highlight next */}
            if (e.key === "Enter") {/* go to product */}
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);
 
   const showLabel = !isFocused && query === ""

  return (
    <div
      className={`search-popup bg-white top right left-0 color-default fixed w-full z-99 inset-y-0 h-full open transform transition-transform duration-300 ease-in-out
      ${width > 1100 
        ? (isClosing ? 'animate-slideUp' : 'animate-slideDown') 
        : (isClosing ? 'animate-slideLeft' : 'animate-slideRight')
      }`}
    >
      <div className="search-type-popup px-4 py-10 h-full overflow-auto lg:px-15">
        <div className="container mx-auto">
            <div className="max-w-4xl mx-auto ">
                <h2 className="mb-4 text-center text-2xl font-noto">Search Product</h2>
                <div className="relative">
                    <Input type="search" placeholder="" className="h-12 md:h-14 w-full rounded-full border border-gray-300 px-4 flex items-center"
                        autoFocus   
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 bg-primary rounded-full flex justify-center items-center cursor-pointer hover:bg-primary/90">
                        <SearchIcon size={20} color="white" />  
                    </div>
                    <div className="closeMenu fixed top-4 right-4 p-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300" onClick={handleClose}>
                      <X size={20} />
                    </div>
                    {/* Animated Placeholder */}
                    {showLabel && (
                    <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 h-5 overflow-hidden text-sm text-gray-400 flex">
                        Search for
                        <span className="ml-1 flex flex-col animate-slide" id="search-label">
                        <span>Wedding Rings</span>
                        <span>Engagement Rings</span>
                        <span>Gift for Mother</span>
                        <span>Gift for Wife</span>
                        <span>Birthday Gifts</span>
                        </span>
                    </div>
                    )}
                </div>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              <div className="trending-search mt-6 lg:mt-10">                
                  <div className="mb-4 text-black">Trending Search</div>
                  <Button variant={"outline"} className="mr-2 mb-2 rounded-full text-gray-500 cursor-pointer">Rings</Button>
                  <Button variant={"outline"} className="mr-2 mb-2 rounded-full text-gray-500 cursor-pointer">Engagement Rings Under 50k</Button>
                  <Button variant={"outline"} className="mr-2 mb-2 rounded-full text-gray-500 cursor-pointer">Necklaces</Button>
                  <Button variant={"outline"} className="mr-2 mb-2 rounded-full text-gray-500 cursor-pointer">Earrings</Button>
                  <Button variant={"outline"} className="mr-2 mb-2 rounded-full text-gray-500 cursor-pointer">Pendants</Button>
              </div>

               {loading && 
                    <div className="trending-search mt-6 lg:mt-10">
                        <div className="mb-4 text-black">Search Result</div>
                        <p className="text-sm text-gray-500"> Searching...</p>
                    </div>
                }
                {!loading && results.length === 0 && query && (
                    <div className="trending-search mt-6 lg:mt-10">
                        <div className="mb-4 text-black">Search Result</div>
                        <p className="text-sm text-gray-500">No results found</p>
                    </div>
                )}
                {suggestions.length > 0 && (
                    <div className="mt-6">
                        <p className="text-sm text-black mb-3">
                            Suggestions
                        </p>

                        <ul className="divide-y rounded-lg bg-white flex justify-start flex-wrap gap-4">
                        {suggestions.map((s, index) => (
                            <li
                            key={index}
                            onClick={() => setQuery(s)}
                            className="px-4 py-3 flex items-center gap-2 cursor-pointer border rounded-2xl hover:bg-accent"
                            >
                                <Search size={16} className="text-gray-400" />
                                <span
                                    className="text-sm"
                                    dangerouslySetInnerHTML={{
                                    __html: highlight(s, query),
                                    }}
                                />
                            </li>
                        ))}
                        </ul>
                    </div>
                )}
                {
                    results.length>0 &&                
                    <div className="trending-search mt-6 lg:mt-10">                
                        <div className="mb-4 text-black">Search Result</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">                       
                            {results.map((product, index) => ( 
                                <div className="rounded-xl border bg-white p-2 hover:shadow-md transition hover:cursor-pointer" key={index} onClick={() => window.location.href = product.url}>
                                    {/* Image */}
                                        {product.image && (
                                    <AspectRatio ratio={1/1} className="relative rounded-xl flex items-center justify-center bg-[#fafafa]">
                                        <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        sizes="320"
                                        className="h-full w-full rounded-lg object-cover mix-blend-multiply transition-transform duration-1000 hover:scale-90"
                                        />
                                    </AspectRatio>
                                    )}

                                    {/* Content */}
                                    <div className="mt-2 space-y-2 p-4">
                                        <h3 className="text-sm font-medium leading-snug line-clamp-1">
                                        {product.title.replaceAll("-", " ")}
                                        </h3>

                                        {/* Static demo pricing (replace with variants later) */}
                                        <div className="flex justify-between gap-4 items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold">₹{product.price}</span>
                                            {
                                            product.compare_at_price > 0 && 
                                            <span className="text-sm text-gray-400 line-through">
                                                ₹{product.compare_at_price}
                                            </span>
                                            }            
                                        </div>
                                        </div>
                                    </div>
                                </div>  
                            ))} 
                        </div>
                    </div>
                }                
               <div className="trending-search mt-6 lg:mt-10">
                <div className="mb-4 text-black">
                    {recentSearches.length > 0 ? "Recently Searched" : "Popular Searches"}
                </div>
                <div className="flex flex-wrap gap-3">
                    {(recentSearches.length > 0
                    ? recentSearches
                    : ["Rings", "Earrings", "Necklaces", "Pendants"]
                    ).map((item, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        className="rounded-full text-gray-600 cursor-pointer"
                        onClick={() => setQuery(item)}
                    >
                        {item}
                    </Button>
                    ))}
                </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;