# Collection Listing Page Implementation

## Overview
A complete product collection listing page has been implemented in the Next.js Lucira project using the Shopify Storefront API. The implementation includes:

- [x] Server-side product fetching with Shopify GraphQL
- [x] Client-side filtering and sorting
- [x] Pagination with "Load More" button
- [x] Responsive design (mobile + desktop)
- [x] Product cards with color variants
- [x] Filter sheet for mobile devices
- [x] Sort dropdown for multiple options

---

## Architecture

### 1. **Shopify API Client** (`src/lib/shopify.js`)
Provides two main functions:
- `shopifyStorefrontFetch()` - Public Storefront API (product queries)
- `shopifyAdminFetch()` - Admin API (product counts)

### 2. **API Routes**

#### `/api/collection?handle=...` (Storefront Query)
Fetches paginated products from a collection with filters and sorting.

**Query Parameters:**
- `handle` - Collection slug (required)
- `limit` - Products per page (default: 20)
- `cursor` - Pagination cursor
- `sort` - Sort key: `best_selling`, `price_low_high`, `price_high_low`, `az`
- `filters` - JSON string of selected filters

**Response:**
```json
{
  "products": [...],
  "filters": {
    "Color": [{"label": "Red", "count": 5, "input": "..."}],
    "Size": [...]
  },
  "pageInfo": {
    "hasNextPage": true,
    "endCursor": "..."
  },
  "totalProducts": 42
}
```

#### `/api/collection/filters?handle=...` (Filters Only)
Lightweight endpoint to fetch available filters for a collection (10 min cache).

### 3. **Client Page** (`src/app/products/page.js`)
Main collection listing page with:
- Filter sidebar (desktop)
- Filter sheet (mobile via `Sheet` component)
- Sort dropdown
- Product grid (responsive columns)
- Infinite scroll with "Load More" button
- Applied filter counter

### 4. **ProductCard Component** (`src/components/product/ProductCard.jsx`)
Displays individual products with:
- Product image with hover zoom
- Title and price
- Discount badge (if applicable)
- Stock status
- Color swatches (interactive)
- Reviews (star rating + count fetched from `/api/reviews`)
- "Add to Cart" button (conditionally rendered via `showAddToCart` prop, which defaults to `true`)

### 5. **API Helpers** (`src/lib/api.js`)
New export functions:
- `fetchCollectionProducts()` - Fetch products with filters/sort
- `fetchCollectionFilters()` - Fetch filters for a collection

### 6. **Navigation** (`src/components/header/Navbar.jsx`)
Updated navbar items to link to collection pages:
```javascript
<Link href={`/products?handle=${menu.slug}`}>
  {menu.label}
</Link>
```

---

## Usage

### Access a Collection
Navigate to `/products?handle=collection-slug` or click any navbar category.

**Example URLs:**
- `/products?handle=rings`
- `/products?handle=earrings`
- `/products?handle=engagement-bridal`

### Query Products Programmatically
```javascript
import { fetchCollectionProducts } from "@/lib/api";

const data = await fetchCollectionProducts({
  handle: "rings",
  limit: 20,
  sort: "price_low_high",
  filters: JSON.stringify({ "Color": [{ label: "Gold", input: "..." }] })
});
```

### Fetch Filters
```javascript
import { fetchCollectionFilters } from "@/lib/api";

const { filters } = await fetchCollectionFilters("rings");
```

---

## Shopify GraphQL Queries

### CollectionProducts Query
Fetches products with pagination, sorting, filtering:
```graphql
query CollectionProducts(
  $handle: String!
  $first: Int!
  $after: String
  $sortKey: ProductCollectionSortKeys
  $reverse: Boolean
  $filters: [ProductFilter!]
)
```

Includes:
- Product title, handle, featured image
- All variants with price, availability, options
- Product and variant images
- Compare-at prices

### CollectionProductCount Query
Fetches total product count per collection (via Admin API).

---

## Features

### Sorting
- **Best Selling** - Default sort
- **Price: Low to High**
- **Price: High to Low**
- **A to Z** (by title)

### Filtering
Filters are dynamically fetched from Shopify and displayed as:
- Desktop: Left sidebar checkboxes
- Mobile: Bottom sheet with same UI

Each filter option shows:
- Label (e.g. "Red Gold", "Size 6")
- Count of products with that variant
- Checkbox for selection

### Pagination
- Initial load: 20 products
- "Load More" button fetches next page
- Cursor-based pagination (Shopify native)
- Shows product count (e.g. "Showing 40 of 150")

### Responsive Design
- **Mobile:** Single column, mobile filter sheet, compact toolbar
- **Tablet:** 2-column grid
- **Desktop:** 3-column grid + filter sidebar

---

## Environment Variables Required

```env
NEXT_PUBLIC_STOREFRONT_TOKEN=your_storefront_token
SHOPIFY_ADMIN_TOKEN=your_admin_token
```

Currently hardcoded in `src/lib/shopify.js`:
```javascript
const SHOP = "luciraonline";
```

