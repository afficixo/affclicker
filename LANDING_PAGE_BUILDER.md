# Landing Page Builder - User Guide

## Overview
The Landing Page Builder allows you to create beautiful, custom landing pages with affiliate/tracking links. Your landing pages are automatically hosted at a custom subdomain on `AffClickero.com` and can be published instantly.

## Features

### 1. **Custom Subdomain**
- Choose a unique subdomain for your landing page (e.g., `myoffer` → `myoffer.AffClickero.com`)
- Real-time validation to ensure availability
- Only lowercase letters, numbers, and hyphens allowed

### 2. **Tracking Link Integration**
- Paste your affiliate or offer URL
- All clicks on your landing page redirect to this URL
- Automatic click tracking per landing page

### 3. **Template Selection**
- Choose from pre-made, professional templates:
  - **Modern Offer**: Gradient backgrounds, sleek design
  - **Minimal Design**: Clean, conversion-focused
  - **Dark Gradient**: Modern dark theme with vibrant colors

### 4. **Content Customization**
Customize each landing page with:
- **Headline**: Main title/headline
- **Description**: Subtitle or description text
- **Image URL**: Add hero image or product image
- **Primary Color**: Main accent color (default: cyan)
- **Secondary Color**: Secondary accent color (default: violet)
- **Button Text**: Custom CTA button text

### 5. **Publishing**
- **One-click publishing**: Make your landing page live instantly
- **Unpublish anytime**: Hide your landing page from the public
- **Click tracking**: Monitor how many clicks each page receives

## How to Use

### Step 1: Navigate to Landing Page Builder
1. Go to Admin Dashboard
2. Click "Landing page Builder" in the sidebar

### Step 2: Create a New Landing Page
1. Click "New Landing Page" button
2. Fill in the basic information:
   - Choose a subdomain
   - Paste your tracking link

### Step 3: Select Template
Choose one of the available templates:
- **Modern Offer**: Best for tech/SaaS offers
- **Minimal Design**: Best for conversions
- **Dark Gradient**: Best for modern, trendy offers

### Step 4: Customize Content
- Add your headline
- Write your description
- Add an image URL
- Select your color scheme
- Customize button text

### Step 5: Publish
1. Click "Create Landing Page"
2. Your page is created and saved
3. Click "Publish" to make it live
4. Share the URL: `https://[subdomain].AffClickero.com`

## Example Workflow

```
1. Subdomain: "summer-sale"
   → URL: https://summer-sale.AffClickero.com

2. Tracking URL: "https://affiliate.example.com/click?id=123"

3. Choose Template: Modern Offer

4. Customize:
   - Headline: "🔥 Limited Time Summer Sale!"
   - Description: "Get 50% off everything. Offer ends soon!"
   - Primary Color: #FF6B6B (red)
   - Button Text: "Grab Your Deal"

5. Publish → Live instantly!
```

## Managing Landing Pages

### View All Pages
All your created landing pages are displayed in a grid with:
- Subdomain URL
- Publication status
- Total clicks
- Quick actions

### Edit a Page
Currently, you can:
- Update customization after creation
- Change publish status
- Delete pages

### Delete a Page
Click the trash icon and confirm deletion. **This action is permanent.**

## Click Tracking

Each landing page automatically tracks:
- **Total Clicks**: Every click on the page redirects to your tracking URL
- **Click History**: View click statistics (coming soon)

## Template Management (Owner Only)

### Creating Custom Templates
1. Go to **Settings** → **Templates**
2. Click "New Template"
3. Fill in:
   - Template Name
   - Description
   - Thumbnail URL
   - HTML Content (with variables)
   - CSS Styles

### Template Variables
Use these variables in your HTML/CSS:
- `{headline}` - Page headline
- `{description}` - Page description
- `{imageUrl}` - Hero image URL
- `{buttonText}` - CTA button text
- `{primaryColor}` - Primary color hex
- `{secondaryColor}` - Secondary color hex

### Example Template HTML
```html
<div class="container">
  <h1>{headline}</h1>
  <p>{description}</p>
  <img src="{imageUrl}" alt="Offer" />
  <a href="#" class="button">{buttonText}</a>
</div>
```

### Example Template CSS
```css
.container {
  background: linear-gradient(135deg, {primaryColor}20 0%, {secondaryColor}20 100%);
  padding: 40px;
  text-align: center;
}

.button {
  background: linear-gradient(135deg, {primaryColor} 0%, {secondaryColor} 100%);
  padding: 15px 40px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}
```

## Best Practices

### URL Structure
- Use lowercase letters and hyphens only
- Make it memorable and SEO-friendly
- Examples: `free-trial`, `black-friday-2024`, `vip-offer`

### Content
- Keep headlines concise and attention-grabbing
- Use clear, benefit-focused copy
- Add high-quality images for better conversions
- Use contrasting colors for CTAs

### Colors
- Primary: Should be vibrant and eye-catching
- Secondary: Complement the primary color
- Ensure good contrast for readability

### Call-to-Action
- Keep button text short (e.g., "Get Started", "Claim Offer")
- Use action-oriented verbs
- Make it visually prominent

## Troubleshooting

### Subdomain Already Taken
- Choose a different subdomain
- Use variations like adding numbers or hyphens

### Image Not Loading
- Ensure the URL is correct and publicly accessible
- Use HTTPS URLs
- Check image file format (JPG, PNG, WebP)

### Page Not Publishing
- Ensure all required fields are filled
- Check your internet connection
- Try refreshing the page

### Click Redirects Not Working
- Verify the tracking URL is correct
- Ensure it's a valid, accessible URL
- Check for typos in the URL

## Security & Privacy

- All landing pages are public
- No sensitive information should be added
- Affiliate links are revealed in the URL bar
- Your account credentials are never stored on landing pages

## FAQ

**Q: Can I change the subdomain after creating a page?**
A: Not yet. Delete and recreate if needed.

**Q: How many landing pages can I create?**
A: Unlimited (depends on your plan).

**Q: Can I use custom domains instead of subdomains?**
A: Coming soon - you'll be able to use your own custom domains.

**Q: Are landing pages mobile-responsive?**
A: Yes, all templates are fully responsive.

**Q: Can I see visitor details (location, device, etc.)?**
A: Click tracking coming soon with detailed analytics.

**Q: What happens if I unpublish a page?**
A: The page becomes inaccessible. Users visiting the URL will get a 404 error.

---

For support or feature requests, contact your administrator.
