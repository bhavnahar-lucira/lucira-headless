const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SHOP_DOMAIN = process.env.SHOPIFY_STORE ? (process.env.SHOPIFY_STORE.includes('.') ? process.env.SHOPIFY_STORE : `${process.env.SHOPIFY_STORE}.myshopify.com`) : 'luciraonline.myshopify.com';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

// Fallback data if no CSV file is provided/found
const fallbackCsvData = `Redirect from,Redirect to
/products/mixed-cut-diamond-dangle-necklace,/products/3-38-ct-emerald-meadow-gemstone-layered-necklace
/products/diamond-and-green-gemstone-dangle-necklace,/products/1-64-ct-emerald-reverie-gemstone-charm-necklace
/products/valentina-heart-cut-solitaire-hoop-earrings,/products/2-ct-heart-cut-solitaire-hoop-earrings
/products/dangling-pear-diamond-necklace,/products/1-05-ct-teardrop-diamond-charm-necklace
/products/moonbeam-dangle-round-diamond-necklace,/products/1-56-ct-fringe-round-diamonds-charm-necklace
/products/dangling-round-solitaire-pendant,/products/1-74-ct-dual-round-solitaire-chain-pendant
/products/pallavi-diamond-bali-nosepin,/products/pallavi-diamond-nose-bali
/products/floret-diamond-bali-nosepin,/products/floret-diamond-nose-bali
/products/gold-wave-diamond-bali-nosepin,/products/gold-wave-diamond-nose-bali
/products/princess-cut-diamond-bali-nosepin,/products/princess-cut-diamond-nose-bali
/products/chandrika-diamond-bali-nosepin,/products/chandrika-diamond-nose-bali
/products/customize-2-00-ct-cushion-diamond-earring,/products/customize-1-00-ct-each-side-cushion-diamond-earring
/products/three-stone-0-91ct-round-diamond-ring,/products/0-96-ct-gilded-era-round-diamond-trilogy-ring
/products/0-98ct-half-eternity-oval-diamond-band,/products/1-19-ct-graduating-oval-diamond-half-eternity-band
/products/0-5ct-round-diamond-channel-eternity-band,/products/0-55-ct-heirloom-diamond-half-eternity-band
/products/6-20-ct-glamour-round-diamond-tennis-bracelet,/products/6-ct-glamour-round-diamond-tennis-bracelet
/products/0-51-ct-round-solitaire-diamond-ring,/products/0-73-ct-parisian-round-diamond-solitaire-ring
/products/endless-spark-chain-bracelet,/products/ananta-cluster-diamond-mangalsutra-bracelet
/collections/nose-pins,/collections/nosepins
/collections/for-mother-copy,/collections/gifts-for-mother
/collections/mens-engagement-bridal-rings-copy,/collections/engagement-bridal-rings-for-men
/collections/men-s-rings-copy,/collections/rings-for-men
/collections/solitaires-between-200k-300k-copy,/collections/solitaires-above-300k
/collections/solitaires-200k-300k-copy,/collections/solitaires-between-200k-300k
/collections/solitaires-between-rs-150k-to-rs-200k-copy,/collections/solitaires-between-150k-200k
/collections/solitaires-between-rs-100k-to-rs-150k-copy,/collections/solitaires-between-100k-150k
/collections/solitaires-between-rs-50k-to-rs-100k-copy,/collections/solitaires-between-50k-100k
/collections/solitaires-below-rs-50k-copy,/collections/solitaires-below-50k
/collections/solitaires-mens-copy,/collections/solitaires-for-men
/collections/solitaires-pendants-copy,/collections/solitaire-pendants
/collections/solitaires-necklaces-copy,/collections/solitaire-necklaces
/collections/solitaires-bracelets-copy,/collections/solitaire-bracelets
/collections/150k-and-above-earrings-copy,/collections/earrings-above-150k
/collections/100k-150k-earrings-copy,/collections/earrings-between-100k-150k
/collections/earrings-between-rs-75k-to-rs-100k-copy,/collections/earrings-between-75k-100k
/collections/earrings-between-rs-50k-to-rs-75k,/collections/earrings-between-50k-75k
/collections/earrings-between-rs-30k-to-rs-50k-copy,/collections/earrings-between-30k-50k
/collections/earrings-below-15k-copy,/collections/earrings-between-15k-30k
/collections/rings-above-200k-copy,/collections/rings-above-150k
/collections/rings-between-rs-100k-to-rs-150k-copy,/collections/rings-between-100k-150k
/collections/engagement-bridal-rings-between-150k-200k-copy,/collections/engagement-bridal-rings-above-200k
/collections/engagement-bridal-rings-between-100k-150k-copy,/collections/engagement-bridal-rings-between-150k-200k
/collections/engagement-bridal-rings-between-50k-100k-copy,/collections/engagement-bridal-rings-between-100k-150k
/collections/below-50k-engagement-bridal-rings-copy,/collections/engagement-bridal-rings-between-50k-100k
/collections/below-50k-engagement-bridal-rings,/collections/engagement-bridal-rings-below-50k
/collections/white-gold-engagement-bridal-rings-copy,/collections/platinum-engagement-bridal-rings
/collections/rose-gold-engagement-bridal-rings-copy,/collections/white-gold-engagement-bridal-rings
/collections/yellow-gold-engagement-bridal-rings-copy,/collections/rose-gold-engagement-bridal-rings
/collections/solitaire-engagement-bridal-rings,/collections/solitaires-engagement-bridal-rings
/products/0-51ct-marquise-bezel-diamond-ring,/products/0-5-ct-bezel-marquise-solitaire-ring
/products/0-73-carat-grooved-diamond-mens-classic-ring,/products/0-75ct-fluted-solitaire-mens-ring
/products/3-ct-classic-round-solitaire-diamond-stud-earrings,/products/2-4-ct-eternal-round-solitaire-stud-earrings
/products/classic-round-solitaire-stud-earrings-1-80-cts,/products/1-74-ct-timeless-round-solitaire-stud-earrings
/products/0-89-cts-paperclip-solitaire-diamond-bracelet,/products/0-95-ct-round-solitaire-paperclip-chain-bracelet
/collections/solitaires-above-rs-200k,/collections/200k-300k-solitaires
/collections/solitaires-rose-gold,/collections/rose-gold-solitaires
/collections/solitaires-yellow-gold,/collections/yellow-gold-solitaires
/collections/valentines-gift,/collections/valentines-gifts
/products/051-ct-cipher-round-solitaire-ring,/products/0-51-ct-cipher-round-solitaire-ring
/products/1-02-ct-cipher-round-solitaire-ring,/products/0-51-ct-cipher-round-solitaire-ring
/collections/bestseller-rings,/collections/bestsellers-rings
/collections/bestseller-earrings,/collections/bestsellers-earrings
/collections/necklace,https://www.lucirajewelry.com/collections/necklaces
/collections/gold-necklace,/collections/gold-necklaces
/collections/mens-ring,/collections/mens-rings
/collections/v-shaped-diamond-ring-copy,/collections/radiant-cut-diamond-ring
/collections/lab-grown-diamond-jewellery,https://www.lucirajewelry.com/
/collections/lab-grown-diamond,https://www.lucirajewelry.com/
/collections/fs,https://www.lucirajewelry.com/collections/fast-shipping
/products/0-44ct-half-eternity-pave-diamond-band,/products/0-44ct-eternity-pave-diamond-band
/collections/eternity-ring,https://www.lucirajewelry.com/collections/eternity-rings
/products/urban-core-diamond-mens-ring,/products/zenith-emerald-solitaire-mens-ring
/products/round-diamond-sparkle-necklace,/products/3-ct-sparkling-round-diamond-tennis-necklace
/products/round-bezel-set-tennis-necklace,/products/12-56-ct-bezel-round-diamond-tennis-necklace
/products/pear-shaped-diamond-tennis-necklace,/products/17-6-ct-graduating-pear-diamond-tennis-necklace
/products/horizon-glow-round-diamond-necklace,/products/6-09-ct-graduating-round-diamond-tennis-necklace
/products/streamline-sparkle-round-diamond-necklace,/products/5-33-ct-streamlined-round-diamond-tennis-necklace
/products/rhythmic-radiance-pear-diamond-necklace,/products/10-8-ct-ethereal-pear-diamond-tennis-necklace
/products/whispering-ovals-diamond-necklace,/products/10-62-ct-timeless-oval-diamond-tennis-necklace
/products/everbright-loop-diamond-tennis-neckalce,/products/5-67-ct-dazzling-round-diamond-tennis-necklace
/products/timeless-pear-bezel-diamond-necklace,/products/9-02-ct-bezel-pear-diamond-tennis-necklace
/products/classic-oval-bezel-diamond-necklace,/products/9-05-ct-bezel-oval-diamond-tennis-necklace
/products/heart-shaped-diamond-tennis-necklace,/products/13-17-ct-bezel-heart-diamond-tennis-necklace
/products/7-47-ct-timeless-round-diamond-tennis-bracelet,/products/7-92-ct-timeless-round-diamond-tennis-bracelet
/products/nakshtra-cluster-diamond-nose-pin,/products/lozenge-cluster-diamond-nose-pin
/products/dazzling-round-diamond-tennis-bracelet,/products/1-77-ct-streamlined-round-diamond-tennis-bracelet
/products/round-radiance-tennis-bracelet,/products/1-06-ct-classic-round-diamond-tennis-bracelet
/products/endless-oval-tennis-bracelet,/products/10-92-ct-endless-oval-diamond-tennis-bracelet
/products/eternal-pear-diamond-tennis-bracelet,/products/9-9-ct-dewdrop-pear-diamond-tennis-bracelet
/products/dazzling-diamond-tennis-bracelet,/products/1-ct-minimalist-round-diamond-tennis-bracelet
/products/eternal-grace-round-diamond-bracelet,/products/4-9-ct-eternal-round-diamond-tennis-bracelet
/products/luminance-link-diamond-tennis-bracelet,/products/3-08-ct-brilliance-round-diamond-tennis-bracelet
/products/sparkle-strand-diamond-tennis-bracelet,/products/9-24-ct-sparkling-round-diamond-tennis-bracelet
/products/heirloom-glow-round-diamond-tennis-bracelet,/products/6-86-ct-heirloom-round-diamond-tennis-bracelet
/products/luminance-link-round-diamond-tennis-bracelet,/products/5-4-ct-prismatic-round-diamond-tennis-bracelet
/products/glimmering-pear-shape-diamond-tennis-bracelet,/products/7-18-ct-tilted-pear-diamond-tennis-bracelet
/products/cirque-sparkle-tennis-bracelet,/products/8-92-ct-lucent-round-diamond-tennis-bracelet
/products/elegant-diamond-tennis-bracelet,/products/5-23-ct-gleaming-round-diamond-tennis-bracelet
/products/emerald-cut-green-stone-and-diamond-bracelet,/products/13-30-ct-verdant-emerald-gemstone-tennis-bracelet
/products/single-row-diamond-tennis-bracelet,/products/6-20-ct-glamour-round-diamond-tennis-bracelet
/products/celeste-round-tennis-bracelet,/products/7-47-ct-timeless-round-diamond-tennis-bracelet
/products/round-lustre-bracelet,/products/8-17-ct-lustre-round-diamond-tennis-bracelet
/products/round-diamond-prong-bracelet,/products/9-13-ct-luxe-round-diamond-tennis-bracelet
/products/emerald-cut-and-round-diamond-tennis-bracelet,/products/10-12-ct-duet-diamond-tennis-bracelet
/products/marquise-cut-diamond-bezel-set-tennis-bracelet,/products/3-33-ct-bezel-marquise-diamond-tennis-bracelet
/products/full-bezel-round-diamond-tennis-bracelet,/products/6-25-ct-bezel-round-diamond-tennis-bracelet
/products/oval-diamond-bezel-set-bracelet,/products/6-25-ct-bezel-oval-diamond-tennis-bracelet
/products/heart-cut-diamond-bezel-set-tennis-bracelet,/products/7-11-ct-bezel-heart-diamond-tennis-bracelet
/products/emerald-bezel-set-tennis-bracelet,/products/7-01-ct-bezel-emerald-diamond-tennis-bracelet
/products/round-diamond-bezel-set-tennis-bracelet,/products/5-59-ct-delicate-round-diamond-tennis-bracelet
/products/endless-round-diamond-tennis-bracelet,/products/5-26-ct-scintillating-round-diamond-tennis-bracelet
/products/elegant-round-diamond-tennis-bracelet,/products/10-92-ct-luminous-round-diamond-tennis-bracelet
/products/classic-round-diamond-tennis-bracelet,/products/9-01-ct-elevated-round-diamond-tennis-bracelet
/products/marquise-cascade-tennis-bracelet,/products/11-09-ct-graduating-marquise-diamond-tennis-bracelet
/products/round-radiant-tennis-bracelet,/products/4-86-ct-stellar-radiant-diamond-tennis-bracelet
/products/13-84ct-multishape-diamond-tennis-bracelet,/products/13-84-ct-multishape-diamond-tennis-bracelet
/products/round-cut-diamond-tennis-bracelet,/products/9-76-ct-shimmering-round-diamond-tennis-bracelet
/products/pear-cut-diamond-tennis-bracelet,/products/6-83-ct-pear-east-west-diamond-tennis-bracelet
/products/round-diamond-tennis-bangle,/products/13-01-ct-classic-round-diamond-tennis-bangle
/products/8-98ct-regal-emerald-diamond-tennis-bracelet,/products/8-98-ct-regal-emerald-diamond-tennis-bracelet
/products/bow-plain-gold-chain-chain-necklace,/products/bow-plain-gold-chain-necklace
/collections/gudi-padwa-jewllery,/collections/gudi-padwa-jewellery
/collections/gudi-padwa-collection,/collections/gudi-padwa-jewllery
/collections/akshaya-tritiya-gold-diamond-jewellery-by-lucira,/collections/akshaya-tritiya-gold-diamond-jewellery
/blogs/stories/how-to-choose-the-perfect-engagement-ring-in-2025,/blogs/stories/how-to-choose-the-perfect-engagement-ring-in-2026
/pages/jewelry-gift-guide-1,/pages/jewelry-gift-guide
/collections/chain-braceletss-1,https://www.lucirajewelry.com/collections/chain-bracelets
/products/captivating-baguette-round-halo-pendant,/products/composite-baguette-round-halo-pendant
/llms.txt,/a/llms
/llms-full.txt,/a/llms/full.txt
/collections/engagement-ring,/collections/engagement-rings
/collections/bestsellers-1,/collections/bestsellers
/products/hexora-moving-diamond-lattice-hoop-earrings,/products/hexora-moving-diamond-stellar-hoop-earrings
/products/lattice-diamond-hoop-earrings,/products/hexora-moving-diamond-lattice-hoop-earrings-1
/products/lattice-diamond-pendant-necklace,/products/hexora-moving-diamond-lattice-chain-pendant
/products/hexa-rhombus-diamond-hoop-earrings,/products/hexora-moving-diamond-lattice-hoop-earrings
/products/hexa-rhombus-diamond-pendant-with-chain,/products/hexora-moving-diamond-stellar-chain-pendant
/collections/gold-jewellery,/collections/gold-jewelry
/collections/gift-under-below-rs-100k,/collections/gift-below-rs-100k
/products/hexa-round-diamond-chain-bracelet,/products/hexa-and-portuguese-diamond-chain-bracelet
/products/prong-set-trillion-solitaire-earrings,/products/delta-trillion-cut-solitaire-stud-earrings
/products/eternity-gate-diamond-hoops-earrings,/products/laurel-diamond-hoop-earrings
/collections/gold-ring,/collections/gold-rings
/products/eternal-blush-gemstone-diamond-dangle-earrings,/products/eternal-blush-gemstone-drop-earrings
/collections/engagement-rings-above-200k,/collections/engagement-rings-above-rs-200k
/collections/rings-under-25k,/collections/rings-below-rs-25k
/collections/wedding-rings-above-200k,/collections/wedding-rings-above-rs-200k
/collections/rings-above-100k,/collections/rings-above-rs-100k
/collections/gift-under-100-000,/collections/gift-under-below-rs-100k
/collections/gift-under-30000,/collections/gift-below-rs-30k
/collections/gift-under-50-000,/collections/gift-below-rs-50k
/collections/rings-below-50k,/collections/rings-below-rs-50k
/collections/solitaires-above-200k,/collections/solitaires-above-rs-200k
/collections/solitaires-between-rs-100k-rs-150k,/collections/solitaires-between-rs-100k-to-rs-150k
/collections/solitaires-50k-100k,/collections/solitaires-between-rs-50k-to-rs-100k
/collections/solitaires-100k-150k,/collections/solitaires-between-rs-100k-rs-150k
/collections/wedding-rings-under-50k,/collections/wedding-rings-below-rs-50k
/collections/engagement-rings-under-rs-50k,/collections/engagement-rings-below-rs-50k
/collections/engagement-rings-under-50k,/collections/engagement-rings-under-rs-50k
/collections/earrings-above-100k,/collections/earrings-above-rs-100k
/collections/earrings-under-10k,/collections/earrings-below-rs-10k
/products/four-prong-round-brilliant-cut-diamond-stud-earrings,/products/six-prong-round-diamond-stud-earrings
/collections/earrings-75k-100k,/collections/earrings-between-rs-75k-to-rs-100k
/collections/wedding-rings-50k-100k,/collections/wedding-rings-between-rs-50k-to-rs-100k
/collections/engagement-rings-50k-100k,/collections/engagement-rings-between-rs-50k-to-rs-100k
/collections/engagement-rings-100k-150k,/collections/engagement-rings-between-rs-100k-to-rs-150k
/collections/wedding-rings-100k-150k,/collections/wedding-rings-between-rs-100k-to-rs-150k
/collections/engagement-rings-150k-200k,/collections/engagement-rings-between-rs-150k-to-rs-200k
/collections/wedding-rings-150k-200k,/collections/wedding-rings-between-rs-150k-to-rs-200k
/collections/rings-50k-100k,/collections/rings-between-rs-50k-to-rs-100k
/collections/rings-100k-150k,/collections/rings-between-rs-100k-to-rs-150k
/collections/rings-150k-200k,/collections/rings-between-rs-150k-to-rs-200k
/collections/rings-25k-50k,/collections/rings-between-rs-25k-to-rs-50k
/collections/rings-50k-75krings-between-rs-50k-to-rs-75k,/collections/rings-between-rs-50k-to-rs-75k
/collections/rings-50k-75k,/collections/rings-50k-75krings-between-rs-50k-to-rs-75k
/collections/rings-20k-30k,/collections/rings-between-rs-20k-to-rs-30k
/collections/rings-75k-100k,/collections/rings-between-rs-75k-to-rs-100k
/collections/rings-10k-20k,/collections/rings-between-rs-10k-to-rs-20k
/collections/wedding-rings-below-50k,/collections/wedding-rings-under-50k
/collections/engagement-rings-below-50k,/collections/engagement-rings-under-50k
/collections/earrings-100k-and-above,/collections/earrings-above-100k
/collections/earrings-50k-75k,/collections/earrings-between-rs-50k-to-rs-75k
/collections/earrings-30k-50k,/collections/earrings-between-rs-30k-to-rs-50k
/collections/earrings-20k-30k,/collections/earrings-between-rs-20k-to-rs-30k
/collections/earrings-under-10000,/collections/earrings-under-10k
/collections/earrings-between-rs-10000-to-rs-20000,/collections/earrings-between-rs-10k-to-rs-20k
/collections/solitaires-150k-200k,/collections/solitaires-between-rs-150k-to-rs-200k
/collections/earrings-10k-20k,/collections/earrings-between-rs-10000-to-rs-20000
/collections/earrings-under-10-000,/collections/earrings-under-10000
/collections/rings-under-10k,/collections/rings-under-25k
/collections/solitaires-earrings,/collections/solitaire-earrings
/collections/earrings-1-50-1-99-cts-copy,/collections/rings-under-0-25ct
/collections/rings-0-50-0-99-ct-copy,/collections/rings-1-00-1-49ct
/collections/rings-below-0-25-ct-copy,/collections/rings-0-25-0-49ct
/collections/rings-above-2-00ct,/collections/rings-above-2ct
/collections/rings-1-50-1-99-ct-copy,/collections/rings-above-2-00ct
/collections/rings-1-00-1-49-ct-copy,/collections/rings-1-50-1-99-ct
/collections/rings-under-10k-copy,/collections/rings-10k-20k
/collections/rings-10k-20k-copy,/collections/rings-20k-30k
/collections/rings-150k-200k-copy,/collections/rings-above-200k
/collections/rings-0-25-0-49-ct-copy,/collections/rings-0-50-0-99-ct
/collections/rings-75k-100k-copy,/collections/rings-above-100k
/collections/rings-50k-75k-copy,/collections/rings-75k-100k
/collections/rings-100k-150k-copy,/collections/rings-150k-200k
/collections/rings-50k-100k-copy,/collections/rings-100k-150k
/collections/men-s-ring,/collections/mens-ring
/collections/rings-25k-35k,/collections/rings-25k-50k
/collections/rings-20k-30k-copy,/collections/rings-25k-35k
/blogs/stories/jewelry-trends-forecast-for-2025,https://www.lucirajewelry.com/blogs/stories/jewelry-trends-forecast-for-2026
/collections/diamond-tennis-bracelet,/collections/diamond-tennis-bracelets
/pages/store-locater,/pages/store-locator
/pages/store-page,/pages/store-locater
/products/royal-midnight-diamond-eternity-band,/products/royal-midnight-diamond-band
/products/deep-sea-sparkle-diamond-eternity-band,/products/deep-sea-sparkle-diamond-band
/products/signature-euro-solitaire-women-s-ring,/products/signature-euro-solitaire-womens-ring
/products/geometric-emerald-solitaire-men-s-ring,/products/geometric-emerald-solitaire-mens-ring
/products/signature-euro-solitaire-men-s-ring,/products/signature-euro-solitaire-mens-ring
/products/men-s-textured-solitaire-lgd-ring,/products/mens-textured-solitaire-lgd-ring
/products/men-s-bold-square-lgd-wedding-band,/products/mens-bold-square-lgd-wedding-band
/products/men-s-square-cluster-diamond-ring,/products/mens-square-cluster-diamond-ring
/products/men-s-dual-line-solitaire-band,/products/mens-dual-line-solitaire-band
/products/men-s-two-tone-hexagonal-cluster-diamond-ring,/products/mens-two-tone-hexagonal-cluster-diamond-ring
/products/men-s-classic-single-stone-band,/products/mens-classic-single-stone-band
/products/men-s-classic-solitaire-engagement-ring,/products/mens-classic-solitaire-engagement-ring
/products/men-s-sleek-solitaire-lab-grown-diamond-band,/products/mens-sleek-solitaire-lab-grown-diamond-band
/products/men-s-hexagonal-cluster-diamond-ring,/products/mens-hexagonal-cluster-diamond-ring
/products/men-s-prong-set-solitaire-wedding-band,/products/mens-prong-set-solitaire-wedding-band
/products/lattice-rhombus-diamond-stud-earrings,/products/majestic-scallop-diamond-stud-earrings
/products/mens-mens,/products/womens-mens
/products/cindrellas-carriage-charm,/products/cinderella-carriage-charm
/products/ring123456,/products/mens-mens
/products/stellar-petal-stud-earings,/products/stellar-petal-stud-earrings
/products/customized-0-63-cts-nose-pin,/products/customized-0-63-cts-nosepin
/products/gilded-whirl-cluster-diamond-nose-pin,/products/gilded-whirl-cluster-diamond-nosepin
/products/petal-point-round-diamond-nose-pin,/products/petal-point-round-diamond-nosepin
/products/floral-medallion-diamond-nose-pin,/products/floral-medallion-diamond-nosepin
/products/diagonal-round-diamond-nose-pin,/products/diagonal-round-diamond-nosepin
/products/chandrika-diamond-bali-nose-pin,/products/chandrika-diamond-bali-nosepin
/products/entwined-heart-diamond-nose-pin,/products/entwined-heart-diamond-nosepin
/products/corolla-round-diamond-nose-pin,/products/corolla-round-diamond-nosepin
/products/princess-cut-diamond-bali-nose-pin,/products/princess-cut-diamond-bali-nosepin
/products/gold-wave-diamond-bali-nose-pin,/products/gold-wave-diamond-bali-nosepin
/products/floret-diamond-bali-nose-pin,/products/floret-diamond-bali-nosepin
/products/trinity-marquise-diamond-nose-pin,/products/trinity-marquise-diamond-nosepin
/products/fleur-round-diamond-nose-pin,/products/fleur-round-diamond-nosepin
/products/pallavi-diamond-bali-nose-pin,/products/pallavi-diamond-bali-nosepin
/products/triad-round-diamond-nose-pin,/products/triad-round-diamond-nosepin
/products/star-round-diamond-nose-pin,/products/star-round-diamond-nosepin
/products/floral-round-diamond-nose-pin,/products/floral-round-diamond-nosepin
/products/eternal-heart-round-diamond-nose-pin,/products/eternal-heart-round-diamond-nosepin
/products/trio-round-diamond-nose-pin,/products/trio-round-diamond-nosepin
/products/petal-round-diamond-nose-pin,/products/petal-round-diamond-nosepin
/products/blossom-round-diamond-nose-pin,/products/blossom-round-diamond-nosepin
/products/cluster-round-diamond-nose-pin,/products/cluster-round-diamond-nosepin
/products/leaflet-round-diamond-nose-pin,/products/leaflet-round-diamond-nosepin
/products/bloom-round-diamond-nose-pin,/products/bloom-round-diamond-nosepin
/products/moonbeam-round-diamond-nose-pin,/products/moonbeam-round-diamond-nosepin
/products/eros-round-diamond-nose-pin,/products/eros-round-diamond-nosepin
/products/luminary-round-diamond-nose-pin,/products/luminary-round-diamond-nosepin
/products/pinwheel-round-diamond-nose-pin,/products/pinwheel-round-diamond-nosepin
/products/twinkle-round-diamond-nose-pin,/products/twinkle-round-diamond-nosepin
/products/elegant-round-diamond-nose-pin,/products/elegant-round-diamond-nosepin
/products/graceful-round-diamond-nose-pin,/products/graceful-round-diamond-nosepin
/products/embrace-pave-diamond-nose-pin,/products/embrace-pave-diamond-nosepin
/products/cherish-heart-diamond-nose-pin,/products/cherish-heart-diamond-nosepin
/products/classic-round-diamond-nose-pin,/products/classic-round-diamond-nosepin
/products/heartstrings-round-diamond-nose-pin,/products/heartstrings-round-diamond-nosepin
/products/hexa-round-diamond-nose-pin,/products/hexa-round-diamond-nosepin
/products/aura-round-diamond-nose-pin,/products/aura-round-diamond-nosepin
/products/kite-pave-diamond-nose-pin,/products/kite-pave-diamond-nosepin
/products/rosette-round-diamond-nose-pin,/products/rosette-round-diamond-nosepin
/products/honeycomb-round-diamond-nose-pin,/products/honeycomb-round-diamond-nosepin
/products/timeless-round-diamond-nose-pin,/products/timeless-round-diamond-nosepin
/products/twirl-round-diamond-nose-pin,/products/twirl-round-diamond-nosepin
/products/stellar-round-diamond-nose-pin,/products/stellar-round-diamond-nosepin
/search?_pos=1&_psq=couple+band&_ss=e&_v=1.0&q=couple+band,/collections/couple-bands
/products/tri-cluster-diamond-stiff-bracelet,/products/heart-letters-diamond-charm-bracelet
/products/luminous-pear-round-diamond-stud-earrings,/products/luminous-pear-round-diamond-hoop-earrings
/blogs/stories/natural-diamond-vs-labgrown-diamond,/pages/lgd-mine-page
/blogs/stories/bezel-vs-prong-which-diamond-setting-speaks-to-you,/blogs/stories/bezel-vs-prong
/products/the-classic-pear-drop-solitaire-earrings,/products/classic-pear-drop-solitaire-earrings
/products/diamond-huggie-hoop-earrings,/products/pristine-round-diamond-huggies-earring
/products/round-diamond-half-hoop-earrings,/products/brilliant-round-diamond-j-bali-earrings
/products/elegant-oval-cut-diamond-drop-earrings,/products/chainline-oval-diamond-dangle-earrings
/products/blue-gemstone-and-diamond-halo-drop-earrings,/products/blue-majesty-gemstone-drop-earrings
/products/elegant-floral-dangle-lgd-earrings,/products/rosalia-diamond-drop-earrings
/products/marquise-pear-drop-lgd-earrings,/products/celestia-pear-diamond-drops-earrings
/products/pear-round-diamond-dangle-earrings,/products/feminine-pear-diamond-drop-earrings
/products/green-gemstone-emerald-round-line-earrings,/products/imperial-emerald-stones-drop-earrings
/products/hexa-silque-dangling-earrings,/products/hexa-cut-silque-drop-earrings
/products/hexa-loop-dangling-earrings,/products/hive-diamond-loop-dangle-earrings
/products/portuguese-curve-dangling-earrings,/products/fluid-portuguese-solitaire-drop-earrings
/products/double-halo-diamond-drop-earrings,/products/double-halo-solitaire-drop-earrings
/products/round-diamond-floral-dangling-earrings,/products/aster-pave-diamond-dangle-earrings
/products/diamond-loop-dangling-earrings,/products/pendulum-round-diamond-dangle-earrings
/products/gold-diamond-heart-stud-earrings,/products/twisted-heart-drop-diamond-stud-earrings
/products/glint-swing-dangling-earrings,/products/glint-swing-diamond-dangling-earrings
/products/gold-diamond-heart-pendant,/products/twisted-heart-drop-diamond-pendant-necklace
/products/hollow-oval-dangle-earrings,/products/ellipse-round-diamond-dangle-earrings
/products/celestial-layered-necklace,/products/celestial-round-diamond-layered-necklace
/products/marquise-pear-diamond-cluster-necklace,/products/exquisite-marquise-pear-diamond-cluster-necklace
/products/loop-diamond-dangle-earrings,/products/loop-round-diamond-dangle-earrings
/products/dual-halo-dangle-earrings,/products/dual-halo-diamond-dangle-earrings
/products/halo-kite-diamond-earrings,/products/etherea-round-diamond-dangle-earrings
/products/litline-dangling-earrings,/products/litline-round-diamond-dangling-earrings
/products/petalic-pear-round-diamond-floral-dangle-earrings,/products/petalic-round-diamond-dangle-earrings
/products/twinkle-tear-drop-dangling-earrings,/products/glimmer-round-diamond-dangle-earrings
/products/princess-cut-diamond-mens-stud,/products/luminous-princess-cut-solitaire-mens-stud
/products/emerald-cut-diamond-mens-stud,/products/sophisticated-emerald-cut-solitaire-mens-stud
/products/star-motif-diamond-nose-pin,/products/stellar-round-diamond-nose-pin
/products/1-25ct-round-diamond-mens-stud,/products/timeless-round-solitaire-mens-stud
/products/prong-set-heart-nose-pin,/products/cherish-heart-diamond-nose-pin
/products/cushion-cut-diamond-mens-stud,/products/delicate-cushion-cut-diamond-mens-stud
/products/round-diamond-pinwheel-nose-pin,/products/pinwheel-round-diamond-nose-pin
/products/honeycomb-diamond-nose-pin,/products/honeycomb-round-diamond-nose-pin
/products/0-88ct-round-diamond-mens-stud,/products/elegant-round-solitaire-mens-stud
/products/chandrika-bali-nose-pin,/products/pallavi-diamond-bali-nose-pin
/products/1-55ct-round-diamond-mens-stud,/products/contemporary-round-solitaire-mens-stud
/products/marq-diamond-nose-pin,/products/leaflet-round-diamond-nose-pin
/products/four-petal-flower-solitaire-nose-pin,/products/bloom-round-diamond-nose-pin
/products/stellar-petal-nose-pin,/products/fleur-round-diamond-nose-pin
/products/flower-motif-nose-pin,/products/graceful-round-diamond-nose-pin
/products/the-loving-heart-diamond-nose-pin,/products/eternal-heart-round-diamond-nose-pin
/products/0-510ct-marquise-bezel-diamond-ring,/products/0-51ct-marquise-bezel-diamond-ring
/products/1ct-half-eternity-bezel-diamond-band,/products/0-22ct-half-eternity-bezel-diamond-band
/products/trio-nose-pin,/products/trio-round-diamond-nose-pin
/products/mens-round-solitaire-diamond-stud,/products/half-bezel-round-solitaire-mens-stud
/products/cluster-nose-pin,/products/cluster-round-diamond-nose-pin
/products/round-diamond-teardrop-nose-pin,/products/aura-round-diamond-nose-pin
/products/petal-nose-pin,/products/petal-round-diamond-nose-pin
/products/six-prong-diamond-nose-pin,/products/elegant-round-diamond-nose-pin
/products/blossom-nose-pin,/products/blossom-round-diamond-nose-pin
/products/round-diamond-prong-set-nose-pin,/products/timeless-round-diamond-nose-pin
/products/seven-stone-rosette-nose-pin,/products/rosette-round-diamond-nose-pin
/products/classic-diamond-nose-pin,/products/classic-round-diamond-nose-pin
/products/marquise-bloom-diamond-nose-pin,/products/trinity-marquise-diamond-nose-pin
/products/round-diamond-floral-nose-pin,/products/dazzling-round-diamond-nose-pin
/products/heart-solitaire-nose-pin,/products/eros-round-diamond-nose-pin
/products/round-diamond-half-moon-nose-pin,/products/moonbeam-round-diamond-nose-pin
/products/0-50ct-round-diamond-mens-stud,/products/dazzling-round-solitaire-mens-stud
/products/pave-diamond-kite-nose-pin,/products/kite-pave-diamond-nose-pin
/products/triple-oval-halo-diamond-mangalsutra-necklace,/products/divine-trio-oval-halo-diamond-mangalsutra
/products/pear-halo-diamond-mangalsutra-necklace,/products/contemporary-pear-halo-diamond-mangalsutra
/products/baguette-round-halo-pendant,/products/captivating-baguette-round-halo-pendant
/products/round-diamond-heart-nose-pin,/products/heartstrings-round-diamond-nose-pin
/products/baguette-round-halo-earrings,/products/captivating-baguette-round-halo-earrings
/products/diamond-star-nose-pin,/products/twinkle-round-diamond-nose-pin
/products/diamond-flower-clover-pendant,/products/clover-flower-pave-diamond-pendant
/products/five-pointed-star-nose-pin,/products/luminary-round-diamond-nose-pin
/products/diamond-flower-clover-stud-earrings,/products/clover-flower-pave-diamond-studs
/products/0-54-carat-six-prong-solitaire-engagement-ring,/products/dual-tone-round-solitaire-engagement-ring
/products/hexagon-solitaire-nose-pin,/products/hexa-round-diamond-nose-pin
/products/round-diamond-0-50-ct-dual-gold-accent-ring,/products/intertwined-two-tone-round-solitaire-ring
/products/round-diamond-marquise-accent-gold-ring,/products/distinctive-round-solitaire-accent-ring
/products/round-diamond-heart-cluster-nose-pin,/products/embrace-pave-diamond-nose-pin
/products/triangle-round-diamond-nose-pin,/products/triad-round-diamond-nose-pin
/products/pinwheel-motif-nose-pin,/products/twirl-round-diamond-nose-pin
/products/marquise-halo-pave-diamond-engagement-ring,/products/graceful-marquise-halo-solitaire-engagement-ring
/products/oval-halo-diamond-engagement-ring,/products/sophisticated-oval-halo-solitaire-engagement-ring
/products/marquise-cut-double-diamond-threader-earrings,/products/dynamic-marquise-diamond-sui-dhaga-earrings
/products/split-shank-diamond-solitaire-ring,/products/split-shank-round-solitaire-ring
/products/round-diamond-pave-set-gold-ring-5-20mm,/products/ever-bound-round-diamond-pave-ring
/products/pear-cut-bezel-diamond-threader-earrings,/products/teardrop-diamond-sui-dhaga-earrings
/products/round-halo-diamond-threader-earrings,/products/ethereal-diamond-sui-dhaga-earrings
/products/round-diamond-accent-ring,/products/round-diamond-solitaire-accent-ring
/products/elegant-sui-dhaga-earrings,/products/amulet-round-diamond-sui-dhaga-earrings
/products/six-prong-solitaire-engagement-ring-6-80mm,/products/knief-edge-round-solitaire-engagement-ring
/products/diamond-threader-earrings,/products/beloved-diamond-sui-dhaga-earrings
/products/oval-cut-diamond-bezel-threader-earrings,/products/minimalist-oval-diamond-sui-dhaga-earrings
/products/four-prong-solitaire-engagement-ring-8-00mm,/products/four-prong-round-solitaire-engagement-ring
/products/dewdrop-cluster-diamond-stud-earrings,/products/dewdrop-cluster-diamond-dangle-earrings
/products/infinity-twist-diamond-blossom-ring,/products/eternal-twist-round-solitaire-ring
/products/gold-hexagon-diamond-dangle-earrings,/products/equinox-round-diamond-dangle-earrings
/products/four-prong-oval-cut-engagement-ring-7-80mm,/products/timeless-oval-cut-engagement-ring
/products/round-diamond-pave-band-ring-5-70mm,/products/eternal-round-solitaire-pave-ring
/products/royal-pear-gemstone-dangling-earrings,/products/royal-verdant-gemstones-drop-earrings
/products/round-diamond-drop-earrings,/products/round-solaris-drop-earrings
/products/trio-marquise-pear-round-solitaire-mangalsutra,/products/trinity-marquise-pear-round-solitaire-mangalsutra
/products/trio-marquise-pear-round-diamond-mangalsutra,/products/trio-marquise-pear-round-solitaire-mangalsutra
/s/100f99,https://www.lucirajewelry.com/?utm_campaign=100f99&utm_source=shareable_link
/s/490cc3,https://www.lucirajewelry.com/?utm_campaign=490cc3&utm_source=shareable_link
/s/549f3f,https://www.lucirajewelry.com/?utm_campaign=549f3f&utm_source=shareable_link
/pages/types-of-diamond-shapes,/pages/diamond-shapes
/products/bracelet-chain-copy,/products/bracelet-chain-charm
/products/6-05ct-delicate-round-diamond-tennis-bracelet-copy,/products/bracelet-chain-test
/pages/category-landing-page,/pages/lab-grown-diamond
/products/auralink-diamond-ring,/products/aura-link-diamond-ring
/products/round-linka-diamond-ring,/products/round-link-diamond-ring
/products/hexa-mirage-diamond-ring,/products/mirage-hexa-diamond-ring
/collections/engagement-rings-for-couples-1,/collections/princess-cut-engagement-rings
/products/elara-marquise-solitaire-and-round-diamond-ring,/products/elara-marquise-solitaire-round-diamond-ring
/collections/all-charm-pendants,/collections/all-charms-pendants
/collections/all-charmspendants,/collections/all-charm-pendants
/collections/dlt-page,/collections/jewelry
/collections/engagement-rings-platinum,/collections/engagement-ring
/products/j-hoop-enamel-earrings,/products/cotton-candy-j-hoop-earrings
/products/blue-enamel-evil-eye-diamond-ring,/products/evil-eye-diamond-ring
/products/blue-enamel-swirl-diamond-pendant,/products/cotton-candy-swirl-diamond-pendant
/products/cotton-candy-diamond-enamel-pendant,/products/cotton-candy-sparkle-pendant
/products/pebble-enamel-solitaire-diamond-stud-earrings,/products/cotton-candy-solitaire-pebble-diamond-stud-earrings
/products/the-interstellar-studs,/products/the-cotton-candy-interstellar-studs
/products/the-interstellar-pendant,/products/the-cotton-candy-interstellar-pendant
/products/pear-and-round-diamond-enamel-earring,/products/cotton-candy-sparkle-earrings
/products/pear-round-diamond-kite-pendant-with-pink-enamel,/products/cotton-candy-diamond-kite-pendant
/products/the-penta-solitaire-diamond-stud-earrings,/products/cotton-candy-penta-stud-earrings
/products/pear-and-round-diamond-enamel-pendant,/products/cotton-candy-diamond-enamel-pendant
/products/blue-enamel-swirl-diamond-earrings,/products/cotton-candy-swirl-diamond-earrings
/products/pear-bloom-enamel-earrings,/products/cotton-candy-pear-earrings
/collections/rose-gold-diamond-necklace-1,/collections/rose-gold-diamond-necklace
/pages/gst-calculator,/pages/gst-on-gold-rates-in-india
/products/emerald-radiance-pendant,/products/solitaire-emerald-radiance-pendant
/pages/astro-gemstone-page,/pages/gemstone-jewelry-for-zodiac-signs
/products/victory-round-diamond-v-ring,/products/victory-diamond-ring
/products/circle-of-grace-diamond-pendant-necklace,/products/grace-diamond-pendant-necklace
/products/hexa-portuguese-diamond-chain-bracelet,/products/hexa-round-diamond-chain-bracelet
/products/rosette-round-diamond-stud-earrings,/products/rosette-diamond-stud-earrings
/products/lattice-rhombus-round-diamond-stud-earrings,/products/lattice-rhombus-diamond-stud-earrings
/products/golden-ray-kite-round-diamond-stud-earrings,/products/golden-ray-kite-diamond-stud-earrings
/products/starlight-swirl-round-diamond-stud-earrings,/products/starlight-swirl-diamond-stud-earrings
/products/teardrop-bloom-round-diamond-stud-earrings,/products/teardrop-bloom-diamond-stud-earrings
/products/celestial-floral-round-diamond-stud-earrings,/products/celestial-floral-diamond-stud-earrings
/products/square-cluster-round-diamond-hoops-earrings,/products/square-cluster-diamond-hoops-earrings
/products/the-hexa-frame-round-diamond-stud-earrings,/products/the-hex-frame-round-diamond-stud-earrings
/products/circle-of-grace-round-diamond-pendant-necklace,/products/circle-of-grace-diamond-pendant-necklace-1
/products/twinkle-tear-round-diamond-drop-earrings,/products/twinkle-tear-drop-dangling-earrings
/collections/globofilter-best-selling-products-index,/collections
/collections/fast-shipping-rings-1,/collections/fast-shipping-rings
/collections/earring,/collections/earrings
/collections/bestsellers-pendants,/collections/trending-necklaces
/collections/test-bestseller,/collections/bestseller
/collections/drops,/collections/all-earrings
/collections/tanzanite-hexagon,/collections/hexa
/collections/solitaires-platinum,/collections/solitaire-rings
/collections/engagement-rings-gemstone,/collections/engagement-ring
/collections/single-stud,/collections/stud-earrings
/collections/frontpage,/collections
/collections/ear-cuffs,/collections/all-earrings
/collections/charm-bracelets,/collections/all-bracelets
/collections/engagement-rings-bridal-sets,/collections/engagement-ring
/collections/oval-bracelets,/collections/cuff-bracelets
/collections/teenage-collection,/collections/sports-collection
/collections/wedding-rings-plain,/collections/wedding-rings
/collections/hoop-charms,/collections/hoop-earrings
/collections/wedding-rings-pave-bands,/collections/wedding-rings
/collections/solitaires-bridal-sets,/collections/solitaire-engagement-rings
/collections/bangles,/collections/all-bracelets
/collections/our-picks-bracelets,/collections/trending-bracelets
/collections/our-picks-rings,/collections/trending-rings
/collections/wedding-rings-couple-bands,/collections/wedding-rings
/products/0-75-ct-solitaire-diamond-timeless-stations-bracelet,/products/tetragem-trio-solitaire-chain-bracelet
/products/golden-interlink-round-diamond-bracelet,/products/golden-interlink-diamond-bracelet
/products/radiant-round-diamond-tennis-bracelet,/products/round-radiance-tennis-bracelet-1
/products/geometric-grid-round-diamond-pendant,/products/geometric-grid-diamond-pendant
/products/pear-marquise-diamond-petal-flower-pendant-necklace,/products/pear-marquise-diamond-flower-petal-pendant-necklace
/products/triangle-frame-round-diamond-pendant-necklace,/products/triangle-frame-diamond-pendant-necklace
/products/starlight-swirl-round-diamond-pendant-necklace,/products/starlight-swirl-diamond-pendant-necklace
/products/0-60-ct-marquise-diamond-wing-pendant-necklace,/products/0-60-ct-solitaire-marquise-diamond-pendant-necklace
/products/trio-frame-round-diamond-pendant-necklace,/products/trio-frame-diamond-pendant-necklace
/products/0-50-ct-pear-round-diamond-cascade-hoops-earrings,/products/0-50-ct-pear-solitaire-cascade-hoops-earrings
/products/golden-rosette-round-diamond-stud-earrings,/products/rosette-round-diamond-stud-earrings
/products/radiant-pear-round-diamond-stud-earrings,/products/luminous-pear-round-diamond-stud-earrings
/products/adjustable-double-bar-diamond-ring,/products/double-bar-diamond-ring
/products/the-star-and-circle-diamond-gap-ring,/products/the-star-and-oval-diamond-gap-ring
/products/diamond-curve-geometric-gold-ring,/products/curve-diamond-geometric-ring
/products/a,/products/celestial-cascade-diamond-mangalsutra
/products/b,/products/solitaire-bezel-set-diamond-pendant
/collections/trending,/collections/trendings
/products/blue-enamel-evil-eye-and-diamond-accent-charm-pendant,/products/blue-evil-eye-diamond-pendant
/products/the-hexaframe-diamond-earrings,/products/the-hexframe-diamond-earrings
/products/the-hexaframe-diamond-pendant,/products/the-hexframe-diamond-pendant
/collections/engagement-rings-side-stone,/collections/side-stone-engagement-rings
/products/bypass-ring-with-floral-motif,/products/floral-motif-bypass-ring
/products/marquise-and-round-diamond-harmony-pendant,/products/marquise-round-diamond-harmony-pendant
/products/hamsa-hand-round-diamond-pendant,/products/hamsa-hand-diamond-pendant
/products/the-entwined-ribbon-round-diamond-pendant,/products/the-entwined-ribbon-diamond-pendant
/products/modernist-shield-round-diamond-pendant,/products/modernist-shield-diamond-pendant
/products/shimmering-circles-round-diamond-earrings,/products/shimmering-circles-diamond-earrings
/products/forever-round-diamond-stud-earrings,/products/forever-diamond-stud-earrings
/products/floating-diamond-teardrop-pendant,/products/floating-diamond-teardrop-mangalsutra
/products/cotton-candy2,/products/cotton-candy-hexdiamond-earrings
/products/pear-and-round-diamond-floral-dangle-earrings,/products/petalic-pear-round-diamond-floral-dangle-earrings
/products/inner-outer-diamond-hoops,/products/inner-outer-diamond-hoops-earrings
/products/bezel-set-emerald-shape-diamond-earrings,/products/bezel-set-emerald-diamond-earrings
/products/pear-and-round-diamond-flower-stud-earrings,/products/petalic-flora-diamond-earrings
/products/duolume-diamond-pendant-necklace,/products/petalic-duolume-diamond-pendant-necklace
/products/serene-pear-round-diamond-pendant-necklace,/products/petalic-serene-pear-round-diamond-pendant-necklace
/products/serene-pear-round-diamond-ring,/products/petalic-serene-pear-round-diamond-ring
/products/pear-round-petallic-diamond-ring,/products/petalic-pear-round-diamond-ring
/products/halo-petal-pendant,/products/halo-petal-pendant-necklace
/products/round-diamond-chain-bracelet,/products/classic-round-diamond-chain-bracelet
/products/round-diamond-ladder-stud-earrings,/products/round-diamond-ladder-hoop-earrings
/products/round-diamond-floral-drop-earrings,/products/round-diamond-floral-dangling-earrings
/products/half-bezel-claw-prong-set-luminious-round-shape-solitaire-pendant-necklace,/products/portuguese-solitaire-half-bezel-pendant-necklace
/products/half-bezel-claw-prong-set-luminious-round-shape-solitaire-ring,/products/portuguese-solitaire-half-bezel-diamond-ring
/products/half-bezel-claw-prong-set-luminious-round-shape-solitaire-earring,/products/portuguese-solitaire-half-bezel-earrings
/products/round-portuges-cut-diamond-mens-stud,/products/mens-round-solitaire-diamond-stud
/products/delicate-tenz-hexa-diamond-stud-earrings,/products/hexa-smallitaires-half-bezel-earrings
/products/delicate-tenz-hexagon-diamond-pendant-necklace,/products/hexa-solitaire-half-bezel-pendant-necklace
/products/solitaire-tenz-hexagon-shape-diamond-ring,/products/hexa-solitaire-half-bezel-diamond-ring
/products/0-30-cts-constellation-lab-grown-diamond-ring-main-18-08-25-copy,/products/0-30-cts-constellation-lab-grown-diamond-ring-child-18-08-25
/collections/engagement-rings-1-49-1-99,/collections/engagement-rings-1-50-1-99
/products/open-floral-round-diamond-ring,/products/open-floral-diamond-ring
/products/triple-halo-round-diamond-cluster-ring,/products/triple-halo-round-diamond-cluster-earrings
/collections/womens-engagement-rings,/collections/engagement-rings-for-women
/products/classic-marquise-round-cut-diamond-trilogy-ring,/products/classic-pear-round-cut-diamond-trilogy-ring
/products/round-clover-diamond-pendant,/products/tri-round-diamond-pendant
/products/round-diamond-solitaire-bail-pendant,/products/round-diamond-bail-pendant
/products/chain-detailing-round-solitaire-ring,/products/chain-detailing-round-diamond-ring
/products/gold-and-diamond-rectangular-hoops,/products/gold-diamond-rectangular-hoops-earrings
/products/dome-diamond-hoops,/products/dome-diamond-hoops-earrings
/products/butterfly-diamond-hoops,/products/butterfly-diamond-hoops-earrings
/products/curved-diamond-hoops-with-center-cluster,/products/curved-cluster-diamond-hoop-earrings
/products/0-50-carat-six-prong-solitaire-engagement-ring,/products/0-54-carat-six-prong-solitaire-engagement-ring
/products/six-prong-diamond-nose-stud,/products/six-prong-diamond-nose-pin
/products/heart-solitaire-nose-stud,/products/heart-solitaire-nose-pin
/pages/terms-condition-new,/pages/terms-condition
/pages/shipping-policy-new,/pages/shipping-policy
/pages/supplier-code-of-conduct-new,/pages/supplier-code-of-conduct
/pages/privacy-policy-new,/pages/privacy-policy
/products/green-gemstone-emerald-round-line-earinngs,/products/green-gemstone-emerald-round-line-earrings
/collections/solitaires-round,/collections/solitaire-round
/products/cluster-leaf-diamond-pendant,/products/cluster-leaf-diamond-pendant-necklace
/products/round-curved-diamond-wedding-band,/products/round-curved-diamond-casual-ring
/products/spherical-diamond-stud-earrings,/products/spherical-diamond-hoops-earrings
/products/round-cluster-diamond-stud-earrings,/products/spherical-diamond-stud-earrings
/products/marquise-diamond-cross-pendant-necklace-1,/products/marquise-diamond-floral-pendant-necklace
/products/pear-diamond-cross-pendant-necklace,/products/marquise-diamond-cross-pendant-necklace-1
/collections/wedding-rings-1-49-1-99,/collections/wedding-rings-1-50-1-99
/products/round-solitaire-knife-edge-engagement-ring-7-mm,/products/celestia-halo-engagement-ring
/pages/gold-rate,/pages/mumbai-gold-rate-today
/collections/studs,/collections/stud-earrings
/products/sleek-twisted-solitaire-ring,/products/sleek-twisted-mens-solitaire-ring
/collections/hoops,/collections/hoop-earrings
/products/men-s-dual-tone-round-cut-diamond-band,/products/mens-dual-tone-round-cut-diamond-band
/products/hexa-halo-two-tone-engagement-ring,/products/two-tone-mens-round-diamond-engagement-ring
/products/dual-tone-square-round-cut-band-7-50mm,/products/men-s-dual-tone-round-cut-diamond-band
/products/titan-round-diamond-ring,/products/titan-round-mens-diamond-ring
/collections/fast-shipping-1,/collections/fast-shipping
/products/bloom-diamond-engagement-ring,/products/bloom-diamond-wedding-ring
/collections/r,/collections/rakhi
/products/stackable-emerald-cut-engagement-ring,/products/stackable-emerald-cut-wedding-ring
/products/round-cut-stackable-diamond-engagement-ring,/products/round-cut-stackable-diamond-wedding-ring
/products/pear-shaped-and-halo-round-diamond-stackable-engagement-ring,/products/pear-shaped-and-halo-round-diamond-stackable-wedding-ring
/products/0-966ct-heart-diamond-stackable-ring,/products/2-82ct-heart-diamond-stackable-ring
/products/solitaire-round-shape-diamond-engagement-ring-1-00-cts,/products/solitaire-round-shape-diamond-engagement-ring-1-30-cts
/pages/media_brief,/pages/featured-in
/products/solitaire-emerald-shape-diamond-engagement-ring-1-00-cts,/products/solitaire-emerald-shape-diamond-engagement-ring
/products/radiant-baguette-round-diamond-pendant,/products/baguette-round-diamond-pendant
/products/round-1-008ct-diamond-eternity-band,/products/round-1-00-ct-diamond-eternity-band
/products/1-30-cts-solitaire-round-cut-spiral-setting-ring,/products/1-30-ct-solitaire-round-cut-spiral-setting-ring
/collections/cushion-engagement-rings,/collections/engagement-rings-cushion
/collections/engagement-rings-mens,/collections/mens-engagement-rings
/collections/engagement-rings-womens,/collections/womens-engagement-rings
/collections/engagement-rings-trilogy,/collections/trilogy-engagement-rings
/collections/engagement-rings-toi-moi,/collections/toi-et-moi-engagement-rings
/collections/engagement-rings-halo,/collections/halo-engagement-rings
/collections/engagement-rings-solitaire,/collections/solitaire-engagement-rings
/collections/wedding-rings-mens,/collections/mens-wedding-rings
/collections/wedding-rings-womens,/collections/womens-wedding-rings
/collections/wedding-rings-cushion,/collections/cushion-wedding-rings
/collections/wedding-rings-gemstone,/collections/gemstone-wedding-rings
/collections/wedding-rings-eternity,/collections/eternity-wedding-rings
/collections/wedding-rings-stackable,/collections/stackable-wedding-rings
/pages/video_call_pdp,/pages/video-call
/products/radiant-cut-hidden-halo-engagement-ring,/products/cushion-cut-engagement-ring
/products/stackable-round-cut-solitaire-engagement-ring,/products/stackable-round-cut-solitaire-wedding-ring
/products/0-280ctoval-round-diamond-toi-et-moi-ring,/products/0-28ct-oval-round-diamond-toi-et-moi-ring
/products/0-37-carat-princess-diamond-mens-classic-ring,/products/princess-cut-diamond-mens-classic-ring
/pages/custom-engagement-ring,/pages/customized-jewelry
/collections/solitaire,/collections/engagement-rings-solitaire
/products/0-4ct-emerald-round-toi-moi-ring,/products/0-4ct-emerald-round-toi-et-moi-ring
/products/marquise-round-toi-moi-ring,/products/marquise-round-toi-et-moi-ring
/products/1-198ct-oval-round-toi-moi-ring,/products/1-198ct-oval-round-toi-et-moi-ring
/products/0-318ct-round-toi-moi-ring,/products/0-318ct-round-toi-et-moi-ring
/products/pear-and-round-diamond-toi-moi-ring,/products/pear-and-round-diamond-toi-et-moi-ring
/products/0-52ct-emerald-oval-round-shape-diamond-toi-moi-ring,/products/0-52ct-emerald-oval-round-shape-diamond-toi-et-moi-ring
/products/0-540ct-oval-round-diamond-toi-moi-ring,/products/0-540ct-oval-round-diamond-toi-et-moi-ring
/products/0-280ctoval-round-diamond-toi-moi-ring,/products/0-280ctoval-round-diamond-toi-et-moi-ring
/products/0-340ct-emerald-round-diamond-toi-moi-ring,/products/0-340ct-emerald-round-diamond-toi-et-moi-ring
/products/0-450ct-heart-round-diamond-toi-moi-ring,/products/0-450ct-heart-round-diamond-toi-et-moi-ring
/products/marquise-and-emerald-toi-moi-engagement-ring,/products/marquise-and-emerald-toi-et-moi-engagement-ring
/collections/jewlery-engament-rings,/collections/engagement-ring
/products/1-50-cts-marquise-shape-engagement-ring-with-hidden-halo-setting,/products/1-63-cts-marquise-shape-engagement-ring-with-hidden-halo-setting
/products/2-50-cts-radiant-cut-hidden-halo-engagement-ring,/products/radiant-cut-hidden-halo-engagement-ring
/products/2-00-cts-round-solitaire-tulip-setting-engagement-ring,/products/round-solitaire-tulip-setting-engagement-ring
/products/1-25-cts-pear-cut-diamond-engagement-ring,/products/1-45-cts-pear-cut-diamond-engagement-ring
/products/1-25-cts-marquise-cut-diamond-engagement-ring,/products/1-45-cts-marquise-cut-diamond-engagement-ring
/products/0-90-cts-marquise-diamond-crossover-micro-pave-engagement-ring,/products/marquise-diamond-crossover-micro-pave-engagement-ring
/products/1-10-cts-oval-diamond-crossover-micro-pave-engagement-ring,/products/oval-diamond-crossover-micro-pave-engagement-ring
/products/1-25-cts-pear-diamond-crossover-micro-pave-engagement-ring,/products/pear-diamond-crossover-micro-pave-engagement-ring
/products/2-cts-princess-shape-diamond-with-halo-setting-ring,/products/princess-shape-diamond-with-halo-setting-ring
/products/round-diamond-channel-eternity-band-0-385ct,/products/0-38ct-round-diamond-channel-eternity-band
/products/men-s-two-tone-solitaire-enagement-band,/products/0-30ct-men-s-two-tone-solitaire-enagement-band
/collections/new-arrivals-rings-1,/collections/new-arrivals-rings
/collections/luxemangalsutra-necklace,/collections/mangalsutra-necklaces
/collections/huggies,/collections/sui-dhagas
/collections/test-new-arrivals,/collections/new-arrivals
/products/half-eternity-oval-diamond-band-0-68ct-1,/products/half-eternity-oval-diamond-band-0-68ct
/collections/gift-under-30-000,/collections/gift-under-50-000
/collections/our-picks-rings-1,/collections/our-picks-rings`;

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Helper to make Shopify requests with rate-limit handling (429)
async function shopifyRequest(url, options, retries = 10) {
  for (let i = 0; i < retries; i++) {
    // Ensure we have a User-Agent to avoid 406/security blocks
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 429) {
      // Shopify usually returns Retry-After header in seconds
      const retryAfter = parseInt(response.headers.get('Retry-After')) || 2;
      console.warn(`⚠️ Rate limited by Shopify. Waiting ${retryAfter} seconds... (Attempt ${i + 1}/${retries})`);
      await sleep(retryAfter * 1000);
      continue;
    }
    
    return response;
  }
  throw new Error(`Max retries reached for ${url}`);
}