---

## Component Dependencies

- `Button` - From UI library
- `Sheet/SheetContent/SheetHeader/SheetTitle/SheetTrigger` - From UI library
- `Checkbox` - From UI library
- `Input` - From UI library
- `Loader` - Custom component at `src/components/common/Loader.jsx`
- `Header` - Custom component
- `ProductCard` - Custom component

---

## Future Enhancements

1. **Price Range Slider** - Add min/max price filter
2. **Search** - Integrate search functionality
3. **Wishlist** - Add to wishlist from card
4. **Reviews** - Display product ratings
5. **Quick View** - Modal preview without navigation
6. **Save Filters** - Remember user's filter selections
7. **URL State** - Persist filters/sort in URL query params
8. **SEO** - Generate dynamic meta tags per collection

---

## Testing Checklist

- [ ] Load `/products?handle=rings` - should show ring products
- [ ] Click a category in navbar - should navigate to that collection
- [ ] Select a filter - products should update
- [ ] Change sort option - products should reorder
- [ ] Click "Load More" - should append next page
- [ ] Click product card - should navigate to product detail
- [ ] Click color swatch - should update variant preview
- [ ] Test on mobile - filters should show in sheet

---

## File Structure

```text
src/
|-- app/
|   |-- products/
|   |   `-- page.js                 # Collection listing page
|   `-- api/
|       `-- collection/
|           |-- route.js            # Products endpoint
|           `-- filters/route.js    # Filters endpoint
|-- components/
|   |-- product/
|   |   |-- ProductCard.jsx         # Product card component
|   |   `-- ...
|   |-- header/
|   |   `-- Navbar.jsx              # Category navigation
|   `-- ...
|-- lib/
|   |-- shopify.js                  # Shopify API client
|   |-- api.js                      # Fetch helpers
|   `-- ...
`-- hooks/
    `-- useCollectionFilters.js     # Custom hook

server/ (Express - if integrated)
|-- routes/
|   |-- collection.js
|   |-- collectionFilters.js
|   `-- collectionFilters-varient.js
`-- utils/
    `-- shopifyStorefrontClient.js
```

---

## Notes

- The Expo app (`expo-app/lucira-app`) has similar collection logic in `server/routes/collection.js` - this Next.js version mirrors that pattern for web.
- Filters are cached for 10 minutes on the server to reduce Shopify API calls.
- Product counts are cached separately (10 min TTL).
- All Shopify GraphQL calls use API version `2024-10`.

---

## Search Logic

### Current Search Behavior
- Header search (`/api/search`) and listing/search page results (`/api/products/search`) now share the same search intent logic from `src/lib/search.js`.
- Search is **title-first**:
  - First try to match all keywords in `title`.
  - If title matches exist, only those results are used.
  - If title matches do not exist, fallback fields are used.
- Fallback fields are:
  - `title`
  - `type`
  - `tags`
  - `collectionHandles`
- Simple singular/plural handling is included, so terms like `chain` can also match `chains`.
- Price intent is still supported:
  - `under 30k`
  - `below 5000`
  - `above 20k`
  - `more than 1 lakh`

### Why This Was Added
- Prevent broad metadata matches from outranking direct product-title matches.
- Example:
  - Searching `chain` should prefer products with `chain` in the title.
  - Only if no title matches exist should other metadata like tags or product type widen the search.

### Main Files
- `src/lib/search.js`
- `src/app/api/search/route.js`
- `src/app/api/products/search/route.js`
- `src/app/api/products/filters/route.js`

---

## Checkout Address Logic

### Shipping Page
- The protected shipping page now loads customer addresses directly from Shopify using the logged-in `customerAccessToken` cookie.
- New API route:
  - `src/app/api/customer/addresses/route.js`
- Supported actions:
  - Fetch addresses
  - Create address
  - Update address
  - Delete address
  - Set default address

### Address Display Rules
- If the customer has no saved address:
  - show the shipping address form directly
- If the customer has saved addresses:
  - show address cards first
  - show up to 2 cards in the main grid
  - show `More addresses (N)` below the cards when additional addresses exist
- Selecting an address from the `More addresses` popup:
  - updates Shopify default address
  - updates local checkout state
  - reflects on both shipping and payment pages

### Add / Edit / Delete Rules
- Add new address opens a popup form.
- Edit opens the same popup with prefilled values.
- Delete is available:
  - on visible cards
  - inside the popup list
- Email and phone are intentionally not editable in address forms because login/identity already owns those values.

### Payment Page Summary Rules
- `Contact` no longer has a change button.
- `Ship to` uses the selected Shopify address and can be changed in-page via a popup instead of redirecting to shipping.
- Changing shipping address from payment:
  - sets Shopify default address
  - updates payment summary immediately
  - persists when returning to shipping page
- `Shipping method`:
  - has no change button
  - shows `FREE` only when shipping country is `India`
  - otherwise shows `Calculated at next step`

### Main Files
- `src/app/api/customer/addresses/route.js`
- `src/app/(checkout-flow)/(protected)/checkout/shipping/page.js`
- `src/app/(checkout-flow)/(protected)/checkout/payment/page.js`
- `src/lib/api.js`

---

## Work Log & Remaining Tasks

### 2026-04-01: Route Protection & Checkout Reorganization
- [x] Created `src/app/(protected)/layout.js` to handle authentication for all private routes.
- [x] Moved `/dashboard` to `src/app/(protected)/dashboard` for protection.
- [x] Created `/admin` segment at `src/app/(protected)/admin` and moved profile there.
- [x] Reorganized checkout flow:
  - `/checkout/cart`: Publicly accessible.
  - `/checkout/shipping`: Protected (requires login).
  - `/checkout/payment`: Protected (requires login).
- [x] Created protected `/success` and `/failure` pages.
- [x] Cleaned up redundant layouts and route groups (`(admin)`, `(checkout)`).
- [x] Restructured layouts for different sections:
  - Moved homepage to `(frontend)` for full header/footer.
  - Created `(checkout-flow)` group for cart/shipping/payment with a minimal `CheckoutHeader`.
  - Created `DashboardHeader` and `AdminHeader` for their respective protected sections.
  - Updated `RootLayout` to be clean and only contain global providers.
- [x] Added `CheckoutProtectedLayout` to handle authentication for shipping/payment.
- [x] Implemented the Cart page (`/checkout/cart`):
  - Created `CartItem` component with detailed product specs and trust badges.
  - Created `CartSummary` component with subtotal, discounts, and total calculations.
  - Implemented `VoucherDrawer` using shadcn `Sheet` to show and apply coupons.
  - Added sticky mobile footer for the "Place Order" action.
  - Balanced the layout with a 2-column grid on desktop.
- [x] Redesigned checkout flow with Shopify-style aesthetics:
  - Unified 65/35 split for all checkout pages.
  - Added light gray background (`#FAFAFA`) to the sticky right sidebar section.
  - [x] Maintained white background for the left form/content section.
  - [x] Applied consistent padding and gap using `container-main`.
  - [x] Integrated sticky behavior for `CartSummary` and `CheckoutSummary` on desktop.

