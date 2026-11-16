/* Member-portal shortcut. A fetch handler is required for installability.
   Requests pass through so the staff app and the JSON API stay untouched. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // The handler itself is what makes Chrome offer install.
  // Requests are left to the network so Vercel rewrites and Supabase are untouched.
});
