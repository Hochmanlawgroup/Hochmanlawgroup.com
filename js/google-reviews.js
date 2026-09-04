// Renders live Google reviews into any element with id="google-reviews".
// Include with: <script src="/js/google-reviews.js" defer></script>
(function () {
  var mount = document.getElementById("google-reviews");
  if (!mount) return;

  fetch("/api/google-reviews")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(render)
    .catch(function () { mount.remove(); });

  function stars(n) {
    return "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function render(data) {
    if (!data.reviews || !data.reviews.length) { mount.remove(); return; }
    var cards = data.reviews.slice(0, 6).map(function (r) {
      return (
        '<figure class="gr-card">' +
        '<div class="gr-stars" aria-label="' + r.rating + ' out of 5 stars">' + stars(r.rating) + "</div>" +
        '<blockquote class="gr-text">' + esc(r.text) + "</blockquote>" +
        '<figcaption class="gr-author">' + esc(r.author) +
        '<span class="gr-when">' + esc(r.when) + "</span></figcaption>" +
        "</figure>"
      );
    }).join("");

    mount.innerHTML =
      '<div class="gr-head">' +
      '<h2>What Clients Say</h2>' +
      '<p class="gr-summary"><span class="gr-stars">' + stars(data.rating) + "</span> " +
      data.rating + " from " + data.count + ' Google reviews &middot; ' +
      '<a href="' + esc(data.mapsUrl) + '" target="_blank" rel="noopener">Read them on Google</a></p>' +
      "</div>" +
      '<div class="gr-grid">' + cards + "</div>";

    // Review structured data for search results
    var ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LegalService",
      name: data.name,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.rating,
        reviewCount: data.count,
      },
    });
    document.head.appendChild(ld);
  }
})();
