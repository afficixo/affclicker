---
title: Affiliate Redirect Flow
---

# Affiliate redirect flow

This diagram describes the three affiliate-link redirect handlers:

- `src/app/[slug]/route.ts`
- `src/app/redirect/[slug]/route.ts`
- `src/app/api/redirect/[slug]/route.ts`

```mermaid
flowchart TD
    A["Visitor requests an affiliate link"] --> B["Resolve slug and request details"]
    B --> C{"Link exists and is active?"}
    C -- "No" --> D["Return 404"]
    C -- "Yes" --> E["Resolve client IP from trusted proxy headers"]
    E --> F["Detect bot from User-Agent"]
    
F --> G{"IP in 57.141.0.0/24<br/>or User-Agent detector says bot?"}
    G -- "Yes" --> H["Increment link botClicks"]
    H --> I["Load link owner's bot fallback URL"]
    I --> J{"Fallback configured?"}
    J -- "Yes" --> K["302 redirect to configured fallback"]
    J -- "No" --> L["302 redirect to existing default fallback"]

    G -- "No" --> M["Resolve geo and eligible offer owners"]
    M --> N["Select offer for country / group"]
    N --> O{"Offer available?"}
    O -- "No" --> P["Return 404 or selection error"]
    O -- "Yes" --> Q["Check secret-redirect rules"]
    Q --> R{"Secret redirect selected?"}
    R -- "Yes" --> S["Use secret redirect behavior"]
    R -- "No" --> T["Deduplicate visitor and record click"]
    S --> U["Build final offer URL"]
    T --> U
    U --> V["Increment totalClicks<br/>and uniqueClicks when unique"]
    V --> W["302 redirect to selected offer"]
```

## IP rule

The permanent application-level rule matches IPv4 addresses from
`57.141.0.0` through `57.141.0.255` (`57.141.0.0/24`). A match follows the
same bot-fallback branch and increments the link's bot-click counter; it does
not create a regular click record or continue to offer selection.

The rule is applied only by the three affiliate redirect handlers above. It
does not affect landing pages, short URLs, or other routes. It is a redirect
to the configured/default fallback, not a network-level deny.

The handlers resolve the client IP from `cf-connecting-ip`, `true-client-ip`,
`x-real-ip`, then the first `x-forwarded-for` value. These headers must be
overwritten or supplied by a trusted proxy for the range rule to represent the
actual visitor IP.

## Route-specific implementation note

The route implementations share the same decision and outcomes, but their
operation order differs slightly. `/api/redirect/[slug]` checks the IP rule
before geo and offer lookup. `/[slug]` and `/redirect/[slug]` currently start
geo and eligible-owner lookups alongside bot detection before evaluating the
IP rule; they still exit to the fallback before selecting an offer or recording
a regular click.