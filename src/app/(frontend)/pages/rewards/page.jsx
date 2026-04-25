'use client'
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { setReferralLink, setReferralLoading, setReferralError } from "@/redux/features/user/userSlice";
import { toast } from "react-toastify";
import FAQ from "@/components/common/FAQ";

export default function RewardsPage() {
    const howItWorks = [
        {
            title: "Step 1 : Sign up",
            img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/account_circle_40ad6df8-71df-443c-adf0-603a8f1796d5.svg?v=1750683483",
            desc: "Sign up for Lucira Rewards in seconds and get 500 coins instantly,no hidden steps. Use your coins toward your first purchase and start saving right away!",
        },
        {
            title: "Step 2 : Earn Lucira coins",
            img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/gift.svg?v=1750683771",
            desc: "Earn 5% back in Lucira Coins every time you shop with us. Plus, enjoy exclusive bonus rewards during special promotions and events.",
        },
        {
            title: "Step 3 : Redeem",
            img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Redeem.svg?v=1750683772",
            desc: "Apply your Lucira Coins at checkout for instant savings. Whether it’s a new ring or your favorite bracelet, enjoy more sparkle for less.",
        },
    ]

    const waysToEarn = [
        {
            img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22226.jpg?v=1750848230",
            title: "Signup Bonus",
            description: "Join the Lucira Rewards program and get rewarded instantly, receive bonus Lucira Coins just for creating your account."
        },
        {
            img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22226_1.jpg?v=1750848231",
            title: "Product Purchase",
            description: "Earn Lucira Coins every time you shop. The more you treat yourself, the more rewards you collect with each order."
        },
        {
            img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22226_2.jpg?v=1750848231",
            title: "Write a Review",
            description: "Your words can guide others. Share a review of your recent Lucira purchase and enjoy exclusive rewards in the form of Lucira Coins."
        },
        {
            img: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Rectangle_22226_3.jpg?v=1750848231",
            title: "Refer & Earn",
            description: "Love Lucira? Invite your friends to experience the same. When they shop using your referral link, both of you earn Lucira Coins."
        },
    ]

    const faqData = [
        {
        question: "What is Lucira Rewards?",
        answer:
            "Lucira Rewards is our loyalty program designed to thank you for shopping with us. You earn Lucira Coins with every purchase, review, referral, and more redeem them for savings on future orders.",
        },
        {
        question: "How do I join Lucira Rewards?",
        answer:
            "It’s easy! Just sign up for a Lucira account and you’ll automatically be enrolled in our rewards program,no extra steps required.",
        },
        {
        question: "How do I earn Lucira Coins",
        answer:
            "You can earn Lucira Coins in multiple ways: 1. By signing up 2. Making purchases 3. Referring friends",
        },
        {
        question: "How do I redeem my Lucira Coins?",
        answer:
            "At checkout, you’ll see the option to apply your available Lucira Coins to your order. Use them to get discounts and enjoy more sparkle for less.",
        },
        {
        question: "Is there a limit to how many Lucira Coins I can earn?",
        answer:
            "There’s no cap on how many coins you can collect. The more you shop, refer, and engage, the more you earn!",
        },
        {
        question: "How do referrals work?",
        answer:
            "Share your unique referral link with friends. When they make their first purchase using your link, both of you will receive Lucira Coins!",
        },
        {
        question: "I forgot to log in before placing my order. Can I still get Lucira Coins?",
        answer:
            "Yes! Just contact our support team with your order details, and we’ll manually credit your Lucira Coins.",
        },
        {
        question: "Where can I check my Lucira Coins balance?",
        answer:
            "Log in to your Lucira account and go to the 'Rewards' section. Your current balance and earning history will be displayed there.",
        },
    ];

    const dispatch = useDispatch();
    const [open, setOpen] = useState();
    const {user, isAuthenticated} = useSelector((state) => state.user);
    const isLoggedIn = isAuthenticated;
    const referralLink = useSelector((state) => state.user.referralLink);

    const [stats, setStats] = useState({
        total_referrals: 0,
        coins_earned: 0,
        coins_balance: 0,
        history: []
    });
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if ( isLoggedIn && user?.id && !referralLink) {
            fetchReferralLink();
        }
    }, [isLoggedIn, user, referralLink ]);

    useEffect(() => {
        if (isLoggedIn && user?.id) {
            fetchHistory();
        }
    }, [isLoggedIn, user?.id]);

    async function fetchHistory() {
        try {
            setLoadingStats(true);
            const numericId = user.id.toString().split("/").pop();
            const res = await fetch(`/api/customer/referral/history?customer_id=shopify-${numericId}`);
            const data = await res.json();
            if (data.status) {
                setStats({
                    total_referrals: data.total_referrals || 0,
                    coins_earned: data.coins_earned || 0,
                    coins_balance: data.coins_balance || 0,
                    history: data.history || []
                });
            }
        } catch (err) {
            console.error("Referral history fetch failed:", err);
        } finally {
            setLoadingStats(false);
        }
    }

    async function fetchReferralLink() {
        try {
            dispatch(
                setReferralLoading(true)
            );
            const response = await fetch("/api/customer/referral",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":
                        "application/json"
                    },
                        body: JSON.stringify({
                        customerId: user.id.toString()
                    })
                }
            );
            const data = await response.json();
            if(data.referralLink){
                dispatch(
                    setReferralLink(
                    data.referralLink
                    )
                );
            }
        } catch(error){
            dispatch(
                setReferralError(
                "Failed loading referral link"
                )
            );
        } finally {
            dispatch(
                setReferralLoading(false)
            );

        }
    }

    const handleScroll = () => {
        const element = document.getElementById("refer-and-earn");
        if (!element) return;

        const offset = 60;
        const top = element.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
            top,
            behavior: "smooth",
        });
    };

    const handleClick = async () => {
        if(!isLoggedIn) {
            setOpen(true)
            return
        }

        if (!referralLink) {
 toast.info(
  "Referral link still generating"
 );
 return;
}

await navigator.clipboard.writeText(
 referralLink
);

toast.success(
 "Referral link copied!"
);
    }
    
    return (
        <>
            <section
                className="bg-cover bg-right-top bg-no-repeat h-[calc(100dvh-200px)] relative"
                style={{
                backgroundImage:
                    "url(https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Loyalty-Desktop-Banner_1.jpg?v=1750941750)",
                }}
            >
                <div className="absolute top-1/2 left-[10%] -translate-y-1/2">
                    <h1 className="text-white text-3xl md:text-5xl font-medium uppercase mb-10">
                        Lucira Rewards
                    </h1>
                    <p className="text-white text-base md:text-lg max-w-xl mb-16 leading-relaxed">
                        With every Lucira purchase, you're not just adding a piece of
                        jewelry to your collection, you're capturing a moment. Collect
                        Lucira Coins and unlock exclusive rewards, special offers, and
                        little luxuries designed to celebrate your journey.
                    </p>
                    <button
                        onClick={handleScroll}
                        className="bg-white text-[#A68380] px-8 py-4 rounded-full uppercase text-sm font-medium inline-block w-full max-w-xs text-center cursor-pointer"
                    >
                        Join now to Earn
                    </button>
                </div>
            </section>
            <section className="py-16" id="refer-and-earn">
                <div className="w-full mx-auto px-12">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-medium uppercase mb-4">
                        How it Works
                        </h2>
                        <p className="max-w-3xl mx-auto text-gray-800 text-sm">
                        Your sparkle deserves something extra. With Lucira Rewards, every purchase brings you closer to exclusive benefits through our Lucira Coins program.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {howItWorks.map((item, i) => (
                        <div
                            key={i}
                            className="border border-gray-800 rounded-xl p-6 flex flex-col"
                        >
                            <Image src={item.img} className="w-14 h-14 mb-4" width={14} height={14} alt={item.title} />
                            <h3 className="text-lg uppercase font-bold mb-4">{item.title}</h3>
                            <p className="text-sm text-gray-800">{item.desc}</p>
                        </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-16">
                <div className="w-full mx-auto px-12">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-medium uppercase mb-4">
                        Ways to Earn
                        </h2>
                        <p className="max-w-3xl mx-auto text-gray-800 text-sm">
                        Unlock more sparkle with every interaction. From signing up to sharing the love, there are multiple ways to earn Lucira Coins and enjoy exclusive rewards.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {waysToEarn.map((item, i) => (
                        <div key={i} className="relative">
                            <Image width={400} height={400} alt={item.title}
                            src={item.img}
                            className="w-full h-auto rounded-md object-cover"
                            />
                            <h3 className="mt-4 mb-2 uppercase font-medium text-md">
                            {item.title}
                            </h3>
                            <p className="text-sm text-gray-700">
                            {item.description}
                            </p>
                        </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-12 md:py-16">
                <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12">                    
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-3xl font-medium uppercase mb-4">
                            Referral Program
                        </h2>
                        <p className="max-w-3xl mx-auto text-gray-800 text-sm md:text-base leading-relaxed">
                            Let your sparkle inspire and earn while you do. Invite your friends to
                            join Lucira and enjoy exclusive perks when they make their first
                            purchase - you earn Lucira Coins and they get a discount. It's our way
                            of saying thank you.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        <div className="md:col-span-2 lg:col-span-1 flex flex-col justify-center">
                            <p className="mb-4 text-gray-800 text-sm md:text-base">
                                Your Referral Link is Ready to Share with your friends
                            </p>
                            <div className="flex flex-col sm:flex-row">
                                <input className="flex-1 border px-4 py-3 text-sm rounded-md sm:rounded-l-md sm:rounded-r-none"
                                    value={
                                    isLoggedIn
                                        ? referralLink || "Generating your referral link..."
                                        : "Please Login to Share your Referral Link"
                                    }
                                    readOnly
                                />
                                <button
                                    onClick={handleClick}
                                    className="bg-[#A68380] text-white px-6 py-3 text-sm uppercase rounded-md mt-2 sm:mt-0 sm:rounded-r-md sm:rounded-l-none cursor-pointer">
                                    {isLoggedIn ? "Copy" : "Login"}
                                </button>
                            </div>
                        </div>
                        
                        <div className="relative bg-[#F3E0CF] rounded-md p-5 md:p-6 min-h-[160px] md:min-h-[180px] flex flex-col justify-center text-right overflow-hidden">
                            <p className="text-sm mb-2 relative z-10">
                            They Get
                            </p>
                            <p className="text-2xl md:text-3xl font-bold relative z-10">
                            ₹1,000 Off <br />
                            <span className="text-lg md:text-xl font-bold">
                                on their 1st Order
                            </span>
                            </p>
                        </div>
                        
                        <div className="relative bg-[#F3E0CF] rounded-md p-5 md:p-6 min-h-[160px] md:min-h-[180px] flex flex-col justify-center text-left overflow-hidden">
                            <p className="text-sm mb-2 relative z-10">
                            You Get
                            </p>
                            <p className="text-2xl md:text-3xl font-bold relative z-10">
                            2,000 <br />
                            <span className="text-lg md:text-xl font-bold">
                                Lucira Coins
                            </span>
                            </p>
                        </div>

                    </div>
                </div>
            </section>
            <section className="py-12 md:py-16 bg-gray-50">
                <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                    {isLoggedIn && (
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-10 shadow-sm space-y-8">
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold uppercase text-gray-900">Referral & Transactional History</h3>
                                    <p className="text-sm text-gray-500 mt-1">Track your successful referrals and earned coins.</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center flex-1 min-w-[100px]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Transactions</p>
                                        <p className="text-lg font-bold text-gray-900">{stats.total_referrals}</p>
                                    </div>
                                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3 text-center flex-1 min-w-[100px]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A68380] mb-1">Coins Earned</p>
                                        <p className="text-lg font-bold text-[#A68380]">{stats.coins_earned}</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-center flex-1 min-w-[100px]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Coins Balance</p>
                                        <p className="text-lg font-bold text-amber-700">{stats.coins_balance}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                {loadingStats ? (
                                    <div className="py-12 text-center text-gray-400 font-medium animate-pulse">
                                        Loading history...
                                    </div>
                                ) : stats.history.length > 0 ? (
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                <th className="pb-4 px-4">Name</th>
                                                <th className="pb-4 px-4">Date</th>
                                                <th className="pb-4 px-4">Status</th>
                                                <th className="pb-4 px-4 text-right">Reward</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {stats.history.map((row, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4 font-medium text-gray-900">{row.name}</td>
                                                    <td className="py-4 px-4 text-gray-500">{row.date}</td>
                                                    <td className="py-4 px-4">
                                                        {row.status === 'Earned' ? (
                                                            <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Earned</span>
                                                        ) : (
                                                            <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Failed</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-bold text-[#A68380]">+{row.reward} coins</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                        <p className="text-gray-400 font-medium">No referrals yet. Share your link to start earning!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse"></div>}>
                <FAQ title="FAQ'S" description="Curious about Lucira Rewards? We’ve got you covered! Here’s everything you need to know about earning, redeeming, and making the most of your Lucira Rewards. What is Lucira Rewards?" faqs={faqData} />
            </Suspense>

            <AuthDialog open={open} onOpenChange={setOpen} />
        </>
    )
}