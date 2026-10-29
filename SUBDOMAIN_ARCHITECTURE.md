# Subdomain Architecture - Visual Overview

## 🌐 Current Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
│                                                             │
│  Domain: AffClickero.com                                      │
│  Host: Vercel (supports wildcard subdomains)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 DNS Configuration

```
                    Domain Registrar
                  (Namecheap, GoDaddy, etc.)
                            │
                            ├─ AffClickero.com          → Vercel IP
                            ├─ www.AffClickero.com      → cname.vercel.sh
                            └─ *.AffClickero.com        → cname.vercel.sh  ← WILDCARD
                                    │
                                    └─ Catches all subdomains!
                                       ✓ test.AffClickero.com
                                       ✓ summer-sale.AffClickero.com
                                       ✓ any-subdomain.AffClickero.com
```

---

## 🔄 Landing Page Flow

```
┌────────────────────────────────────────────────────────────┐
│                  User Creates Landing Page                 │
│  Landing Page Builder (/admin/landing-builder)            │
│                                                            │
│  1. Choose subdomain: "summer-sale"                        │
│  2. Paste tracking URL: "https://affiliate.com/..."       │
│  3. Select template                                        │
│  4. Customize content                                      │
│  5. Publish                                                │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │   Database Storage          │
        │  (Prisma + PostgreSQL)      │
        │                             │
        │  subdomain: "summer-sale"   │
        │  trackingUrl: "https://..." │
        │  isPublished: true          │
        │  totalClicks: 0             │
        └──────────┬────────────────┘
                   │
                   ↓
        ┌──────────────────────────────┐
        │  Landing Page Ready          │
        │  https://summer-sale.AffClickero.com
        └──────────┬───────────────────┘
                   │
                   ↓
        ┌──────────────────────────────┐
        │  User/Visitor Clicks Link    │
        │  Browser: GET /lp/summer-sale│
        └──────────┬───────────────────┘
                   │
                   ↓
        ┌──────────────────────────────┐
        │  Next.js Route Handler       │
        │  /app/(public)/lp/[subdomain]│
        │  /route.ts                   │
        └──────────┬───────────────────┘
                   │
                   ├─ Find "summer-sale" in DB
                   ├─ Check if published
                   ├─ Increment click count
                   │
                   ↓
        ┌──────────────────────────────┐
        │  Redirect (302)              │
        │  Location: https://affiliate │
        │           .com/offer?id=123  │
        └──────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────────────┐
        │  Affiliate Site              │
        │  https://affiliate.com/...   │
        └──────────────────────────────┘
```

---

## 📁 File & Route Structure

```
Project Root
│
├── src/app
│   ├── (dashboard)/
│   │   └── admin/
│   │       ├── landing-builder/page.tsx    ← Builder interface
│   │       └── templates/page.tsx          ← Template manager
│   │
│   ├── (public)/
│   │   └── lp/[subdomain]/route.ts        ← Public redirect handler
│   │
│   └── api/
│       └── landing-pages/
│           ├── route.ts                    ← /api/landing-pages
│           ├── templates/route.ts          ← /api/landing-pages/templates
│           ├── [id]/route.ts              ← /api/landing-pages/[id]
│           └── [id]/publish/route.ts      ← /api/landing-pages/[id]/publish
│
├── prisma/
│   └── schema.prisma                       ← Database schema
│
└── Documentation/
    ├── LANDING_PAGE_BUILDER.md             ← User guide
    ├── SUBDOMAIN_SETUP_GUIDE.md           ← Setup instructions
    └── SUBDOMAIN_QUICK_START.md           ← Quick checklist
```

---

## 🔗 URL Mapping

```
Admin Dashboard:
    https://AffClickero.com/admin/landing-builder

Landing Pages (Created by Users):
    https://summer-sale.AffClickero.com
    https://black-friday.AffClickero.com
    https://vip-offer.AffClickero.com

Main Domain Still Works:
    https://AffClickero.com/admin/dashboard
    https://AffClickero.com/login
    https://AffClickero.com/settings
```

---

## 🌍 DNS + Vercel + Next.js

