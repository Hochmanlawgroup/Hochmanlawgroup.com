// Serves live Google Business Profile reviews to the site.
// Required Netlify environment variables:
//   GOOGLE_MAPS_API_KEY  - key with Places API (New) enabled
//   GOOGLE_PLACE_ID      - the firm's Place ID
// Responses are cached at the CDN for 6 hours to stay inside the free API tier.

export default async function handler() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) {
    return json({ error: "Reviews are not configured." }, 503);
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "displayName,rating,userRatingCount,googleMapsUri,reviews",
    },
  });

  if (!res.ok) {
    return json({ error: "Could not load reviews." }, 502);
  }

  const place = await res.json();
  const body = {
    name: place.displayName?.text,
    rating: place.rating,
    count: place.userRatingCount,
    mapsUrl: place.googleMapsUri,
    reviews: (place.reviews || [])
      .filter((r) => r.rating >= 4 && r.text?.text)
      .map((r) => ({
        author: r.authorAttribution?.displayName,
        photo: r.authorAttribution?.photoUri,
        rating: r.rating,
        when: r.relativePublishTimeDescription,
        text: r.text.text,
      })),
  };

  return json(body, 200, { "Cache-Control": "public, max-age=300, s-maxage=21600" });
}

function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export const config = { path: "/api/google-reviews" };
