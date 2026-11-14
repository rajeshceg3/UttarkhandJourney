# Mobile and security pass, 14 November 2026

One Explore action opens the journey panel at every width. Zoom/reset and category choices live in that panel, with no select menus or persistent metadata strapline. The existing warm OpenFreeMap style is unchanged: the live 390px baseline had quiet colors, low POI competition and readable labels, so a basemap replacement was not warranted.

Close controls have 44px hits. Panel and details support Escape, focus return and bounded scrolling. Camera, marker and interface animation are off by default. Pinch zoom remains enabled. Leaflet fade/zoom animation is disabled to avoid stale popups during immediate selection changes.

MapLibre 6.18.0 uses a bundled module worker. Browser checks require rendered features both at entry and after every place selection, rather than treating canvas existence as map readiness. Dependency updates bring npm audit from 19 findings to zero. CI adds a production build and audit before browser checks on Node 22. Legacy peer dependency resolution is explicit in .npmrc.

Local gate: fresh npm ci, ESLint, 34 unit tests with coverage, npm audit --audit-level=low, production build, and 10 browser tests pass. Browser coverage includes all ten locations at 320, 390 and 1280px with normal/reduced motion, plus existing itinerary add/remove/clear and modal checks. Selected-place map, panel and details pixels inspected at 390px, and panel at 320px.

Existing place illustrations are dataset placeholders, not travel photographs. External route service responses and physical iOS/Safari are not claimed as tested. No hosting plans, credentials, map palette or scene content changed.