```
                        DNS Query
                   "summer-sale.AffClickero.com"
                            │
                            ↓
                   ┌─────────────────┐
                   │  DNS Resolver   │
                   │                 │
                   │ Query:          │
                   │ *.AffClickero.com  │
                   └────────┬────────┘
                            │
                            ↓
                   ┌─────────────────────┐
                   │  Registrar Response │
                   │  CNAME cname.vercel │
                   │      .sh            │
                   └────────┬────────────┘
                            │
                            ↓
                   ┌─────────────────────┐
                   │  Vercel DNS         │
                   │  Resolves to IP     │
                   └────────┬────────────┘
                            │
                            ↓
                   ┌─────────────────────┐
                   │  Vercel Server      │
                   │  (Your Next.js app) │
                   └────────┬────────────┘
                            │
                            ↓
                   ┌─────────────────────┐
                   │  Next.js Router     │
                   │  Matches /lp/[sub]  │
                   │  domain]            │
                   └────────┬────────────┘
                            │
                            ↓
                   ┌─────────────────────┐
                   │  API Route Handler  │
                   │  Finds subdomain    │
                   │  Redirects user     │
                   └─────────────────────┘
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────┐
│   Public (No Auth Required)  │
│   /lp/[subdomain]           │
│   - Find landing page        │
│   - Check if published       │
│   - Redirect to tracking URL │
└──────────────────────────────┘

┌──────────────────────────────┐
│   Protected (Auth Required)  │
│   /admin/landing-builder     │
│   - Create/update/delete     │
│   - Can only manage own      │
│   - Publish/unpublish        │
│                              │
│   /admin/templates           │
│   - Create templates (OWNER) │
│   - Manage templates         │
└──────────────────────────────┘
```

---

## 📊 Data Model

```
┌─────────────────────────┐
│      User               │
│                         │
│ - id (PK)              │
│ - username             │
│ - email                │
│ - role (OWNER/ADMIN)   │
└────────────┬───────────┘
             │ 1:M
             ↓
┌─────────────────────────────────────┐
│    LandingPageTemplate              │
│    (Created by Owners)              │
│                                     │
│ - id (PK)                          │
│ - name (e.g., "Modern Offer")      │
│ - htmlContent                      │
│ - cssStyles                        │
│ - createdBy (FK to User)           │
└────────────┬────────────────────────┘
             │ 1:M
             ↓
┌─────────────────────────────────────┐
│      LandingPage                    │
│    (Created by Any User)            │
│                                     │
│ - id (PK)                          │
│ - subdomain (UNIQUE)               │
│ - trackingUrl                      │
│ - templateId (FK)                  │
│ - userId (FK)                      │
│ - headline                         │
│ - description                      │
│ - imageUrl                         │
│ - primaryColor                     │
│ - secondaryColor                   │
│ - buttonText                       │
│ - isPublished                      │
│ - totalClicks                      │
└─────────────────────────────────────┘
```

---

## 🚀 Environment Setup

```
.env (Development/Local)
│
├─ NEXT_PUBLIC_LANDING_PAGE_DOMAIN=localhost:3000
│  (Subdomains don't work locally, but routing does)
│
├─ DATABASE_URL=postgresql://...
│
└─ API_URL=http://localhost:3000

.env.production (Vercel)
│
├─ NEXT_PUBLIC_LANDING_PAGE_DOMAIN=AffClickero.com
│
├─ DATABASE_URL=postgresql://... (Neon DB)
│
└─ API_URL=https://AffClickero.com
```

---

## ✅ Checklist - What's Implemented

- ✅ Database models (LandingPage, LandingPageTemplate)
- ✅ API routes for CRUD operations
- ✅ Next.js route handler for subdomains
- ✅ Landing page builder UI
- ✅ Template manager (owner only)
- ✅ Click tracking
- ✅ Publish/unpublish functionality
- ✅ User ownership validation
- ✅ Environment variable configuration

---

## ⏳ Checklist - What You Need to Do

- ⏳ Configure DNS wildcard record (`*.AffClickero.com`)
- ⏳ Add `NEXT_PUBLIC_LANDING_PAGE_DOMAIN` to Vercel
- ⏳ Redeploy to Vercel
- ⏳ Test with a sample landing page

---

**Status**: Ready for DNS & Environment Configuration 🚀
