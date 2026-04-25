"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setReferralLink as setReduxReferralLink } from "@/redux/features/user/userSlice";
import { Loader2 } from "lucide-react";

const REFERRAL_API = "https://refer-earn-385594025448.asia-south1.run.app";

const EarnedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_11564_5826" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
      <rect width="20" height="20" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_11564_5826)">
      <path d="M8.81733 13.5445L14.4198 7.94197L13.5417 7.06384L8.81733 11.7882L6.44233 9.41322L5.56421 10.2913L8.81733 13.5445ZM10.0015 17.9163C8.9065 17.9163 7.87726 17.7086 6.91379 17.293C5.95032 16.8775 5.11226 16.3135 4.39962 15.6011C3.68698 14.8888 3.12275 14.0511 2.70692 13.088C2.29122 12.125 2.08337 11.096 2.08337 10.0011C2.08337 8.90613 2.29115 7.8769 2.70671 6.91342C3.12226 5.94995 3.68622 5.1119 4.39858 4.39926C5.11094 3.68662 5.94865 3.12238 6.91171 2.70655C7.87476 2.29085 8.90372 2.08301 9.99858 2.08301C11.0936 2.08301 12.1228 2.29079 13.0863 2.70634C14.0498 3.1219 14.8878 3.68586 15.6005 4.39822C16.3131 5.11058 16.8773 5.94829 17.2932 6.91134C17.7089 7.8744 17.9167 8.90335 17.9167 9.99822C17.9167 11.0932 17.7089 12.1225 17.2934 13.0859C16.8778 14.0494 16.3139 14.8875 15.6015 15.6001C14.8891 16.3127 14.0514 16.877 13.0884 17.2928C12.1253 17.7085 11.0964 17.9163 10.0015 17.9163Z" fill="#00D26A" />
    </g>
  </svg>
);

const FailedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_11564_5835" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
      <rect width="20" height="20" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_11564_5835)">
      <path d="M7.00004 13.8778L10 10.8778L13 13.8778L13.8782 12.9997L10.8782 9.99967L13.8782 6.99967L13 6.12155L10 9.12155L7.00004 6.12155L6.12192 6.99967L9.12192 9.99967L6.12192 12.9997L7.00004 13.8778ZM10.0015 17.9163C8.9065 17.9163 7.87726 17.7086 6.91379 17.293C5.95032 16.8775 5.11226 16.3135 4.39962 15.6011C3.68698 14.8888 3.12275 14.0511 2.70692 13.088C2.29122 12.125 2.08337 11.096 2.08337 10.0011C2.08337 8.90613 2.29115 7.8769 2.70671 6.91342C3.12226 5.94995 3.68622 5.1119 4.39858 4.39926C5.11094 3.68662 5.94865 3.12238 6.91171 2.70655C7.87476 2.29085 8.90372 2.08301 9.99858 2.08301C11.0936 2.08301 12.1228 2.29079 13.0863 2.70634C14.0498 3.1219 14.8878 3.68586 15.6005 4.39822C16.3131 5.11058 16.8773 5.94829 17.2932 6.91134C17.7089 7.8744 17.9167 8.90335 17.9167 9.99822C17.9167 11.0932 17.7089 12.1225 17.2934 13.0859C16.8778 14.0494 16.3139 14.8875 15.6015 15.6001C14.8891 16.3127 14.0514 16.877 13.0884 17.2928C12.1253 17.7085 11.0964 17.9163 10.0015 17.9163Z" fill="#D32F2F" />
    </g>
  </svg>
);

