# Invoiceify — Product Requirements Document (PRD)

## 1. Product Overview

**Invoiceify** is a free online invoicing tool that lets freelancers, contractors, and small businesses create, manage, and download professional invoices and commercial documents — while passively building an anonymized, aggregated dataset of economic activity (the flywheel data engine).

**The user gets:** A genuinely useful, beautiful, 100% free invoicing tool.
**We get:** Complete, raw, unfiltered invoice data from every single submitted document — every field, every line item, every business name, every amount. This is the entire point of the platform. The data is stored in full and is viewable by us (the platform operators) via an internal admin panel. Nothing is anonymized on our end — we see everything.

---

## 2. Design Direction

Heavy inspiration from [invoice-template.com](https://invoice-template.com/). Match the following:

### Color Palette
| Token | Color | Usage |
|-------|-------|-------|
| `primary` | Dark Teal `#003B4D` | Header, footer, primary backgrounds |
| `primary-light` | Teal `#00667A` | Hover states, secondary elements |
| `accent` | Green/Teal `#00A67E` | CTA buttons, active states, success |
| `background` | White `#FFFFFF` | Page background, card backgrounds |
| `surface` | Light Gray `#F5F7F9` | Card backgrounds, input backgrounds |
| `text-primary` | Dark `#1A1A2E` | Headings, body text |
| `text-secondary` | Gray `#6B7280` | Labels, helper text, placeholders |
| `border` | Light Gray `#E5E7EB` | Card borders, dividers, input borders |

### Typography
- Clean, modern sans-serif (Inter or similar)
- Headings: Bold, large
- Body: Regular weight, good readability

### Layout
- White card-based UI with subtle shadows/borders
- Generous whitespace
- Responsive — works on mobile, tablet, desktop
- Wizard/stepper UI for document creation (horizontal step indicator at top)

### Logo
- Simple icon (document/receipt icon) + "Invoiceify" wordmark
- Dark teal icon on white, or white on dark teal for dark backgrounds

---

## 3. Core User Flow

### 3.1 Landing Page
- Hero section with the invoice generator wizard embedded (or prominent CTA to start)
- "How to create invoices in 3 steps" section:
  1. Enter the data
  2. Choose the template
  3. Download the PDF
- Template showcase (grid of 6 visual template styles)
- Features section:
  - PDF invoice ready to send
  - Customizable invoice templates
  - Variety of commercial documents
  - Access from any device
  - Manage the status of each invoice (paid, unpaid, overdue)
  - Receive automatic reports by email
- FAQ section
- Footer (dark teal background) with page links

### 3.2 Invoice Creation Wizard (4-Step Flow)
The core of the app. A horizontal stepper at the top: **Document → Content → Items → Template**

#### Step 1: Document
Choose the document type to generate (grid of selectable cards with icons):

| Document Type | Icon | Description |
|---------------|------|-------------|
| Invoice | Receipt icon | Standard invoice for goods or services |
| Tax Invoice | Receipt + tax icon | Invoice with tax/VAT breakdown |
| Proforma Invoice | Document icon | Pre-sale invoice / price quote before delivery |
| Receipt | Checkmark receipt | Proof of payment received |
| Sales Receipt | Shopping bag | Receipt for retail/product sales |
| Cash Receipt | Cash/money icon | Receipt confirming cash payment |
| Quote | Quote bubble icon | Price quotation for potential work |
| Estimate | Calculator icon | Cost estimate for a project |
| Credit Note | Minus/credit icon | Document reducing amount owed |
| Purchase Order | Cart/order icon | Formal request to purchase goods/services |
| Delivery Note | Truck/delivery icon | Confirmation of goods delivered |

User selects one → clicks "Continue →"

Right side panel shows a live PDF preview that updates as the user fills in data.

#### Step 2: Content
Depending on document type selected, show relevant fields. See Section 4 for per-document field specifications.

**Common fields across all document types:**

**FROM (Sender/Your Business):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Business Name | text | Yes | Your company/business name |
| Owner/Contact Name | text | No | Individual name |
| Email | email | Yes | Business email |
| Phone | tel | No | Business phone |
| Address Line 1 | text | Yes | Street address |
| Address Line 2 | text | No | Suite, unit, floor |
| City | text | Yes | City |
| State/Province | text | No | State or province |
| Postal/ZIP Code | text | Yes | Postal code |
| Country | select | Yes | Country dropdown |
| Tax ID / VAT Number | text | No | Tax identification number |
| Logo | file upload | No | Business logo (PNG, JPG, SVG) |

**TO (Recipient/Client):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Client/Business Name | text | Yes | Recipient company or individual |
| Contact Name | text | No | Contact person name |
| Email | email | No | Client email |
| Phone | tel | No | Client phone |
| Address Line 1 | text | Yes | Street address |
| Address Line 2 | text | No | Suite, unit, floor |
| City | text | Yes | City |
| State/Province | text | No | State or province |
| Postal/ZIP Code | text | Yes | Postal code |
| Country | select | Yes | Country dropdown |
| Tax ID / VAT Number | text | No | Client tax ID (for tax invoices) |

**DOCUMENT META:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Document Number | text (auto-generated) | Yes | e.g., INV-001, QUO-001 |
| Issue Date | date | Yes | Date the document is created |
| Due Date | date | Conditional | When payment is due (invoices only) |
| Currency | select | Yes | USD, EUR, GBP, AUD, CAD, JPY, CHF, etc. |
| Notes | textarea | No | Additional notes for the recipient |
| Terms & Conditions | textarea | No | Payment terms, late fees, policies |

#### Step 3: Items (Line Items)
A dynamic table where the user adds rows:

| Column | Type | Description |
|--------|------|-------------|
| Description | text | What the item/service is |
| Quantity | number | Number of units or hours |
| Unit Price / Rate | currency | Price per unit or hourly rate |
| Tax (%) | number | Tax rate for this line (optional, toggleable) |
| Discount | number | Discount amount or % (optional, toggleable) |
| Line Total | calculated | Auto: quantity × rate - discount + tax |

**Summary section below the table:**
| Field | Calculated |
|-------|------------|
| Subtotal | Sum of all line totals (before tax) |
| Discount | Total discount applied |
| Tax | Total tax amount |
| **Total** | **Grand total amount due** |

Add Item button (+) to add more rows. Delete (x) on each row.

#### Step 4: Template
Choose from 6+ visual template designs:
| Template | Style |
|----------|-------|
| Template 1 | Classic — clean lines, traditional layout |
| Template 2 | Modern — bold header, contemporary feel |
| Template 3 | Minimal — lots of whitespace, simple |
| Template 4 | Corporate — professional, structured |
| Template 5 | Creative — slightly playful, colors |
| Template 6 | Dark — dark header/accents, sleek |

Each template is shown as a preview thumbnail. Click to select.

**Actions available:**
- **Preview** — full-size PDF preview in browser
- **Download PDF** — download the completed document
- **Print** — send to printer
- **Save** — save to user's account (if logged in)

---

## 4. Document Type Specifications

Each document type shares the common fields from Step 2 above. Below are the **additional/unique fields and behaviors** per type.

### 4.1 Invoice (Standard)
- **Purpose:** Request payment for goods or services rendered
- **Unique Fields:** Due date, payment terms
- **Numbering:** INV-XXXX
- **Label on document:** "INVOICE"
- **Status tracking:** Draft → Sent → Paid / Overdue

### 4.2 Tax Invoice
- **Purpose:** Invoice with explicit tax/VAT breakdown (required in many countries)
- **Unique Fields:** Tax ID (sender, required), Tax ID (recipient), tax rate per line item, tax breakdown summary showing each tax rate and its total
- **Numbering:** TINV-XXXX
- **Label on document:** "TAX INVOICE"
- **Additional behavior:** Tax column is always visible and required. Summary shows tax breakdown by rate.

### 4.3 Proforma Invoice
- **Purpose:** Preliminary invoice sent before goods are delivered or services are completed. Not a demand for payment — it's a commitment to deliver at the stated price.
- **Unique Fields:** Validity period (e.g., "Valid for 30 days"), expected delivery date
- **Numbering:** PI-XXXX
- **Label on document:** "PROFORMA INVOICE"
- **Note on document:** "This is not a tax invoice / demand for payment"

### 4.4 Receipt
- **Purpose:** Proof that payment has been received
- **Unique Fields:** Payment date, payment method (Cash, Card, Bank Transfer, Check, PayPal, Other), amount received, receipt number
- **Numbering:** REC-XXXX
- **Label on document:** "RECEIPT"
- **Key difference:** No "due date" — payment has already happened. Shows "PAID" status.

### 4.5 Sales Receipt
- **Purpose:** Receipt for retail/product sales (point-of-sale style)
- **Unique Fields:** Payment method, transaction/reference number, items sold (with SKU if applicable)
- **Numbering:** SR-XXXX
- **Label on document:** "SALES RECEIPT"
- **Key difference:** More product-focused. Line items emphasize product names, SKUs, quantities.

### 4.6 Cash Receipt
- **Purpose:** Specifically confirms cash payment was received
- **Unique Fields:** Amount received in cash, change given (if any), received by (name)
- **Numbering:** CR-XXXX
- **Label on document:** "CASH RECEIPT"
- **Key difference:** Payment method is always "Cash". Includes "Received by" signature field.

### 4.7 Quote
- **Purpose:** Formal price quotation for work or goods before the client commits
- **Unique Fields:** Quote validity period (e.g., "Valid until [date]"), acceptance terms, optional client signature/acceptance area
- **Numbering:** QUO-XXXX
- **Label on document:** "QUOTE"
- **Key difference:** No due date. Not a demand for payment. Can be converted to an invoice.
- **Action:** "Convert to Invoice" button (copies all data into a new Invoice)

### 4.8 Estimate
- **Purpose:** Rough cost estimate for a project (less binding than a quote)
- **Unique Fields:** Estimate validity period, scope description (textarea for detailed project scope)
- **Numbering:** EST-XXXX
- **Label on document:** "ESTIMATE"
- **Key difference:** Similar to Quote but explicitly labeled as an estimate (not binding). Can be converted to Quote or Invoice.
- **Action:** "Convert to Quote" / "Convert to Invoice" buttons

### 4.9 Credit Note
- **Purpose:** Reduces the amount a client owes (issued when goods are returned, overcharge, etc.)
- **Unique Fields:** Original invoice reference number, reason for credit (dropdown: Returned Goods, Overcharge, Damaged Goods, Service Not Provided, Other), credit amount
- **Numbering:** CN-XXXX
- **Label on document:** "CREDIT NOTE"
- **Key difference:** Amounts are negative/credited. References an original invoice.

### 4.10 Purchase Order
- **Purpose:** Formal request from a buyer to a seller to supply goods/services at agreed prices
- **Unique Fields:** PO number, requested delivery date, shipping address (if different from billing), shipping method, payment terms, authorized by (name/signature)
- **Numbering:** PO-XXXX
- **Label on document:** "PURCHASE ORDER"
- **Key difference:** Sender is the BUYER, not the seller. "Ship To" section added. Represents intent to purchase, not a bill.

### 4.11 Delivery Note
- **Purpose:** Accompanies goods being delivered, confirming what was shipped
- **Unique Fields:** Delivery date, shipping method, tracking number, package count, weight (gross/net), delivered by (name), received by (name/signature)
- **Numbering:** DN-XXXX
- **Label on document:** "DELIVERY NOTE"
- **Key difference:** No prices/totals shown. Only describes what items and quantities were delivered. References a PO or Invoice number.
- **Line items columns:** Description, Quantity Ordered, Quantity Delivered, Notes

---

## 5. Industry-Specific Invoice Presets

When a user selects "Invoice" in Step 1, offer an optional sub-selection to pre-fill relevant fields and labels. These are NOT separate document types — they're presets/templates that customize the standard invoice.

| Preset | Pre-filled Labels | Typical Line Items |
|--------|-------------------|--------------------|
| **Freelance** | "Services Provided" | Project name, hours, hourly rate |
| **Contractor** | "Work Completed" | Labor, materials, equipment |
| **Consultant** | "Consulting Services" | Advisory hours, strategy sessions |
| **Hourly Rate** | Shows hours × rate | Task descriptions with hours logged |
| **Service** | "Services Rendered" | Service descriptions, flat or hourly |
| **Sales / Retail** | "Items Sold" | Product name, SKU, quantity, unit price |
| **Medical** | "Medical Services" | Procedure, CPT code, provider, charges |
| **Photography** | "Photography Services" | Shoot type, editing hours, prints |
| **Rental** | "Rental Charges" | Property/item, rental period, rate |
| **Repair** | "Repair Services" | Diagnostics, parts, labor |
| **Hotel** | "Accommodation" | Room type, nights, room service, amenities |
| **Design** | "Design Services" | Design work, revisions, deliverables |
| **IT / Tech** | "IT Services" | Support hours, software, hardware |
| **Artist** | "Artwork / Commission" | Piece description, medium, size |
| **Commercial / Shipping** | Adds export fields | HS codes, country of origin, weight, incoterms |

When a preset is selected, it adjusts:
- Default line item column headers
- Placeholder text in fields
- Any additional fields specific to that industry (e.g., Medical adds CPT code column, Commercial adds HS code, weight, incoterms)

---

## 6. User Accounts & Dashboard

### 6.1 Authentication
- Sign up with email + password or Google OAuth
- Optional — users CAN create documents without an account, but saving/tracking requires login
- Guest users: generate and download PDFs without signing up (lowers friction, maximizes usage)

### 6.2 Dashboard (Logged-In Users)
**Sidebar navigation:**
- Dashboard (overview)
- Documents (list all)
- Clients (address book)
- Settings

**Dashboard overview:**
- Total documents created
- Revenue summary (total invoiced, total paid, total outstanding)
- Recent documents list
- Quick-create button

**Documents list:**
- Filterable by: type, status, date range, client
- Sortable by: date, amount, status
- Status badges: Draft, Sent, Paid, Overdue, Cancelled
- Actions per row: View, Edit, Duplicate, Download PDF, Delete

**Clients:**
- Saved client profiles (auto-saved from invoices)
- Name, email, address, total invoiced, total paid
- Click to see all documents for that client

**Settings:**
- Business profile (name, address, logo, tax ID — auto-fills into new documents)
- Default currency
- Default payment terms
- Email notification preferences
- Invoice numbering preferences (prefix, starting number)

---

## 7. Status Tracking & Notifications

### Document Statuses
| Status | Color | Meaning |
|--------|-------|---------|
| Draft | Gray | Created but not sent |
| Sent | Blue | Sent to client |
| Viewed | Purple | Client has opened/viewed it (via tracking link) |
| Paid | Green | Payment received — marked manually by user |
| Overdue | Red | Past due date and not paid |
| Cancelled | Dark Gray | Voided/cancelled |

### Email Notifications (Logged-In Users)
- Send invoice directly to client via email
- Automatic overdue reminders (configurable: 1 day, 3 days, 7 days, 14 days after due date)
- Weekly/monthly activity summary email

---

## 8. PDF Generation

All documents export as clean, professional PDFs matching the selected template.

**PDF includes:**
- Selected template design
- All entered data (sender, recipient, items, totals)
- Document type label (e.g., "INVOICE", "QUOTE", "CREDIT NOTE")
- Document number, dates
- Company logo (if uploaded)
- Notes and terms & conditions
- "Created with Invoiceify" subtle watermark in footer (optional, removable for logged-in users)

---

## 9. Data Collection & Flywheel Engine

**This is the entire point of the platform.** Every single document that a user submits is stored in full — completely raw, unfiltered, and NOT anonymized. We (the platform operators) can see every invoice, every business name, every client, every line item, every amount. Nothing is hidden from us.

### 9.1 What Happens When a Document is Submitted

When a user clicks "Download PDF" or "Save" on any document, the following happens:

1. **The complete document is saved to our database** — every single field the user entered is stored permanently in the `documents` and `line_items` tables. This includes:
   - Full sender business name, address, email, phone, tax ID, logo
   - Full recipient/client name, address, email, phone, tax ID
   - Every line item with descriptions, quantities, prices, tax rates, discounts
   - All totals (subtotal, tax, discount, grand total)
   - Document type, number, dates, currency, notes, terms
   - Template selected
   - Industry preset (if chosen)

2. **A document event is logged** in the `document_events` table (created, sent, viewed, paid, etc.)

3. **Metadata is captured** — timestamp, user agent/device type, IP-based geolocation (country level), session info

4. **The PDF is generated** and served to the user — this is the value exchange. They get their document, we get their data.

**Even guest users (not logged in) have their documents stored.** The guest gets their PDF download, but the full raw data is still persisted to our database.

### 9.2 Raw Data We Store (Per Document — Nothing Anonymized)

| Data Point | Source | Stored As |
|------------|--------|-----------|
| Sender business name | Content fields | Plain text |
| Sender full address | Content fields | JSONB (street, city, state, zip, country) |
| Sender email & phone | Content fields | Plain text |
| Sender tax ID / VAT number | Content fields | Plain text |
| Recipient/client name | Content fields | Plain text |
| Recipient full address | Content fields | JSONB |
| Recipient email & phone | Content fields | Plain text |
| Recipient tax ID | Content fields | Plain text |
| Document type | Step 1 | Enum |
| Industry preset | Step 1 | Enum |
| Document number | Content fields | Text |
| Issue date | Content fields | Date |
| Due date | Content fields | Date |
| Currency | Content fields | Text |
| Every line item description | Items step | Text per row |
| Every line item quantity | Items step | Decimal per row |
| Every line item unit price | Items step | Decimal per row |
| Every line item tax rate | Items step | Decimal per row |
| Every line item discount | Items step | Decimal per row |
| Every line item total | Items step | Decimal per row |
| Subtotal | Calculated | Decimal |
| Total tax | Calculated | Decimal |
| Total discount | Calculated | Decimal |
| Grand total | Calculated | Decimal |
| Notes | Content fields | Text |
| Terms & conditions | Content fields | Text |
| Payment method (receipts) | Content fields | Text |
| Template chosen | Step 4 | Text |
| Status changes over time | Status tracking | Event log with timestamps |
| Time from created → paid | Status tracking | Computed from events |
| Device type / browser | Browser metadata | User agent string |
| Country (IP-based) | Request metadata | Country code |
| Timestamp of creation | System | Timestamp |
| User ID (if logged in) | Auth | UUID or null for guests |

### 9.3 Admin Panel — Full Data Visibility

An internal admin dashboard (protected by admin auth, not visible to regular users) that gives us **complete visibility into all submitted documents**:

**Admin Panel Features:**
- **All Documents Table** — browse, search, filter, and sort every document ever submitted across all users and guests
  - Search by: business name, client name, email, amount range, date range, document type, industry, country
  - View full details of any document (click to expand — see every field, every line item)
  - Export to CSV/JSON (full raw data export)
- **All Users Table** — see every registered user, their business info, total documents created, total revenue invoiced
- **Real-Time Feed** — live stream of documents being created (like a real-time activity log)
- **Analytics Dashboard:**
  - Total documents created (all time, this month, today)
  - Total value invoiced across all documents
  - Documents by type (pie chart)
  - Documents by industry preset
  - Documents by country/region (map view)
  - Average invoice value over time (line chart)
  - Top industries by volume and value
  - Payment terms distribution
  - Average days-to-pay by industry
  - User growth over time
  - Guest vs. registered user ratio
- **Data Export:**
  - Export all documents as CSV (full raw data)
  - Export all documents as JSON
  - Export filtered subsets (by date range, type, industry, region)
  - Scheduled automatic exports (daily/weekly data dumps)

### 9.4 Data Value — What This Data Is Worth

Once we have scale, the raw dataset can be packaged and sold to:

| Dataset | Description | Potential Buyers | Est. Price |
|---------|-------------|-----------------|------------|
| **SMB Revenue Index** | Invoice values by industry, region, quarter | Hedge funds, economists | $100K–500K/yr |
| **Payment Behavior Report** | Days-to-pay by industry, region, company size | Credit underwriters, banks | $50K–300K/yr |
| **Pricing Benchmark Data** | Service/product pricing by industry and geography | Market research firms | $50K–200K/yr |
| **Economic Activity Signals** | Invoice volume trends as proxy for economic health | Hedge funds, VCs | $100K–500K/yr |
| **Trade Flow Data** | Cross-border invoicing patterns by country pair | Trade analysts, government | $50K–200K/yr |
| **Industry Growth Indicators** | New business formation and invoice growth by sector | VCs, PE firms | $50K–300K/yr |
| **Discounting & Terms Trends** | How payment terms and discounts shift over time | CFOs, treasury teams | $30K–100K/yr |

> **Note:** When selling data externally, it would be anonymized/aggregated for the buyer. But internally, we always retain and can view the full raw data.

### 9.5 Privacy (User-Facing)
- **ToS language:** "By using Invoiceify, you agree that document data you create may be stored and used to improve our services and provide industry insights."
- **Security:** All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Data retention:** All data retained indefinitely

---

## 10. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | Full-stack, SSR, API routes, great DX |
| **Language** | TypeScript | Type safety for financial data |
| **Styling** | Tailwind CSS | Rapid UI development, matches design system |
| **Database** | PostgreSQL (via Supabase or Neon) | Relational data, ACID compliance for financial records |
| **ORM** | Prisma | Type-safe DB queries, migrations |
| **Auth** | NextAuth.js (Auth.js) | Google OAuth + email/password |
| **PDF Generation** | @react-pdf/renderer or Puppeteer | Server-side PDF rendering |
| **File Storage** | Supabase Storage or AWS S3 | Logo uploads, generated PDFs |
| **Email** | Resend or SendGrid | Transactional emails, reminders |
| **Deployment** | Vercel (frontend) + Supabase (DB/storage) | Free tier, auto-scaling |
| **Analytics** | PostHog or Plausible | Privacy-friendly usage analytics |

---

## 11. Database Schema (High-Level)

```
users
├── id (uuid, PK)
├── email
├── name
├── password_hash (nullable — for OAuth users)
├── provider (email | google)
├── business_name
├── business_address (jsonb)
├── business_logo_url
├── tax_id
├── default_currency
├── default_payment_terms
├── created_at
└── updated_at

clients
├── id (uuid, PK)
├── user_id (FK → users)
├── name
├── email
├── phone
├── address (jsonb)
├── tax_id
├── created_at
└── updated_at

documents
├── id (uuid, PK)
├── user_id (FK → users, nullable for guest)
├── client_id (FK → clients, nullable)
├── type (enum: invoice, tax_invoice, proforma, receipt, sales_receipt, cash_receipt, quote, estimate, credit_note, purchase_order, delivery_note)
├── industry_preset (enum, nullable)
├── status (enum: draft, sent, viewed, paid, overdue, cancelled)
├── document_number (text, e.g. INV-001)
├── issue_date (date)
├── due_date (date, nullable)
├── currency (text, e.g. USD)
├── sender_info (jsonb — business details snapshot)
├── recipient_info (jsonb — client details snapshot)
├── notes (text, nullable)
├── terms (text, nullable)
├── template_id (text — which visual template)
├── subtotal (decimal)
├── tax_total (decimal)
├── discount_total (decimal)
├── grand_total (decimal)
├── pdf_url (text, nullable)
├── extra_fields (jsonb — type-specific fields like payment_method, tracking_number, etc.)
├── created_at
├── updated_at
├── sent_at (nullable)
└── paid_at (nullable)

line_items
├── id (uuid, PK)
├── document_id (FK → documents)
├── description (text)
├── quantity (decimal)
├── unit_price (decimal)
├── tax_rate (decimal, nullable)
├── discount (decimal, nullable)
├── line_total (decimal)
├── sort_order (int)
├── extra_fields (jsonb — SKU, CPT code, HS code, etc.)
└── created_at

document_events (for status tracking / flywheel data)
├── id (uuid, PK)
├── document_id (FK → documents)
├── event_type (enum: created, sent, viewed, paid, overdue_flagged, cancelled)
├── event_date (timestamp)
└── metadata (jsonb)

aggregated_data (materialized/computed — for the data flywheel)
├── id (uuid, PK)
├── period (date — monthly bucket)
├── region (text — country code)
├── industry (text — preset category)
├── document_type (text)
├── metric_name (text — e.g. avg_invoice_value, avg_days_to_pay)
├── metric_value (decimal)
├── sample_size (int — number of data points)
└── computed_at (timestamp)
```

---

## 12. Pages / Routes

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Landing page with hero, features, FAQ | No |
| `/create` | Invoice creation wizard (4-step flow) | No (guest mode) |
| `/create?type=invoice` | Pre-selected document type | No |
| `/templates` | Browse all visual template designs | No |
| `/login` | Login page | No |
| `/signup` | Registration page | No |
| `/dashboard` | User dashboard overview | Yes |
| `/dashboard/documents` | All documents list | Yes |
| `/dashboard/documents/[id]` | View/edit single document | Yes |
| `/dashboard/clients` | Client address book | Yes |
| `/dashboard/clients/[id]` | Single client view | Yes |
| `/dashboard/settings` | User/business settings | Yes |
| `/view/[token]` | Public document view (shared link for clients) | No (token-based) |
| `/api/documents` | CRUD API for documents | Yes (or guest token) |
| `/api/documents/[id]/pdf` | Generate/download PDF | Yes (or guest token) |
| `/api/documents/[id]/send` | Send document via email | Yes |
| `/api/auth/*` | Auth endpoints (NextAuth) | No |

---

## 13. MVP Scope (Phase 1)

For the university project, build these first:

### Must Have (Phase 1)
- [ ] Landing page (matching the dark teal design)
- [ ] 4-step invoice creation wizard
- [ ] All 11 document types with correct fields
- [ ] At least 3 visual PDF templates
- [ ] PDF generation and download
- [ ] Guest mode (create + download without account)
- [ ] **Every submitted document stored in full to database (raw, unfiltered, not anonymized)**
- [ ] User auth (email + Google)
- [ ] Dashboard with document list
- [ ] Save documents to account
- [ ] Client address book (auto-saved)
- [ ] Document status tracking (manual: draft/sent/paid)
- [ ] **Admin panel — view ALL submitted documents, search, filter, export CSV/JSON**
- [ ] **Admin analytics dashboard — charts showing document volume, value, trends**
- [ ] **Deployed and hosted live on Vercel + Supabase (accessible via URL)**

### Nice to Have (Phase 2)
- [ ] Email sending (send invoice to client)
- [ ] Overdue reminders
- [ ] Shareable document links with view tracking
- [ ] Industry presets (freelance, medical, contractor, etc.)
- [ ] All 6 visual templates
- [ ] Weekly/monthly email reports
- [ ] Convert quote → invoice, estimate → quote → invoice
- [ ] Admin analytics dashboard with charts
- [ ] Data export API for aggregated datasets

---

## 14. Hosting & Deployment

The app must be hostable and usable as a live product — not just a local demo.

### 14.1 Deployment Stack

| Component | Service | Tier | Why |
|-----------|---------|------|-----|
| **Frontend + API** | [Vercel](https://vercel.com) | Free (Hobby) | Native Next.js hosting, auto-deploys from GitHub, custom domain support, SSL included |
| **Database** | [Supabase](https://supabase.com) | Free tier (500MB, 50K rows) | Managed PostgreSQL, built-in auth, real-time subscriptions, dashboard UI |
| **File Storage** | Supabase Storage | Free tier (1GB) | Logo uploads, generated PDF storage |
| **Email** | [Resend](https://resend.com) | Free tier (100 emails/day) | Transactional emails, invoice sending |
| **Domain** | Any registrar (Namecheap, Cloudflare) | ~$10/yr | Custom domain (e.g., invoiceify.app) |

### 14.2 Deployment Flow

```
GitHub (main branch)
    ↓ auto-deploy on push
Vercel (builds + hosts Next.js app)
    ↓ connects to
Supabase (PostgreSQL DB + file storage + auth)
```

**Steps to go live:**
1. Create a Supabase project → get DB connection string + anon key
2. Run Prisma migrations against the Supabase DB (`npx prisma migrate deploy`)
3. Connect the GitHub repo to Vercel → set environment variables (DB URL, Supabase keys, NextAuth secret, etc.)
4. Every `git push` to `main` auto-deploys to production
5. (Optional) Add a custom domain in Vercel settings

### 14.3 Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...@db.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
NEXTAUTH_URL=https://invoiceify.app (or Vercel URL)
NEXTAUTH_SECRET=random-secret-string
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Email (Resend)
RESEND_API_KEY=re_xxx

# Admin
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=secure-admin-password
```

### 14.4 Local Development

```bash
# Clone the repo
git clone https://github.com/xxclaude1/invoiceify.git
cd invoiceify

# Install dependencies
npm install

# Set up local env
cp .env.example .env.local
# Fill in your Supabase credentials

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
# → http://localhost:3000
```

### 14.5 Production Checklist

- [ ] Supabase project created with PostgreSQL database
- [ ] Prisma schema migrated to production DB
- [ ] Vercel project connected to GitHub repo
- [ ] Environment variables set in Vercel dashboard
- [ ] Custom domain configured (optional but recommended)
- [ ] SSL certificate active (automatic via Vercel)
- [ ] Admin account seeded in database
- [ ] Test: create a document as guest → verify it saves to DB
- [ ] Test: create an account → verify dashboard works
- [ ] Test: admin panel → verify all documents visible

---

## 15. Success Metrics

| Metric | Target (University Demo) |
|--------|-------------------------|
| Document types supported | 11 |
| PDF templates available | 3+ |
| Documents creatable without account | Yes |
| Time to create first invoice | < 3 minutes |
| Data points collected per document | 15+ |
| Aggregated dataset categories | 5+ |
| Privacy compliant (GDPR/CCPA design) | Yes |