// Simple CSV parser that handles basic quotes
function parseCsv(content) {
  const lines = content.split('\n');
  const results = [];
  const header = lines[0].toLowerCase();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma, but handle potential quoted values (simple version)
    let parts = [];
    if (line.includes('"')) {
      // Very basic regex for quoted CSV parts
      parts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      parts = parts.map(p => p.replace(/^"|"$/g, '').trim());
    } else {
      parts = line.split(',').map(p => p.trim());
    }

    if (parts.length >= 2) {
      results.push({ path: parts[0], target: parts[1] });
    }
  }
  return results;
}

async function importRedirects() {
  let csvContent = '';
  const args = process.argv.slice(2);
  // Default to the file mentioned by the user, or allow override via arg
  const filePath = args[0] || 'redirects_export_1 (1).csv';

  if (fs.existsSync(filePath)) {
    console.log(`Reading from file: ${filePath}`);
    csvContent = fs.readFileSync(filePath, 'utf8');
  } else {
    console.log(`File "${filePath}" not found. Using hardcoded fallback data.`);
    csvContent = fallbackCsvData;
  }

  const redirects = parseCsv(csvContent);
  console.log(`Extracted ${redirects.length} redirects. Starting import...`);

  if (!ADMIN_TOKEN || !MONGODB_URI) {
    console.error("Missing ADMIN_TOKEN or MONGODB_URI in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("next_local_db");
    const collection = db.collection("redirects");

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const r of redirects) {
      try {
        console.log(`[${successCount + failCount + skippedCount + 1}/${redirects.length}] Processing: ${r.path} -> ${r.target}`);
        
        // 1. Try to create in Shopify
        const response = await shopifyRequest(`https://${SHOP_DOMAIN}/admin/api/2024-10/redirects.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Shopify-Access-Token': ADMIN_TOKEN
          },
          body: JSON.stringify({
            redirect: {
              path: r.path,
              target: r.target
            }
          })
        });

        let data;
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error(`❌ Non-JSON response (Status: ${response.status}) for ${r.path}:`, text);
          failCount++;
          continue;
        }

        if (response.ok) {
          const shopifyRedirect = data.redirect;
          // 2. Save to MongoDB
          await collection.updateOne(
            { path: shopifyRedirect.path },
            { 
              $set: {
                shopifyId: shopifyRedirect.id,
                path: shopifyRedirect.path,
                target: shopifyRedirect.target,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );
          successCount++;
          console.log(`✅ Success`);
        } else {
          // Handle existing redirect (path already taken)
          if (data.errors && data.errors.path && data.errors.path.some(e => e.includes("already been taken"))) {
            console.log(`ℹ️ Redirect already exists in Shopify for ${r.path}. Updating local DB...`);
            await collection.updateOne(
              { path: r.path },
              { $set: { target: r.target, updatedAt: new Date() } },
              { upsert: true }
            );
            skippedCount++;
          } else {
            console.error(`❌ Failed:`, JSON.stringify(data.errors));
            failCount++;
          }
        }

        // Add a small delay between successful requests to be safe
        // (even with 429 handling, it's better to stay just under the limit)
        await sleep(250); // 4 calls per second = 250ms delay

      } catch (err) {
        console.error(`❌ Error for ${r.path}:`, err.message);
        failCount++;
      }
    }

    console.log(`\nImport completed.`);
    console.log(`Total: ${redirects.length}`);
    console.log(`Success (New): ${successCount}`);
    console.log(`Success (Updated/Existing): ${skippedCount}`);
    console.log(`Failed: ${failCount}`);

  } catch (error) {
    console.error("Critical error:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

importRedirects();
