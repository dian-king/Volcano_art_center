# Volcano Arts Center — Web Application Guide

> **Rwanda's premier arts, culture, and conservation platform.**
> Built with Next.js 15, Prisma, PostgreSQL, and NextAuth.

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Login Credentials](#2-login-credentials)
3. [Public Website — What Visitors Can Do](#3-public-website)
4. [How the Home Page Works (Featured Content)](#4-home-page-featured-content)
5. [Content Manager — Full Guide](#5-content-manager)
6. [Operations Manager — Full Guide](#6-operations-manager)
7. [Super Admin — Full Guide](#7-super-admin)
8. [Client Account — What Customers Can Do](#8-client-account)
9. [Other Account Types](#9-other-account-types)
10. [Development Setup](#10-development-setup)

---

## 1. App Overview

Volcano Arts Center has two distinct areas:

| Area | URL | Who uses it |
|---|---|---|
| **Public Website** | `localhost:3000` | Visitors, customers, donors |
| **Admin Panel** | `localhost:3000/admin` | Content Manager, Ops Manager, Super Admin |

The admin panel automatically shows only the sections each role is allowed to access. All three admin roles log in at the same URL — the panel adapts to their role.

---

## 2. Login Credentials

### Admin Staff Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Super Admin** | `admin@volcanoarts.rw` | `Admin@VAC2026!` | Everything |
| **Content Manager** | `content@volcanoarts.rw` | `Test1234!` | Content only |
| **Operations Manager** | `ops@volcanoarts.rw` | `Test1234!` | Operations only |

### Test User Accounts (non-admin)

| Role | Email | Password | Access |
|---|---|---|---|
| Registered Client | `client@volcanoarts.rw` | `Test1234!` | Shopping, bookings |
| Talent Applicant | `talent@volcanoarts.rw` | `Test1234!` | Talent dashboard |
| Tour Operator | `operator@volcanoarts.rw` | `Test1234!` | Operator portal |

> **To log in:** Go to `localhost:3000/login`, enter email and password, click **Sign In**.
> Admin staff are taken straight to `localhost:3000/admin` after signing in.

---

## 3. Public Website

Everyone (logged in or not) can browse the public site at `localhost:3000`.

### Navigation
- **Home** — Featured artworks, experiences, conservation campaign, talent showcase, blog posts
- **Shop** — Browse and buy all published artworks
- **Experiences** — View and inquire about cultural experiences
- **Conservation** — View campaigns and donate
- **Blog & Stories** — Read articles and stories
- **Talent** — Browse Rwanda's featured talent profiles

### What visitors can do
- Browse all published products and filter by category
- View individual product pages with images, artist info, and price
- Add items to cart and checkout (guest or logged-in)
- Browse and book experiences
- View and donate to conservation campaigns
- Read blog posts
- Submit contact inquiries via the contact page
- Apply to the talent programme
- Tour operators can submit group booking requests

### What logged-in clients can do (beyond browsing)
- Save items to wishlist
- View order history and track shipments
- View booking history
- Leave reviews on products and experiences they purchased

---

## 4. Home Page — Featured Content

The home page **auto-assembles from the database** — no hardcoding. Each section pulls items marked as `featured` by the admin. To change what appears, simply toggle the featured flag in the admin panel.

| Section | Controlled by | Where to change it |
|---|---|---|
| **Featured Artworks** (art grid) | `product.featured = true` + `status = PUBLISHED` | `/admin/products` → Edit → check "Featured" |
| **Featured Experiences** (3 cards) | `experience.featured = true` + `status = PUBLISHED` | `/admin/experiences` → Edit → check "Featured" |
| **Conservation Spotlight** (split panel) | `campaign.featured = true` + `status = ACTIVE` | `/admin/conservation` → Edit → check "Featured" |
| **Talent Section** (photo + name) | `talentProfile.featured = true` + `published = true` | `/admin/talent` → Edit → check "Featured" |
| **Testimonials** (3 reviews) | `review.featured = true` + `approved = true` | `/admin/reviews` → Edit → check "Featured" |
| **From the Journal** (3 blog posts) | Most recent 3 published posts | `/admin/blog` → Publish a post |

**To feature something on the home page:**
1. Log into the admin panel
2. Navigate to the relevant section
3. Open the item and check the **"Featured on home page"** checkbox
4. Save — the home page updates immediately (no code changes needed)

---

## 5. Content Manager

**Login:** `content@volcanoarts.rw` / `Test1234!`
**Admin URL:** `localhost:3000/admin`

The Content Manager controls everything the public sees. They never touch orders, bookings, or payments.

---

### 5.1 Art Catalog (`/admin/products`)

**What they can do:**
- Create, edit, and delete art products
- Upload product images
- Set price and "compare at" (sale) price
- Assign products to categories
- Set inventory type: **Unique** (one-of-a-kind) or **Batch** (multiple copies)
- Publish, draft, or archive products
- Mark products as **Featured** (appears on home page)

**How to add a new product:**
1. Go to `/admin/products` → click **+ New Product**
2. Fill in: name, artist name, description, price, category, dimensions, medium
3. Upload at least one image
4. Choose inventory type and stock quantity
5. Set status to **Published**
6. Check "Featured" if it should appear on the home page
7. Click **Save**

**How to feature a product on the home page:**
1. Go to `/admin/products`
2. Click **Edit** on the product
3. Check **"Featured on home page"**
4. Make sure status is **Published**
5. Save

---

### 5.2 Experiences (`/admin/experiences`)

**What they can do:**
- Create, edit, and delete experience listings
- Upload experience images
- Set pricing (per person and group rates)
- Set min/max group sizes, duration, languages
- List what's included/excluded and what to bring
- Set booking type: **Direct** (instant book) or **Inquiry** (contact first)
- Mark as **Featured** for the home page

**How to add a new experience:**
1. Go to `/admin/experiences` → click **+ New Experience**
2. Fill in: title, short description, full description, location, duration
3. Set per-person price and group price
4. List what's included, excluded, and what to bring
5. Upload images
6. Set status to **Published**
7. Check "Featured" for home page visibility
8. Save

---

### 5.3 Conservation Campaigns (`/admin/conservation`)

**What they can do:**
- Create and edit conservation campaigns
- Upload a campaign photo (shown in the split panel on the home page)
- Set goal amount and update raised amount / donor count
- Change campaign status: Active, Completed, Paused, Archived
- Mark one campaign as **Featured** (only one shows on the home page at a time)

**How to add a campaign:**
1. Go to `/admin/conservation` → click **+ New Campaign**
2. Fill in: name, description, goal amount, impact statement
3. Upload a campaign image
4. Set status to **Active**
5. Check **"Featured on home page"** if it should show in the conservation section
6. Save

**How to change which campaign shows on the home page:**
1. Open the campaign you want to feature → check "Featured on home page" → Save
2. Open the old featured campaign → uncheck "Featured on home page" → Save

---

### 5.4 Blog & Stories (`/admin/blog`)

**What they can do:**
- Write, edit, and publish blog posts
- Use the rich text editor (headings, links, images, formatting)
- Upload a featured image for each post
- Assign categories: Update, Event, Story, Culture, Conservation, Testimonial
- Add tags
- Set SEO title and description

**How to publish a blog post:**
1. Go to `/admin/blog` → click **+ New Blog Post**
2. Write your title and content in the editor
3. Upload a featured image
4. Choose a category and add tags
5. Toggle **Published** to ON
6. Save — it immediately appears in the "From the Journal" section on the home page (newest 3 posts show automatically)

---

### 5.5 Talent Profiles (`/admin/talent`)

**What they can do:**
- Create talent profiles from approved applicants
- Upload profile photos (the photo appears on the home page talent section)
- Write talent bio
- Assign talent area and category
- Publish profiles to the public talent page
- Mark one profile as **Featured** (shows with photo on home page)

**How to feature a talent profile on the home page:**
1. Go to `/admin/talent`
2. Edit a profile
3. Upload a photo in the **Image** field — this photo appears full-height on the home page
4. Check **"Featured on home page"**
5. Make sure **Published** is ON
6. Save — the home page talent section now shows their photo with their name and talent area

---

### 5.6 Reviews (`/admin/reviews`)

**What they can do:**
- Approve or reject reviews submitted by customers
- Mark approved reviews as **Featured** (shows in testimonials section on home page)
- Remove inappropriate reviews

**How to feature a testimonial on the home page:**
1. Go to `/admin/reviews`
2. Find the review and click **Approve**
3. Once approved, check **"Featured"**
4. Save — it appears in the "What Our Guests Say" section (up to 3 featured reviews show)

---

### 5.7 Media Library (`/admin/content/media`)

- Upload and manage all media files used across the site
- Images are stored and reused across products, experiences, and blog posts

---

## 6. Operations Manager

**Login:** `ops@volcanoarts.rw` / `Test1234!`
**Admin URL:** `localhost:3000/admin`

The Operations Manager handles everything that happens after content is published — bookings, orders, inquiries, and day-to-day platform operations. They cannot edit or publish any public-facing content.

---

### 6.1 Bookings (`/admin/bookings`)

**What they can do:**
- View all experience booking requests
- Confirm or reject pending bookings
- Add internal admin notes to bookings
- Contact guests by email via the booking record

**How to confirm a booking:**
1. Go to `/admin/bookings`
2. Click on a **PENDING** booking
3. Review the details (guest name, experience, preferred date, group size)
4. Click **Confirm** to approve or **Reject** to decline
5. An email is automatically sent to the guest

> **Priority tip:** Bookings waiting more than 24 hours are flagged in amber on the dashboard. Always handle these first.

---

### 6.2 Shipping Orders (`/admin/orders`)

**What they can do:**
- View all product orders
- Move orders through the pipeline: PENDING → PROCESSING → SHIPPED → DELIVERED
- Add tracking number and carrier name
- Process refunds

**How to process an order:**
1. Go to `/admin/orders`
2. Find a **PENDING** order
3. Click to open it
4. Change status to **Processing** when you start preparing the shipment
5. Once shipped, enter the tracking number and select the carrier
6. Change status to **Shipped**
7. Mark as **Delivered** once the customer has received it

---

### 6.3 Contact Inquiries (`/admin/inquiries`)

**What they can do:**
- View all contact form submissions
- Mark inquiries as In Progress or Closed
- Add staff notes about how the inquiry was handled

**How to handle an inquiry:**
1. Go to `/admin/inquiries`
2. Click on a **NEW** inquiry to read the message
3. Add a staff note about your response
4. Change status to **In Progress** while working on it
5. Change to **Closed** once resolved

---

### 6.4 Tour Operator Requests (`/admin/operators`)

**What they can do:**
- Review group booking requests from registered tour operators
- Approve or decline requests
- Set partner pricing for group bookings
- Confirm whether an invoice is required

---

### 6.5 Talent Applications (`/admin/applications`)

**What they can do:**
- Review applications from people who applied to the talent programme
- Approve, reject, or request more information from applicants
- Add staff feedback notes

**How to review an application:**
1. Go to `/admin/applications`
2. Click on a **PENDING** application
3. Review their talent area, motivation statement, and experience
4. Click **Approve** (the Content Manager can then create a public talent profile for them)
   or **Reject** with a reason
5. Add staff feedback explaining the decision

---

### 6.6 Availability Slots (`/admin/slots`)

**What they can do:**
- Create availability slots for experiences
- Assign a guide to each slot
- Set capacity (maximum guests per slot)
- View upcoming slots and current booking status
- Mark slots as Available, Limited, or Blackout (closed)

**How to add a slot:**
1. Go to `/admin/slots` → click **+ New Slot**
2. Select the experience this slot is for
3. Set the date, capacity, and assigned guide name
4. Set status to **Available**
5. Save — guests can now be booked into this slot

---

### 6.7 Donations (`/admin/donations`)

**What they can do:**
- View all donation records
- Confirm manual donations received via bank transfer or MTN MoMo
- Mark donations as Completed once payment is verified in the bank

---

## 7. Super Admin

**Login:** `admin@volcanoarts.rw` / `Admin@VAC2026!`
**Admin URL:** `localhost:3000/admin`

The Super Admin can do **everything** the Content Manager and Operations Manager can do, plus additional platform-level controls below.

---

### 7.1 All Content Manager and Ops Manager features

Every section from sections 5 and 6 is fully available to the Super Admin.

---

### 7.2 Staff & Accounts (`/admin/users`)

**What they can do:**
- View all user accounts on the platform
- Change any user's role
- Deactivate or reactivate accounts
- Create new admin staff accounts

**How to create a new staff account:**
1. Go to `/admin/users` → click **+ New User**
2. Enter first name, last name, email, and set role
3. Set a temporary password
4. Send the login details to the staff member

**Roles available to assign:**
- `CONTENT_MANAGER` — content editing access only
- `OPS_MANAGER` — operations access only
- `SUPER_ADMIN` — full access

---

### 7.3 Platform Settings (`/admin/settings`)

**What they can do:**
- Update payment details displayed to customers during checkout
- Update WhatsApp contact number
- Set the site currency

**Current payment settings (from seed):**
- MTN MoMo: `+250 788 000 000`
- WhatsApp: `+250 788 000 001`
- Bank: Bank of Kigali | Account Name: Volcano Arts Center Ltd | SWIFT: BKIGRWRW | Account: 00012-3456789-01

---

### 7.4 Audit Log (`/admin/audit`)

- Read-only log of every action taken in the admin panel
- Shows who did what and when
- Used for investigating issues and tracking changes over time

---

### 7.5 Overrides & Refunds (`/admin/overrides`)

- Apply manual overrides to orders or bookings outside the standard workflow
- Process refunds manually

---

### 7.6 Export Data (`/admin/export`)

- Export platform data (orders, bookings, users) to CSV for reporting and accounting

---

## 8. Client Account

Customers create accounts at `localhost:3000/register` or log in at `localhost:3000/login`.

| Feature | How |
|---|---|
| **Browse & buy art** | Shop → Add to cart → Checkout |
| **Book an experience** | Experiences → Book Now → Fill form |
| **Donate to conservation** | Conservation → Support This Campaign |
| **Leave a review** | Product or experience page → Leave a Review (must have purchased) |
| **View orders** | Account → My Orders |
| **Track a shipment** | Account → My Orders → tracking number shown once shipped |
| **Save items** | Product page → ♡ Save (requires login) |
| **Apply to talent** | `localhost:3000/talent/apply` |

### How payment works
Customers place an order and are shown payment instructions:
- **MTN Mobile Money** — transfer to the number displayed
- **Bank Transfer** — transfer to Bank of Kigali account details shown
- The Ops Manager manually confirms receipt of payment in the admin panel
- Order status then changes to Processing → Shipped → Delivered

---

## 9. Other Account Types

### Talent Applicants
- Apply at `localhost:3000/talent/apply`
- Fill in personal details, talent area, motivation statement
- Wait for approval from the Operations Manager
- If approved, the Content Manager creates a public talent profile for them with their photo

### Tour Operators
- Register at `localhost:3000/register` (select Tour Operator during signup)
- Submit group booking requests directly from experience pages
- Ops Manager reviews requests and sets partner pricing

---

## 10. Development Setup

### Requirements
- Node.js 18+
- PostgreSQL database
- pnpm

### Environment Variables
Create a `.env` file at the project root:
```
DATABASE_URL="postgresql://user:password@localhost:5432/volcanoarts"
NEXTAUTH_SECRET="your-random-secret-string"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."
```

### Running the app
```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm prisma migrate deploy

# Seed the database with test data and accounts
pnpm prisma db seed

# Start the development server
pnpm dev
```

The app runs at `http://localhost:3000`.

### Useful commands
```bash
pnpm prisma studio        # Visual database browser at localhost:5555
pnpm prisma db seed       # Re-seed test data
pnpm build                # Production build check
pnpm tsc --noEmit         # TypeScript type check (0 errors expected)
```

---

## Quick Reference — Who Can Do What

| Action | Content Manager | Ops Manager | Super Admin |
|---|---|---|---|
| Create/edit art products | ✅ | ❌ | ✅ |
| Publish experiences | ✅ | ❌ | ✅ |
| Write & publish blog posts | ✅ | ❌ | ✅ |
| Approve & feature reviews | ✅ | ❌ | ✅ |
| Manage talent profiles | ✅ | ❌ | ✅ |
| Create conservation campaigns | ✅ | ❌ | ✅ |
| Feature content on home page | ✅ | ❌ | ✅ |
| Upload campaign / talent photos | ✅ | ❌ | ✅ |
| Confirm/reject bookings | ❌ | ✅ | ✅ |
| Process shipping orders | ❌ | ✅ | ✅ |
| Handle contact inquiries | ❌ | ✅ | ✅ |
| Review talent applications | ❌ | ✅ | ✅ |
| Manage availability slots | ❌ | ✅ | ✅ |
| Confirm donations | ❌ | ✅ | ✅ |
| Review tour operator requests | ❌ | ✅ | ✅ |
| Manage staff accounts & roles | ❌ | ❌ | ✅ |
| Change platform settings | ❌ | ❌ | ✅ |
| View full audit log | ❌ | ❌ | ✅ |
| Export data to CSV | ❌ | ❌ | ✅ |
| Apply overrides & refunds | ❌ | ❌ | ✅ |

---

*Volcano Arts Center Inc — Musanze, Rwanda*
