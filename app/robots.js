// app/robots.js
//
// Generates /robots.txt. Keeps the private account page, the API routes,
// and the login-link confirmation page (its URL carries a one-time token)
// out of search engines' index — everything else is fine to crawl.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/api/", "/login/verify"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
