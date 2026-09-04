# Google Reviews: Live Feed Setup

The site pulls reviews directly from your Google Business Profile through the Places API, exactly as advised: a dynamic feed, not a screenshot.

## What ships here

- `netlify/functions/google-reviews.mjs` serves `/api/google-reviews`, calling Google with a server-side key and caching results for six hours.
- `js/google-reviews.js` renders the section, links to your Google listing, and injects aggregate-rating structured data for search.
- `css/google-reviews.css` styles it.

## One-time setup (about ten minutes)

1. In [Google Cloud Console](https://console.cloud.google.com), create a project, enable **Places API (New)**, and create an API key. Restrict the key to that API only.
2. Find your Place ID with the [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder) by searching your firm's name.
3. In Netlify, open the site's **Environment variables** and add:
   - `GOOGLE_MAPS_API_KEY` = your key
   - `GOOGLE_PLACE_ID` = your Place ID
4. Redeploy.

## Adding the section to any page

```html
<link rel="stylesheet" href="/css/google-reviews.css">
...
<section id="google-reviews"></section>
...
<script src="/js/google-reviews.js" defer></script>
```

If reviews cannot load, the section removes itself; the page never shows an empty box.

## Cost

The function is cached at the CDN, so Google sees at most a handful of requests per day. That stays comfortably inside the free tier.
