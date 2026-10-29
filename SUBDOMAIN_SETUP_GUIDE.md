# Subdomain Configuration Guide - Landing Page Builder

## Overview

The Landing Page Builder can create landing pages on **wildcard subdomains** of your main domain.

**Example**: `myoffer.AffClickero.com` → Automatically handles and redirects to your tracking URL

---

## 🎯 How Subdomains Work

### Current Setup
Your site is deployed on **Vercel**, which supports wildcard subdomains out of the box.

When a user creates a landing page:
```
Subdomain Input:  "summer-sale"
Your Domain:      "AffClickero.com"
Live URL:         "https://summer-sale.AffClickero.com"
```

### How It Routes
```
User visits: https://summer-sale.AffClickero.com
    ↓
Next.js API route catches: /lp/[subdomain]
    ↓
Database lookup: Find subdomain "summer-sale"
    ↓
Increment click count
    ↓
Redirect to tracking URL (affiliate link)
```

---

## ⚙️ Setup Instructions

### Step 1: Add DNS Wildcard Record (Once)

**Your Domain Registrar** (Namecheap, GoDaddy, Route 53, Cloudflare, etc.):

1. Log in to your registrar
2. Go to **DNS/Domain Settings**
3. Add a CNAME record:
   - **Name**: `*.AffClickero.com` (or `*` if using zone apex)
   - **Type**: CNAME
   - **Value**: `cname.vercel.sh` or your Vercel URL
   - **TTL**: 3600 or default

**Example DNS Records:**
```
AffClickero.com              A        76.76.19.21      (Vercel IP)
www.AffClickero.com          CNAME    cname.vercel.sh
*.AffClickero.com            CNAME    cname.vercel.sh
```

### Step 2: Update Environment Variables

Add to your `.env` file (or Vercel dashboard):

```env
# Your main domain
NEXT_PUBLIC_APP_URL=https://AffClickero.com

# Landing page domain (should match your main domain)
NEXT_PUBLIC_LANDING_PAGE_DOMAIN=AffClickero.com
```

**In Vercel Dashboard:**
1. Go to **Project Settings** → **Environment Variables**
2. Add:
   - Name: `NEXT_PUBLIC_LANDING_PAGE_DOMAIN`
   - Value: `AffClickero.com`
   - Environments: Production, Preview, Development

### Step 3: Verify in Builder UI

After deploying, the builder will show:
```
Subdomain input: [____]  .AffClickero.com
```

Instead of hardcoded `AffClickero.com`

### Step 4: Test

1. Create a landing page with subdomain: `test`
2. Publish it
3. Visit: `https://test.AffClickero.com`
4. Should redirect to your tracking URL

---

## 📋 Subdomain Rules & Validation

### Allowed Characters
- ✅ Lowercase letters (a-z)
- ✅ Numbers (0-9)
- ✅ Hyphens (-)

### Not Allowed
- ❌ Uppercase letters
- ❌ Underscores
- ❌ Spaces
- ❌ Special characters

### Validation Rules
- **Minimum length**: 3 characters
- **Must be unique**: Can't use same subdomain twice
- **Automatically validated**: Real-time feedback in UI

### Examples
```
✅ Valid:
- summer-sale
- black-friday-2024
- offer123
- my-offer-v2

❌ Invalid:
- SUMMER-SALE (uppercase)
- my_offer (underscore)
- my offer (space)
- ab (too short)
- summer sale (space)
```

---

## 🔧 Technical Details

### Next.js Route Handling

```
File: src/app/(public)/lp/[subdomain]/route.ts
Route: *.AffClickero.com/*  →  Handled by /lp/[subdomain]
```

Next.js automatically matches all subdomains and passes the subdomain as a parameter.

### Vercel Configuration

Vercel automatically supports wildcard subdomains once DNS is configured correctly.

**No additional configuration needed** in `vercel.json` or `next.config.js`

### Environment Variable Usage

The builder dynamically uses the domain from `.env`:

```typescript
const LANDING_PAGE_DOMAIN = process.env.NEXT_PUBLIC_LANDING_PAGE_DOMAIN || 'AffClickero.com'

// Used in UI:
<span>{page.subdomain}.{LANDING_PAGE_DOMAIN}</span>
```

This means:
- If you change the domain later, just update `.env`
- No code changes needed
- Works on any domain

---

## 🚀 Deployment Workflow

### Development (localhost)

```
NEXT_PUBLIC_LANDING_PAGE_DOMAIN=localhost:3000

Landing page: https://test.localhost:3000/lp/test
```

**Note**: Localhost doesn't support true subdomains, but Next.js routing still works

### Production (Vercel)