export default function ReferEarnPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const reduxReferralLink = useSelector((state) => state.user.referralLink);
  
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total_referrals: 0,
    coins_earned: 0,
    coins_balance: 0,
  });
  const [referralLink, setReferralLink] = useState(reduxReferralLink || "");
  const [copyStatus, setCopyStatus] = useState("Copy Link");
  
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    cardRefs.current.forEach(card => {
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const initData = async () => {
      if (!user) return;
      
      const numericId = (user.id || "").split("/").pop();
      if (!numericId) {
        setLoading(false);
        return;
      }

      const customerId = `shopify-${numericId}`;

      try {
        const promises = [];

        if (!reduxReferralLink) {
          promises.push(
            fetch("/api/customer/referral", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ customerId: numericId }),
            }).then(res => res.json()).catch(() => ({ referralLink: "" }))
          );
        } else {
          promises.push(Promise.resolve({ referralLink: reduxReferralLink }));
        }

        promises.push(
          fetch(`${REFERRAL_API}?customer_id=${customerId}`)
            .then(res => res.json())
            .catch(() => ({ status: false }))
        );

        const [refData, statsData] = await Promise.all(promises);

        if (refData?.referralLink) {
          setReferralLink(refData.referralLink);
          dispatch(setReduxReferralLink(refData.referralLink));
        }

        if (statsData?.status) {
          setStats({
            total_referrals: statsData.total_referrals || 0,
            coins_earned: statsData.coins_earned || 0,
            coins_balance: statsData.coins_balance || 0,
          });
          setHistory(statsData.history || []);
        }
      } catch (err) {
        console.error("Referral fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [user, reduxReferralLink, dispatch]);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy Link"), 2000);
  };

  const shareOnWhatsApp = () => {
    const message = `Hey! Check out this amazing platform - Lucira! Use my referral link to get ₹1000 off on your first order: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnInstagram = () => {
    handleCopyLink();
    window.open('https://www.instagram.com/', '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank', 'width=600,height=800');
  };

  const shareReferralLink = () => {
    const message = `Hey! Use my referral link and get ₹1000 off on your first order: ${referralLink}`;
    if (navigator.share) {
      navigator.share({
        title: 'Invite Friends to Lucira',
        text: message,
        url: referralLink
      }).catch(err => console.log('Share cancelled', err));
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading referral details...</p>
      </div>
    );
  }

  return (
    <div className="lucira-section nector-referral-program-section" id="refer-and-earn">
      <div className="page-width">
        
        {/* 1. Header Cards Wrapper */}
        <div className="nector-referral-program-wrapper">
          <div className="grid-column">
            <div className="grid-card-wrapper" ref={el => cardRefs.current[0] = el}>
              <img 
                src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/They_Get_img_2.png?v=1751354604" 
                className="image-bg-left" 
                alt="loyalty page left" 
                title="loyalty page image left" 
                width="auto" 
                height="auto" 
              />
              <p>They Get</p>
              <p className="coins-text">
                ₹1,000 Off<br />
                <span> on their 1st Order</span>
              </p>
            </div>
          </div>
          <div className="grid-column">
            <div className="grid-card-wrapper" ref={el => cardRefs.current[1] = el}>
              <img 
                src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/7d93784d-d99f-4716-8c45-779b911938f6_2.png?v=1751352893" 
                className="image-bg-right" 
                alt="image-by-right" 
                title="image-by-right" 
                width="auto" 
                height="auto" 
              />
              <p>You Get</p>
              <p className="coins-text">
                2,000<br />
                <span>Lucira Coins</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Referral Copy & Social Icons */}
        <div className="grid-row referal-row">
          <div className="grid-column">
            <div className="referral-copy-wrapper">
              <p>Your Referral Link is Ready to Share with your friends</p>
              <div className="copy-link-container">
                <input 
                  type="text" 
                  id="referralLink" 
                  value={referralLink} 
                  readOnly 
                />
                <button className="copy-btn" onClick={handleCopyLink}>{copyStatus === 'Copied!' ? 'Copied!' : 'Copy Link'}</button>
              </div>
            </div>
          </div>

          <div className="grid-column">
            <div className="or-text">OR</div>
          </div>

          <div className="grid-column">
            <div className="grid-social-icons">
              <a href="#" onClick={(e) => { e.preventDefault(); shareOnWhatsApp(); }}>
                <img src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Frame_427319185.png?v=1766570053" alt="whatsapp icon" title="whatsapp icon" width="72" height="72" />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); shareOnInstagram(); }}>
                <img src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Frame_427322338.png?v=1766570052" alt="instagram icon" title="instagram icon" width="72" height="72" />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); shareOnFacebook(); }}>
                <img src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Frame_427319188.png?v=1766570053" alt="facebook icon" title="facebook icon" width="72" height="72" />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); shareOnLinkedIn(); }}>
                <img src="https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Frame_427319187.png?v=1766570053" alt="linkedin icon" title="linkedin icon" width="72" height="72" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. Referral History Wrapper */}
        <div className="referral-history-wrapper">
          <h3 className="referral-title">Referral & Transactional History</h3>

          <div className="referral-summary">
            <div>
              <span>TOTAL TRANSACTIONS:</span>
              <strong id="total-referrals">{stats.total_referrals}</strong>
            </div>
            <div>
              <span>LUCIRA COINS EARNED:</span>
              <strong id="coins-earned">{stats.coins_earned}</strong>
            </div>
            <div>
              <span>LUCIRA COINS BALANCE:</span>
              <strong id="coins-balance">{stats.coins_balance}</strong>
            </div>
          </div>

          <table className="referral-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody id="referral-history-body">
              {history.length > 0 ? (
                history.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.name}</td>
                    <td>{row.date}</td>
                    <td>
                      <div className="status-cell">
                         {row.status === 'Earned' ? (
                           <div className="status-earned"><EarnedIcon /><span className="desktop-show">Earned</span></div>
                         ) : (
                           <div className="status-failed"><FailedIcon /><span className="desktop-show">Failed</span></div>
                         )}
                      </div>
                    </td>
                    <td>{row.reward} coins</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No history found yet.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="invite-btn-wrapper">
            <button className="invite-btn" onClick={shareReferralLink}>
              INVITE FRIENDS
            </button>
          </div>
        </div>

      </div>

      <style jsx>{`
        .nector-referral-program-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }
        .grid-card-wrapper {
          position: relative;
          background: #F3E0CF;
          padding: 40px 30px;
          border-radius: 12px;
          overflow: hidden;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .grid-card-wrapper img {
          position: absolute;
          height: 100%;
          width: auto;
          top: 0;
          pointer-events: none;
        }
        .image-bg-left { left: 0; }
        .image-bg-right { right: 0; }
        
        .grid-card-wrapper p {
          position: relative;
          z-index: 1;
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        .coins-text {
          font-size: 32px !important;
          font-weight: 800;
          line-height: 1.2;
          margin-top: 5px !important;
        }
        .coins-text span {
          font-size: 20px;
          font-weight: 600;
        }

        .referal-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 50px;
        }
        .referral-copy-wrapper {
          flex: 1;
        }
        .referral-copy-wrapper p {
          font-weight: 600;
          margin-bottom: 15px;
          font-size: 15px;
        }
        .copy-link-container {
          display: flex;
          gap: 0;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .copy-link-container input {
          flex: 1;
          padding: 12px 15px;
          border: none;
          outline: none;
          font-size: 14px;
          color: #666;
          background: #fff;
        }
        .copy-btn {
          background: #A68380;
          color: #fff;
          border: none;
          padding: 0 25px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.3s;
        }

        .or-text {
          font-weight: 900;
          color: #ccc;
          font-size: 18px;
        }

        .grid-social-icons {
          display: flex;
          gap: 15px;
        }
        .grid-social-icons img {
          width: 50px;
          height: 50px;
          transition: transform 0.2s;
        }
        .grid-social-icons a:hover img {
          transform: scale(1.1);
        }

        .referral-history-wrapper {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 30px;
        }
        .referral-title {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 25px;
          text-align: center;
        }
        .referral-summary {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .referral-summary div {
          padding: 15px;
          background: #fcfcfc;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
        }
        .referral-summary span {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: #999;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .referral-summary strong {
          font-size: 24px;
          font-weight: 900;
          color: #333;
        }

        .referral-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .referral-table th {
          text-align: left;
          padding: 15px;
          background: #f9f9f9;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          color: #666;
        }
        .referral-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
          color: #444;
          font-weight: 600;
        }
        .status-earned, .status-failed {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }
        .status-earned { color: #00D26A; }
        .status-failed { color: #D32F2F; }

        .invite-btn-wrapper {
          text-align: center;
        }
        .invite-btn {
          background: #3D2A1E;
          color: #fff;
          border: none;
          padding: 15px 40px;
          border-radius: 30px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          letter-spacing: 1px;
          transition: transform 0.2s, background 0.3s;
        }
        .invite-btn:hover {
          background: #5A413F;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .nector-referral-program-wrapper { grid-template-columns: 1fr; }
          .referal-row { flex-direction: column; text-align: center; }
          .referral-summary { grid-template-columns: 1fr; }
          .desktop-show { display: none; }
        }
      `}</style>
    </div>
  );
}
