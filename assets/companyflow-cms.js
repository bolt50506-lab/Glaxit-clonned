// Public frontend: content is maintained directly in the website files. The Supabase CMS is intentionally not loaded here to keep the public site independent of admin authentication/API availability.
(function(){
  if (location.pathname.indexOf("/admin") === 0) return;
})();
