"use client";

import { useEffect, useState, useRef } from "react";

const sections = [
  {
    id: "bannerSection",
    title: "Ideation & sketching",
    desktopImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Sketch_1.jpg?v=1760704290",
    mobileImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Sketch_2.jpg?v=1761630096",
    className: "craftmanship-banner",
    zIndex: 9
  },
  {
    id: "bannerSection2",
    title: "3d Designing",
    desktopImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/CAD_1.jpg?v=1760704290",
    mobileImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/3D.jpg?v=1761630096",
    className: "craftmanship-3d-design-banner",
    zIndex: 8
  },
  {
    id: "bannerSection3",
    title: "Molding & Casting",
    desktopImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Molding_Casting_1.png?v=1751633860",
    mobileImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Molding_Casting_Mob_1.png?v=1751635669",
    className: "craftmanship-molding-casting-banner",
    zIndex: 7
  },
  {
    id: "bannerSection5",
    title: "Filing & Polishing",
    desktopImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Polishing_Coating_1.png?v=1751634033",
    mobileImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Polishing_Coating_Mob_1.png?v=1751635404",
    className: "craftmanship-polishing-banner",
    zIndex: 5
  },
  {
    id: "bannerSection6",
    title: "Diamond Setting",
    desktopImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Diamond-Setting_1.jpg?v=1760704290",
    mobileImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Diamond-Setting_2.jpg?v=1761630096",
    className: "craftmanship-metal-setting-banner",
    zIndex: 4
  },
  {
    id: "bannerSection7",
    title: "Quality Check",
    desktopImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/QC_1.jpg?v=1760704290",
    mobileImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/QC_2.jpg?v=1761630096",
    className: "craftmanship-quality-check-banner",
    zIndex: 2
  },
  {
    id: "bannerSection8",
    title: "Packaging",
    desktopImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Packaging_1.png?v=1751634963",
    mobileImage: "https://cdn.shopify.com/s/files/1/0739/8516/3482/files/Packaging_Mob_1.png?v=1751635669",
    className: "craftmanship-packaging-banner",
    zIndex: 3
  }
];

export default function CraftmanshipPage() {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setActiveSection(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sectionElements = document.querySelectorAll(".craftmanship-section");
    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="page-craftmanship-template-page font-figtree">
      <style>{`
        .page-craftmanship-template-page .section-header.shopify-section-group-header-group { z-index: 21; }
        .page-craftmanship-template-page summary.list-menu__item { color: white; }
        .page-craftmanship-template-page .header-wrapper.color-scheme-1.gradient.header-wrapper--border-bottom:hover summary.list-menu__item { color: #000000; }
        .page-craftmanship-template-page .header-wrapper.color-scheme-1.gradient.header-wrapper--border-bottom:hover {background: #fff;}

        .craftmanship-section {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
          background-attachment: fixed;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
        }

        ${sections.map(section => `
          .${section.className} {
            background-image: url(${section.desktopImage});
            -webkit-mask-image: url(${section.desktopImage});
            -webkit-mask-size: cover;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
            z-index: ${section.zIndex};
          }
        `).join('\n')}

        .craftmanship-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0);
          z-index: 1;
        }

        .section-active::before {
          filter: blur(2px);
          opacity: 0.8;
          transition: all 0.6s ease;
        }

        .craftmanship-section h2 {
          color: #fff;
          margin: 0 auto;
          font-family: Futura, sans-serif;
          font-weight: 500;
          font-size: 48px;
          line-height: 150%;
          text-transform: uppercase;
          opacity: 1;
          transform: translateY(0);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          z-index: 3;
        }

        .craftmanship-wrapper {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) perspective(1000px) translateZ(100px);
          z-index: 10;
          text-align: center;
          width: 100%;
          padding: 0 20px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .craftmanship-wrapper.active {
          opacity: 1;
        }

        @media only screen and (max-width: 767px) {
          .craftmanship-section h2 {
            font-size: 20px !important;
            letter-spacing: 2px;
            max-width: 330px;
          }

          .page-craftmanship-template-page .header-wrapper.color-scheme-1.gradient.header-wrapper--border-bottom {
            background: #ffffff;
          }

          .page-craftmanship-template-page .hulkapps-wl-wishlist-icon .icon-wishlist-heart-empty {
            color: #000000 !important;
          }

          ${sections.map(section => `
            .${section.className} {
              background-image: url(${section.mobileImage});
              -webkit-mask-image: url(${section.mobileImage});
            }
          `).join('\n')}
        }
      `}</style>

      <h1 style={{ display: "none" }}>Craftmanship</h1>

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={`craftmanship-section ${section.className} ${activeSection === index ? "section-active" : ""}`}
          data-index={index}
        >
          <div className="page-width">
            {/* The actual content is fixed, but we keep the structure */}
          </div>
        </section>
      ))}

      {/* Fixed Wrappers for titles */}
      {sections.map((section, index) => (
        <div
          key={`wrapper-${section.id}`}
          className={`craftmanship-wrapper ${activeSection === index ? "active" : ""}`}
        >
          <h2>{section.title}</h2>
        </div>
      ))}
    </main>
  );
}