### 2026-04-02: Persistent Cart & Authentication Integration
- [x] Implemented persistent cart storage using MongoDB to support both guest and logged-in users.
- [x] Created native API routes (`/api/cart/add`, `/api/cart/get`, `/api/cart/remove`, `/api/cart/merge`) for full cart lifecycle management.
- [x] Integrated Redux Toolkit with `redux-persist` and custom async thunks (`addToCart`, `fetchCart`, `removeFromCart`, `mergeCart`) replacing Shopify Storefront cart logic.
- [x] Added Magento-style guest cart merging upon successful user login.
- [x] Updated Product Detail Page (`ProductPageClient.jsx`) to dispatch full product payloads (including variants, engraving) to the Redux store.
- [x] Implemented real-time cart count badge in the main header.
- [x] Updated the Cart Page (`/checkout/cart`) to display an "Empty Cart" state with a "Shop Now" redirect when empty.
- [x] Integrated authentication check on the "Place Order" button; guests are prompted with a login dialog, while authenticated users proceed to `/checkout/shipping`.
- [x] Normalized cart identity handling so guest carts use browser-only session IDs while logged-in carts are persisted by `userId` only.
- [x] Fixed guest-to-user cart merge and logged-in add-to-cart replacement rules so matching variants replace old entries instead of incrementing quantity.
- [x] Added dynamic cart item status and local item updates:
  `In Stock` items are locked, `Made to Order` items allow size/quantity changes, and cart totals update without a full cart reload.
- [x] Moved React Toastify to a single client-side global provider to prevent duplicate containers and runtime errors.
- [x] Stopped automatic cart/header repricing; stored cart prices now remain stable while browsing.
- [x] Added checkout-only cart repricing via `/api/cart/checkout`, persisting recalculated prices back to MongoDB when the user enters checkout.
- [x] Added a checkout toast notice when prices are actually changed during checkout repricing.

### 2026-04-03: Search Relevance + Shopify Addressed Checkout
- [x] Added shared search intent logic in `src/lib/search.js` for header search, product search, and search filters.
- [x] Changed product search to title-first matching with fallback to type/tags/collection fields only when title matches are absent.
- [x] Added singular/plural keyword expansion for more natural product-title matching.
- [x] Implemented Shopify customer address CRUD via `src/app/api/customer/addresses/route.js`.
- [x] Updated shipping page to:
  - load saved addresses from Shopify
  - support add/edit/delete/select-default
  - show up to 2 visible cards plus a `More addresses` popup
- [x] Updated payment page to:
  - show live contact + selected shipping address
  - open address selection popup in-page
  - persist selected address as Shopify default across checkout pages
  - show `FREE` shipping only for India addresses

  ### dashboard-user-v1 10-04-2026- latest branch
