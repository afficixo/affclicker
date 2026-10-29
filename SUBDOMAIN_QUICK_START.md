# Subdomain Setup Checklist

## Quick Start - Subdomain Configuration

### What You Need to Know
- ✅ Your app is on **Vercel** - wildcard subdomains work automatically
- ✅ Landing pages will be at: `subdomain.AffClickero.com`
- ✅ Requires **1 DNS record** and **1 environment variable**

---

## Step-by-Step Setup

### 1️⃣ **Add DNS Record** (Your Domain Registrar)
Time: ~5 minutes | Propagation: 24 hours

Go to your domain registrar (Namecheap, GoDaddy, Route 53, etc.):
```
Type:   CNAME
Name:   *.AffClickero.com
Value:  cname.vercel.sh
TTL:    3600 (default)
```

### 2️⃣ **Add Environment Variable** (Vercel Dashboard)
Time: ~2 minutes | Effect: Immediate after redeploy

Go to Vercel Project Settings:
```
Name:   NEXT_PUBLIC_LANDING_PAGE_DOMAIN
Value:  AffClickero.com
Env:    Production, Preview, Development
```

Or add to `.env`:
```
NEXT_PUBLIC_LANDING_PAGE_DOMAIN=AffClickero.com
```

### 3️⃣ **Redeploy** (Automatic or Manual)
Time: ~1 minute

- Commit `.env` changes to git
- Or push to Vercel dashboard
- Wait for deployment to finish

### 4️⃣ **Test** (Try Creating a Landing Page)
Time: ~3 minutes

1. Go to `/admin/landing-builder`
2. Click "New Landing Page"
3. Enter subdomain: `test`
4. Paste tracking URL
5. Complete the form
6. Publish
7. Visit: `https://test.AffClickero.com`
8. Should redirect to your tracking URL ✓

---

## Result

After setup:
```
User creates landing page with subdomain: "summer-sale"
              ↓
Live URL: https://summer-sale.AffClickero.com
              ↓
User clicks button
              ↓
Redirects to your affiliate URL ✓
```

---

## DNS Verification (Optional)

To verify DNS is working:

```bash
# Mac/Linux
nslookup test.AffClickero.com

# Windows PowerShell
Resolve-DnsName test.AffClickero.com

# Expected output:
# test.AffClickero.com  CNAME  cname.vercel.sh
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Landing page returns 404 | Is page published? Check status in builder |
| Domain shows wrong name | Update `NEXT_PUBLIC_LANDING_PAGE_DOMAIN` env var |
| DNS not resolving | Wait 24 hours or check registrar DNS settings |
| Redirect doesn't work | Verify tracking URL is correct and accessible |

---

## Documentation

- **Full Setup Guide**: `SUBDOMAIN_SETUP_GUIDE.md`
- **Landing Page Builder Guide**: `LANDING_PAGE_BUILDER.md`
- **Technical Details**: `LANDING_PAGE_BUILDER_COMPLETE.md`

---

## Summary

| Task | Status | Time |
|------|--------|------|
| Add DNS wildcard record | ⏳ TODO | 5 min |
| Add environment variable | ⏳ TODO | 2 min |
| Redeploy to Vercel | ⏳ TODO | 1 min |
| Test landing page | ⏳ TODO | 3 min |
| **Total** | | **11 min** |

**That's it! Ready to launch subdomains 🚀**