```
NEXT_PUBLIC_LANDING_PAGE_DOMAIN=AffClickero.com

Landing page: https://test.AffClickero.com
```

Requires DNS wildcard record configured (see Step 1)

---

## 📊 Database Storage

Landing pages are stored with just the subdomain:

```prisma
model LandingPage {
  subdomain    String  @unique    // Only store "test", not "test.AffClickero.com"
  trackingUrl  String             // Actual redirect target
  // ...
}
```

The full URL is built in:
- **Frontend**: `{subdomain}.{LANDING_PAGE_DOMAIN}`
- **API**: `GET /lp/[subdomain]`

---

## 🔗 URL Examples

### My Platform
```
Main site:         https://AffClickero.com
Dashboard:         https://AffClickero.com/admin/dashboard
Builder:           https://AffClickero.com/admin/landing-builder
```

### Landing Pages
```
Page 1:  https://summer-sale.AffClickero.com
Page 2:  https://black-friday.AffClickero.com
Page 3:  https://vip-offer.AffClickero.com
```

### Custom Domains (Future)
```
Your own domain:   https://myoffers.com
Landing page:      https://summer-sale.myoffers.com
```

---

## 🛠️ Troubleshooting

### Issue: Subdomain doesn't work

**Check DNS:**
1. Go to your domain registrar
2. Verify wildcard CNAME record exists:
   ```
   *.AffClickero.com  CNAME  cname.vercel.sh
   ```
3. Wait 24 hours for DNS propagation
4. Test with: `nslookup test.AffClickero.com`

### Issue: 404 on subdomain

**Check if page is published:**
1. Go to Landing Page Builder
2. Verify page status is "Published"
3. Unpublished pages return 404

**Check database:**
```sql
SELECT subdomain, isPublished, trackingUrl 
FROM landing_pages 
WHERE subdomain = 'test';
```

### Issue: Redirect not working

**Verify tracking URL:**
1. Check if URL is valid and accessible
2. Test URL in browser directly
3. Ensure HTTPS if required

### Issue: Wrong domain showing in UI

**Check environment variable:**
```bash
# In Vercel dashboard or your deployment:
echo $NEXT_PUBLIC_LANDING_PAGE_DOMAIN
# Should output: AffClickero.com
```

**If development:**
```
Your .env file should have:
NEXT_PUBLIC_LANDING_PAGE_DOMAIN=localhost:3000
```

---

## 🔐 Security Considerations

### Subdomain Validation
- ✅ Only allowed characters (alphanumeric, hyphens)
- ✅ Uniqueness check prevents conflicts
- ✅ Length validation (3+ characters)

### URL Validation
- ✅ Tracking URLs are validated as URLs
- ✅ Must include protocol (http:// or https://)
- ✅ Checked before saving

### Published/Unpublished
- ✅ Unpublished pages return 404
- ✅ Only published pages are accessible
- ✅ Can be toggled anytime

### Ownership
- ✅ Users can only manage their own pages
- ✅ API checks user ownership

---

## 📈 Next Steps

### Immediate
- [ ] Configure DNS wildcard record
- [ ] Add environment variable
- [ ] Test with a landing page

### Optional Enhancements
- [ ] Custom domain support (users use their own domain)
- [ ] Subdomain availability checker
- [ ] Analytics dashboard
- [ ] Email notifications on clicks
- [ ] QR code generation for subdomains
- [ ] Branded "Under Construction" for unpublished pages

---

## 📞 API Reference

### Get Landing Page by Subdomain
```
GET /api/lp/test

Response:
- If published: Redirects to tracking URL (302)
- If not published: 404 JSON error
- Increments click count on redirect
```

### List User's Pages
```
GET /api/landing-pages
Header: x-user-id: user-123

Returns:
[
  {
    id: "...",
    subdomain: "test",
    trackingUrl: "https://...",
    isPublished: true,
    totalClicks: 42,
    ...
  }
]
```

### Create Page
```
POST /api/landing-pages
{
  subdomain: "test",
  trackingUrl: "https://affiliate.com/offer?id=123",
  templateId: "template-1",
  headline: "Test Offer",
  ...
}

Returns: Created landing page object
```

---

## 🎯 Summary Checklist

- [ ] Add wildcard DNS record (`*.AffClickero.com` → `cname.vercel.sh`)
- [ ] Add `NEXT_PUBLIC_LANDING_PAGE_DOMAIN` to `.env`
- [ ] Deploy changes
- [ ] Wait 24 hours for DNS propagation
- [ ] Test by creating a landing page
- [ ] Share landing page URL with users
- [ ] Monitor click counts

**That's it! Your subdomain landing pages are ready to use! 🚀**
