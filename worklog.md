---
Task ID: 1
Agent: main
Task: Fix Switch toggle animation for RTL

Work Log:
- Replaced Radix UI Switch with custom button-based toggle
- Custom toggle uses `dir="ltr"` to force LTR thumb behavior
- Inactive: thumb at left, gray background (#gray-300)
- Active: thumb slides right, gold background (#C9A96E)
- Smooth 300ms transition on both thumb position and background color

Stage Summary:
- `/src/components/ui/switch.tsx` - Complete rewrite with custom RTL-friendly toggle
---
Task ID: 2
Agent: main
Task: Create image upload API and ImageUpload component

Work Log:
- Created `/src/app/api/upload/route.ts` - POST endpoint accepting FormData
- Validates file type (jpeg, png, webp, gif, svg) and size (max 5MB)
- Saves to `public/uploads/` with unique filenames
- Returns `{ url: "/uploads/filename" }`
- Created `/src/components/shared/ImageUpload.tsx` - Reusable component
- Supports click-to-upload and drag-and-drop
- Shows preview with change/remove buttons
- Shows loading spinner during upload

Stage Summary:
- Upload API at `/api/upload`
- Reusable ImageUpload component for all admin managers
---
Task ID: 3
Agent: main
Task: Create seed data and populate database

Work Log:
- Created `prisma/seed.ts` with all initial data
- Admin user: admin / admin123 (bcrypt hashed)
- 2 hero slides, 5 categories, 6 products, 4 testimonials, 5 FAQs, 5 Instagram images
- 14 site settings (brand, contact, social)
- 2 page contents (about, contact)
- Ran seed successfully

Stage Summary:
- Database fully populated with Persian content
---
Task ID: 4
Agent: main
Task: Move admin to /admin route, remove from footer

Work Log:
- Created `/src/app/admin/page.tsx` as separate admin route
- Admin token persisted in localStorage
- Updated `src/app/page.tsx` to remove admin handling
- Updated `src/components/layout/Footer.tsx` to remove admin link and Settings import
- Updated `src/types/index.ts` to remove 'admin' from PageView
- Updated `src/lib/store.ts` to remove admin navigation

Stage Summary:
- Admin accessible at `/admin` (separate route)
- No admin link in footer
- Token persistence via localStorage
---
Task ID: 5
Agent: main
Task: Update AdminLayout with site preview toggle

Work Log:
- Added "مشاهده سایت" (View Site) link in sidebar
- Added "مشاهده سایت" button in header
- Links open `/` in new tab via `target="_blank"`

Stage Summary:
- Admin can preview site via sidebar link and header button
---
Task ID: 6
Agent: subagent (full-stack-developer)
Task: Update all admin managers

Work Log:
- Removed all `?XTransformPort=3000` from 11 files
- Added ImageUpload component to SlidesManager, CategoriesManager, ProductsManager, InstagramManager
- All admin managers now use direct `/api/admin/*` routes
- Zero lint errors after changes

Stage Summary:
- No more XTransformPort in codebase
- Image upload integrated into 4 managers
---
Task ID: 7
Agent: subagent (full-stack-developer)
Task: Update SettingsManager with princess logo and credentials

Work Log:
- Added princess logo upload section at top of settings (bound to `princess_logo_url`)
- Added admin credentials change section at bottom
- Created `/api/admin/auth/change-credentials/route.ts`
- Validates current password with bcrypt, checks duplicate username, hashes new password

Stage Summary:
- Princess logo uploadable in settings
- Admin can change username and password
---
Task ID: 8
Agent: main
Task: Create useSiteData hook

Work Log:
- Created `/src/hooks/useSiteData.ts`
- Fetches all site data from `/api/site` endpoint
- Returns `{ data, loading, refetch }`
- Created `/src/types/siteData.ts` for shared type
- Created `/src/lib/transformApiProduct.ts` for product data transformation

Stage Summary:
- Centralized data fetching hook
- Shared SiteData type across all components
---
Task ID: 9
Agent: subagent (full-stack-developer)
Task: Update home components to use API data

Work Log:
- Updated page.tsx to use useSiteData hook and pass data as props
- Added loading spinner while fetching
- Updated Hero, CategorySection, FeaturedProducts, Testimonials, FAQSection, InstagramGallery
- All components accept props instead of static imports from @/data
- formatPrice utility still imported from @/data

Stage Summary:
- All home sections now display database-driven content
- Fallback data provided when API returns empty results
---
Task ID: 10
Agent: subagent (full-stack-developer)
Task: Update page components to use API data

Work Log:
- Updated ProductsPage, CategoriesPage, ProductDetailPage, AboutPage, ContactPage
- All accept `siteData: SiteData` prop
- ProductsPage transforms API data using shared utility
- AboutPage uses pageContents for hero text and dynamic content
- ContactPage uses settings for contact info and POSTs form to /api/contact
- Fixed AboutPage/ContactPage props passing in page.tsx

Stage Summary:
- All pages display database-driven content
- Contact form submits to backend API
---
Task ID: 11
Agent: main
Task: Browser verification

Work Log:
- Verified homepage renders all sections with API data (slides, categories, 6 products, testimonials, FAQs, instagram)
- Verified admin panel at /admin with login (admin/admin123)
- Verified all admin menu items present
- Verified settings page has princess logo upload, all settings fields, and credentials change
- Verified slides dialog has image upload instead of URL input
- Verified footer has no admin panel link
- Verified dev log shows no errors
- All API routes return 200

Stage Summary:
- Full end-to-end verification passed
- Homepage, admin panel, all features working---
Task ID: 12
Agent: main
Task: Comprehensive admin panel fixes - hydration, product toggles, settings linking, footer management

Work Log:
- Fixed hydration mismatch: Replaced simple `mounted` boolean with 3-state `AuthState` enum ('loading'|'unauthenticated'|'authenticated'), added server-side token verification via new `/api/admin/auth/verify` endpoint, used `requestAnimationFrame` to defer synchronous setState in effect
- Fixed product page action buttons: Root cause was Prisma API receiving extra fields (e.g. `categoryName`) from `...p` spread. Added `ALLOWED_FIELDS` whitelist filter in `/api/admin/products/[id]/route.ts` PUT handler
- Added `invalidateAllTokens()` to auth.ts, called after credential change to force re-login
- Renamed "لوگوی پرنسس (تصویر طلایی P)" to "تصویر لوگو" in SettingsManager
- Linked logo upload to Navbar and Footer: Both components now accept `siteData` prop and use `settings.princess_logo_url || settings.logo_url || '/favicon.png'` for the logo image
- Linked contact info settings to Footer: phone, email, address, working_hours all read from `siteData.settings` with fallbacks
- Linked brand info to Footer: brand name and description read from settings
- Linked social media settings to Footer: Instagram, Telegram, WhatsApp links use `settings.instagram_url`, `settings.telegram_url`, `settings.whatsapp`
- Linked WhatsApp button to settings: Uses `settings.whatsapp` for the wa.me link
- Removed duplicate "View Site" button: Only one remains in sidebar (removed target="_blank")
- Added footer customer service content management in SettingsManager: Full CRUD for FooterServiceItems with add/edit/delete/toggle
- Made phone number copyable on click in footer: Click triggers `navigator.clipboard.writeText()` with toast notification
- Updated page.tsx to pass siteData to Navbar, Footer, and WhatsAppButton
- Created `/api/admin/auth/verify` GET endpoint for server-side token validation

Stage Summary:
- Zero lint errors
- Zero hydration warnings
- Zero console errors
- Product toggle switches verified working (both activate and deactivate)
- Admin panel loads correctly with token validation
- All settings linked to frontend components
- Footer services manageable from admin settings

---
Task ID: 13
Agent: main
Task: Apply 10-point fix list (sidebar, price input, images, size/color, navbar, contact, footer pages, save buttons, comments)

Work Log:
- Fixed admin sidebar disappearing bug: removed AnimatePresence+layoutId janky animation, replaced with simple conditional styling; kept "View Site" opening in new tab
- Updated prisma schema: added slug + content (JSON sections) to FooterServiceItem so each footer item is a full page
- Updated types (index.ts PageView + 'footer-page', siteData.ts, store.ts selectedFooterPageSlug, useSiteData.ts) to support dynamic footer pages
- Rewrote ProductsManager: price input now uses string state with comma formatting (600000 -> 600,000), allows deleting 0 completely, prevents leading zeros; removed main price field (originalPrice input), kept price + discount %, shows calculated discounted price dynamically; replaced JSON images input with multi-file uploader (main image always first, reorderable); replaced JSON sizes/colors inputs with selectable badge UI + add-new inputs (color picker included); cart data includes sizes/colors via existing transformApiProduct
- Updated transformApiProduct to compute discounted price = base * (1 - discount/100) so frontend shows final price as main and base as strikethrough
- Updated SettingsManager: added nav_categories_label editable field in Brand group; extended footer service item dialog to full CRUD with H1 title + URL slug + dynamic H3 sections (title + content) list
- Updated MessagesManager: added phone field to Message interface; message cards now show red border/dot (unread) or green (read); message details dialog shows phone number row and read/unread status
- Updated ContactPage: added GET /api/contact?email=... to fetch user's sent messages; shows sent messages below the form with Red=Unread / Green=Read status badges
- Created FooterPage component and wired into page.tsx router (footer-page PageView)
- Updated Navbar: replaced static navItems (Products) with dynamic items using categoriesLabel from settings (nav_categories_label)
- Updated Footer: footer service items now navigate to footer-page view via handleFooterPage(slug)
- Updated API routes: contact GET (return user messages), footer-services POST/PUT (whitelist fields), products POST (whitelist fields)
- Global backspace fix for "0": changed all admin number inputs (order, productCount, rating, reviewCount) to use value={n || ''} so 0 shows empty and backspace works; price/discount in ProductsManager use full string-based comma formatting
- All admin sections keep explicit Save buttons (no auto-save of form input); added clear English comments throughout
- Re-seeded database with new footer service items (slug + content) and nav_categories_label setting

Stage Summary:
- Admin sidebar no longer disappears on click
- Product price input: comma formatting, no leading zeros, backspace clears 0, dynamic discounted price
- Product images: multi-file uploader, main image always first
- Product sizes/colors: selectable badge UI with add-new capability
- Navbar shows "Categories" (label editable in Admin Settings)
- Contact page shows user's sent messages with red/green read status
- Admin messages show phone in details with red/green status
- Footer items link to dynamic footer pages (full CRUD in SettingsManager with H1/H3/content)
- All number inputs allow backspace on 0
- Save buttons present in all admin sections; no auto-save
- Clear English comments added to key files

---
Task ID: 14
Agent: main
Task: Audit & verify e-commerce + Zarinpal payment integration against strict spec

Work Log:
- Verified AUTH default storefront credentials in src/hooks/useAuth.ts: abcd@email.com / abcd123 (seeded into localStorage on first load)
- Verified CART: ProductCard has "افزودن به سبد" (Add to Cart); useCart hook supports addItem/increase/decrease/remove with localStorage persistence (perancess_cart)
- Verified CHECKOUT (src/components/pages/CheckoutPage.tsx): auth gate forces login/registration before continuing; phone validation /^0\d{10}$/ (11 digits, starts with 0); address collected as SEPARATED fields (province, city, street, alley, plate) with input guides — never one comma string
- Verified SAVE USER INFO: /api/payment/request upserts a Customer (Prisma) keyed by email and links the Order to it
- Verified ZARINPAL (src/lib/zarinpal.ts): merchant_id read from NEXT_PUBLIC_ZARINPAL_MERCHANT_ID env (never hardcoded); .env has placeholder "YOUR_MERCHANT_ID"
- Verified /api/payment/request: server-side validation, computes total server-side, creates PENDING order, requests Authority, returns StartPay redirect URL
- Verified /api/payment/verify: verifies with Zarinpal; ON SUCCESS marks order success + stores refId; ON FAILURE deletes the pending order (no order kept for failed payments)
- Verified ORDER model (prisma/schema.prisma): Customer + Order + OrderItem with userId relation, structured address, paymentStatus (pending|success|failed), orderStatus (preparing|shipping|delivered, default preparing), createdAt
- Verified ADMIN ORDERS (src/components/admin/OrdersManager.tsx + /api/admin/orders): lists all SUCCESSFUL orders, shows user info/products/total/payment status; status Select updates DB instantly with optimistic UI + rollback on error; Orders tab wired in AdminLayout/AdminPanel
- Verified USER PROFILE (src/components/pages/ProfilePage.tsx): "سفارش‌های من" (My Orders) fetches /api/orders?email=... — user can ONLY see their own successful orders (security filter by email)
- Verified /payment/result callback page: success/failure messages, clears cart on success, handles verification + network errors
- Ran `npm install` (Prisma client generated) and `npm run build`: compiled successfully, all 33 routes built with ZERO errors

Stage Summary:
- All strict spec requirements present and consistent on top of Perancess_Boutique_Update_V2
- Tech stack unchanged (Next.js 16 + Prisma + SQLite); no features broken; UI/UX consistent
- Production build passes with zero errors

---
Task ID: 15
Agent: main
Task: Zarinpal sandbox mode + rebuild Admin Orders + per-product Free Shipping / 7-Day Return toggles

Work Log:
ZARINPAL SANDBOX MODE (task 1):
- src/lib/zarinpal.ts already branches on `process.env.ZARINPAL_SANDBOX === 'true'`:
  - Request -> https://sandbox.zarinpal.com/pg/v4/payment/request.json
  - Verify  -> https://sandbox.zarinpal.com/pg/v4/payment/verify.json
  - StartPay -> https://sandbox.zarinpal.com/pg/StartPay/
  - Otherwise production endpoints (api.zarinpal.com + www.zarinpal.com)
- Enabled it for testing: set ZARINPAL_SANDBOX="true" in .env (existing payment logic untouched)

ORDERS SECTION (rebuilt src/components/admin/OrdersManager.tsx):
- Replaced the old dashboard-style cards with a clickable orders LIST (customer name, #id, date, total, item count, status badge)
- Each order opens a details MODAL (Dialog) showing Customer Info (first/last name, email, phone),
  Address (province, city, street, alley, plate), Order Items (name, code, color, size, quantity, unit price, line total),
  plus Order Status control (preparing/shipping/delivered), Payment status, Total Price, Order Date, Zarinpal RefID
- Status change is optimistic, updates list + modal instantly, syncs via PUT /api/admin/orders/[id], reverts on error

VARIANT CAPTURE (color/size into orders):
- prisma OrderItem: added color + size (String default "")
- useCart CartItem: optional color/size; ProductDetailPage passes selected color name + size to addItem
- CheckoutPage: sends color/size in /api/payment/request items; route persists them on OrderItem

PRODUCTS SECTION (per-product perks):
- prisma Product: freeShipping + returnGuarantee (Boolean default false)
- admin products API POST + PUT [id]: added both to ALLOWED_FIELDS
- ProductsManager: added fields to interface, emptyForm, openEdit, buildPayload; two Switch toggles in create/edit form
- types/index.ts + types/siteData.ts + transformApiProduct: propagate the two flags
- ProductDetailPage: perk badges (Truck "ارسال رایگان", RotateCcw "۷ روز ضمانت بازگشت") under Add to Cart when active
- ProductCard: compact perk badges under price when active
- seed.ts: enabled perks on 2 demo products

VERIFICATION:
- prisma db push + reseed OK (color/size on OrderItem, freeShipping/returnGuarantee on Product; demo perks persisted)
- npm run build: compiled successfully, all 33 routes, ZERO errors

Stage Summary:
- Zarinpal sandbox testing enabled without breaking production logic
- Orders section fully functional (list -> detail modal with full customer/address/item data + live status control)
- Admin can toggle Free Shipping and 7-Day Return per product; shown on storefront in existing icon+text style
- No existing features broken; build passes

---
Task ID: 16
Agent: main
Task: Payment system — fake/real modes, crash fix, env parsing, server validation

Work Log:
- src/lib/zarinpal.ts: added readEnv() that trims + strips surrounding quotes; SANDBOX and getMerchantId() now use it so ZARINPAL_SANDBOX==='true' and merchantId==='YOUR_MERCHANT_ID' checks work regardless of quoting
- src/app/api/payment/request/route.ts:
  - FAKE MODE (merchantId === 'YOUR_MERCHANT_ID'): skips Zarinpal, creates order with paymentStatus 'success', authority 'MOCK-'+orderId, refId 'MOCK', returns { success:true, mock:true, url:'/payment/result?Status=OK&Authority=MOCK-<id>' }
  - REAL MODE: pending order + Zarinpal request (sandbox endpoints when enabled); existing /verify keeps order on success, deletes on failure
  - Server-side validation before order creation: name, lastName, email, phone (^0\d{10}$), address (province/city/street/plate); invalid -> 400
  - Whole handler wrapped in try/catch; catch logs console.error('PAYMENT ERROR:', error) and returns { success:false, message:'Payment failed' } status 500
  - merchant_id never hardcoded; env vars only
- Did not touch admin, orders system (beyond payment saving), UI, or /payment/result page; no route.ts added under /payment/result
- npm run build: compiled successfully, zero errors
