export function planner(L, locations, scene, distance, style, config) {
  document.body.classList.add(config.ooty ? "ooty" : "himalaya");
  const $ = (s) => document.querySelector(s),
    phone = () => innerWidth < 760 && innerHeight > 430;
  let selected = null,
    filter = "all",
    page = 0,
    view = "places",
    sheet = "peek",
    trip = [],
    routeOn = config.autoRoute,
    details = false;
  try {
    const v = JSON.parse(localStorage.getItem(config.storage) || "[]");
    if (Array.isArray(v))
      trip = [...new Set(v.filter((id) => locations.some((l) => l.id === id)))];
  } catch {
    $("#save-note").textContent =
      "Saved trip could not be read. You can still plan here.";
  }
  const map = L.map("map", {
    zoomControl: false,
    attributionControl: false,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
    maxZoom: 18,
  });
  for (const layer of style.layers || []) {
    if (layer.type === "symbol" && layer.paint) {
      if (layer.paint["text-color"]) layer.paint["text-color"] = "#7f8d74";
      layer.paint["text-halo-color"] = config.ooty ? "#e4eddf" : "#e5e9eb";
      layer.paint["text-halo-width"] = 2;
    }
  }
  const base = L.maplibreGL({ style, attributionControl: false }).addTo(map);
  L.control
    .attribution({ position: "bottomright", prefix: false })
    .addTo(map)
    .addAttribution(
      '<a href="https://openfreemap.org">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    );
  const pins = L.layerGroup().addTo(map),
    stamps = L.layerGroup().addTo(map);
  let routePath = null,
    routeShadow = null,
    routePoints = [];
  const routeSvg = L.svg({ padding: 1 }).addTo(map);
  let routeLabel = null;
  const ns = "http://www.w3.org/2000/svg";
  const status = (text, error = false) => {
    const e = $("#route-note");
    e.textContent = text;
    e.classList.toggle("error", error);
    e.setAttribute("role", error ? "alert" : "status");
  };
  const padding = () => {
    const portrait = phone(),
      land = innerWidth < 760 && !portrait;
    const panel = $("#panel").getBoundingClientRect();
    return {
      paddingTopLeft: [
        portrait ? 38 : land ? 250 : innerWidth < 1100 ? 390 : 445,
        portrait ? 108 : land ? 70 : 95,
      ],
      paddingBottomRight: [
        portrait ? 38 : 38,
        portrait
          ? Math.max(225, innerHeight - panel.top + 50)
          : land
            ? 92
            : 125,
      ],
      animate: false,
    };
  };

  function fit(stops = locations) {
    if (stops.length)
      map.fitBounds(L.latLngBounds(stops.map((l) => [l.lat, l.lng])), {
        ...padding(),
        maxZoom: config.ooty ? 13 : 9,
      });
  }
  function save() {
    try {
      localStorage.setItem(config.storage, JSON.stringify(trip));
      $("#save-note").textContent = "Saved only on this device.";
    } catch {
      $("#save-note").textContent =
        "This browser could not save your trip. Keep this tab open.";
    }
  }
  const capacity = () => (innerWidth < 760 ? 1 : 10);
  function setSheet(next) {
    sheet = next;
    $("#panel").dataset.sheet = sheet;
    $("#sheet-toggle").setAttribute("aria-expanded", String(sheet !== "peek"));
    $("#sheet-toggle").ariaLabel =
      sheet === "peek"
        ? "Expand places"
        : sheet === "half"
          ? "Expand places fully"
          : "Collapse places";
    render();
  }
  function select(loc) {
    selected = loc;
    details = true;
    if (view !== "trip") view = "places";
    const pool = view === "trip" ? trip.map(id => locations.find(l => l.id === id)) : locations.filter(l => filter === "all" || l.type === filter);
    if (!pool.includes(loc)) { filter = "all"; view = "places"; }
    page = Math.floor((view === "trip" ? trip : locations.filter(l => filter === "all" || l.type === filter).map(l => l.id)).indexOf(loc.id) / capacity());
    setSheet(phone() ? "half" : "full");
    const z = Math.max(map.getZoom(), config.ooty ? 15 : 11);
    map.setView([loc.lat, loc.lng], z, { animate: false });
    map.panBy(
      [
        phone() ? 0 : innerWidth < 760 ? -135 : -200,
        phone()
          ? Math.round(
              innerHeight / 2 -
                (80 + $("#panel").getBoundingClientRect().top) / 2,
            )
          : 0,
      ],
      { animate: false },
    );
    drawPins();
  }
  function drawPins() {
    pins.clearLayers();
    const groups = [];
    for (const loc of locations.filter(
      (l) => !(routeOn && trip.length >= 2 && trip.includes(l.id)),
    )) {
      const pt = map.latLngToContainerPoint([loc.lat, loc.lng]);
      if (
        pt.x < 26 ||
        pt.x > innerWidth - 26 ||
        pt.y < 26 ||
        pt.y > innerHeight - 26
      )
        continue;
      const blocked = [
        ...document.querySelectorAll(
          "#panel,.map-title,.map-tools,#credits-open",
        ),
      ].some((e) => {
        const b = e.getBoundingClientRect();
        return (
          b.width &&
          b.height &&
          pt.x > b.left - 26 &&
          pt.x < b.right + 26 &&
          pt.y > b.top - 26 &&
          pt.y < b.bottom + 26
        );
      });
      if (blocked) continue;
      if (
        routePath &&
        routePoints.some(
          (l) => map.latLngToContainerPoint([l.lat, l.lng]).distanceTo(pt) < 58,
        )
      )
        continue;
      let g = groups.find((x) => x.point.distanceTo(pt) < 48);
      if (!g) {
        g = { point: pt, list: [] };
        groups.push(g);
      }
      g.list.push(loc);
    }
    for (const g of groups) {
      const many = g.list.length > 1,
        loc = g.list[0];
      const lat = g.list.reduce((n, l) => n + l.lat, 0) / g.list.length,
        lng = g.list.reduce((n, l) => n + l.lng, 0) / g.list.length;
      const icon = L.divIcon({
        className: "drawn-marker",
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        html: `<button class="pin ${selected?.id === loc.id ? "active" : ""}" aria-label="${many ? `Explore ${g.list.length} nearby places` : loc.title}">${many ? g.list.length : `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="${{ garden: "M16 26V15m0 5C2 19 4 6 15 13c3-12 17-3 8 5m-7-2 6-4", lake: "M4 13q6-6 12 0t12 0M4 20q6-6 12 0t12 0", viewpoint: "M3 25 13 6l7 13 4-8 6 14z", historical: "M6 26V12l10-8 10 8v14zm8 0v-9h5v9M16 5v8", factory: "M4 25V13l9 4V9l11 8V4h4v21z", city: "M4 25V12h9v13m0 0V6h9v19m0 0V15h7v10", pilgrimage: "M5 26V15h7V9l4-6 4 6v6h7v11zm7-11h8m-6 11v-7h4v7", "hill-station": "M3 25 13 6l7 13 4-8 6 14z", park: "M16 28V12M5 20 16 3l11 17z" }[loc.type] || "M3 25 13 6l7 13 4-8 6 14z"}"/></svg>`}</button>`,
      });
      const m = L.marker([lat, lng], { icon, keyboard: false }).addTo(pins);
      m.bindTooltip(many ? `${g.list.length} nearby places` : loc.title, {
        direction: "top",
        offset: [0, -22],
      });
      m.on("click", () => {
        if (many) {
          map.fitBounds(L.latLngBounds(g.list.map((l) => [l.lat, l.lng])), {
            ...padding(),
            maxZoom: 17,
          });
          if (map.getZoom() < 13)
            map.setZoom(map.getZoom() + 1, { animate: false });
        } else select(loc);
      });
      m.on("mouseover", () =>
        document
          .querySelector(`[data-place="${loc.id}"]`)
          ?.classList.add("hovered"),
      );
      m.on("mouseout", () =>
        document
          .querySelector(`[data-place="${loc.id}"]`)
          ?.classList.remove("hovered"),
      );
    }
  }
  function paintRoute() {
    if (!routePath || routePoints.length < 2) return;
    const pts = routePoints.map((l) => map.latLngToLayerPoint([l.lat, l.lng]));
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let n = 1; n < pts.length; n++) {
      const a = pts[n - 1],
        b = pts[n],
        dx = b.x - a.x,
        dy = b.y - a.y,
        k = Math.min(18, Math.hypot(dx, dy) * 0.08);
      d += ` Q${(a.x + b.x) / 2 - (dy / Math.max(1, Math.hypot(dx, dy))) * k},${(a.y + b.y) / 2 + (dx / Math.max(1, Math.hypot(dx, dy))) * k} ${b.x},${b.y}`;
    }
    routePath.setAttribute("d", d);
    routeShadow.setAttribute("d", d);
    paintStamps();
    if (routeLabel) {
      const q = routePoints.map((l) =>
          map.latLngToContainerPoint([l.lat, l.lng]),
        ),
        w = Math.min(245, innerWidth - 32),
        min = phone()
          ? 16
          : innerWidth < 760
            ? 285
            : innerWidth < 1100
              ? 380
              : 430,
        x = Math.max(
          min,
          Math.min(
            innerWidth - w - 16,
            (Math.min(...q.map((p) => p.x)) + Math.max(...q.map((p) => p.x))) /
              2 -
              w / 2,
          ),
        ),
        y = Math.min(innerHeight - 155, Math.max(...q.map((p) => p.y)) + 32);
      Object.assign(routeLabel.style, {
        width: w + "px",
        left: x + "px",
        top: y + "px",
      });
    }
  }
  function paintStamps() {
    stamps.clearLayers();
    const used = [],
      portrait = phone(),
      land = innerWidth < 760 && !portrait,
      panel = $("#panel").getBoundingClientRect(),
      left = portrait ? 25 : land ? 250 : panel.right + 42,
      top = portrait ? 100 : land ? 70 : 65,
      right = innerWidth - 25,
      bottom = portrait ? panel.top - 25 : innerHeight - 95;
    for (const [n, l] of routePoints.entries()) {
      const base = map.latLngToContainerPoint([l.lat, l.lng]);
      let chosen = base;
      for (let step = 0; step < 400; step++) {
        const ring = Math.ceil(step / 16),
          angle = (step * Math.PI) / 8,
          p = base.add([
            Math.cos(angle) * ring * 16,
            Math.sin(angle) * ring * 16,
          ]);
        p.x = Math.max(left, Math.min(right, p.x));
        p.y = Math.max(top, Math.min(bottom, p.y));
        if (!used.some((q) => q.distanceTo(p) < 38)) {
          chosen = p;
          break;
        }
      }
      used.push(chosen);
      const ll = map.containerPointToLatLng(chosen);
      if (base.distanceTo(chosen) > 6)
        L.polyline([[l.lat, l.lng], ll], {
          color: "#536c5d",
          weight: 1,
          opacity: 0.7,
          interactive: false,
        }).addTo(stamps);
      L.marker(ll, {
        interactive: false,
        icon: L.divIcon({
          className: "stop-stamp",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `<span>${n + 1}</span>`,
        }),
      }).addTo(stamps);
    }
  }
  function drawRoute(reframe = false) {
    routePath?.remove();
    routeShadow?.remove();
    routeLabel?.remove();
    routeLabel = null;
    routePath = null;
    stamps.clearLayers();
    routePoints = trip.map((id) => locations.find((l) => l.id === id));
    if (!routeOn) {
      drawPins();
      status("A sketch between stops, not road directions.");
      return;
    }
    if (routePoints.length < 2) {
      drawPins();
      status("Pick two places to draw a trip.");
      return;
    }
    try {
      if (
        routePoints.some(
          (l) => !Number.isFinite(l.lat) || !Number.isFinite(l.lng),
        )
      )
        throw Error("coordinates");
      for (const cls of ["route-underlay", "sketch-route"]) {
        const p = document.createElementNS(ns, "path");
        p.setAttribute("class", cls);
        p.setAttribute("fill", "none");
        routeSvg._rootGroup.appendChild(p);
        if (cls === "sketch-route") routePath = p;
        else routeShadow = p;
      }
      paintRoute();
      routeLabel = document.createElement("div");
      routeLabel.className = "route-distance map-route-label";
      routeLabel.textContent = `About ${distance(routePoints)} km as the crow flies`;
      document.body.append(routeLabel);
      paintRoute();
      paintStamps();
      status(
        `About ${distance(routePoints)} km as the crow flies · not a road route`,
      );
      drawPins();
      if (reframe) {
        if (phone()) setSheet("peek");
        fit(routePoints);
      }
    } catch {
      routePath?.remove();
      routeShadow?.remove();
      routePath = null;
      routeShadow = null;
      routeLabel?.remove();
      routeLabel = null;
      status("Sketch failed. Remove a stop to retry.", true);
    }
  }
  function add(id) {
    if (!trip.includes(id)) {
      trip.push(id);
      save();
      render();
      drawRoute(false);
      render();
    }
  }
  const tripSummary = document.createElement("p");
  tripSummary.id = "trip-summary";
  $("#rows").after(tripSummary);
  const mobileNav = document.createElement("nav");
  mobileNav.id = "mobile-nav"; mobileNav.ariaLabel = "Planner views";
  mobileNav.innerHTML = '<button id="browse-mode">Places</button><button id="trip-mode">Your trip <span></span></button>';
  $('#sheet-toggle').after(mobileNav);
  const feedback = document.createElement('p'); feedback.id='save-feedback'; feedback.setAttribute('role','status'); $('#rows').after(feedback);
  const currentPool = () => view === 'trip' ? trip.map(id=>locations.find(l=>l.id===id)) : locations.filter(l=>filter==='all'||l.type===filter);
  function openMode(mode) { view=mode; details=false; selected=null; page=0; setSheet(phone()?'half':'full'); if(mode==='trip'&&trip.length>1)fit(currentPool());else fit(); }
  $('#browse-mode').onclick=()=>openMode('places'); $('#trip-mode').onclick=()=>openMode('trip');
  function stepPlace(delta) { const pool=currentPool(); page=Math.max(0,Math.min(Math.ceil(pool.length/capacity())-1,page+delta)); if(details&&pool[page])select(pool[page]);else { selected=null;render(); } }
  function render() {
    const pool =
      view === "trip"
        ? trip.map((id) => locations.find((l) => l.id === id))
        : locations.filter((l) => filter === "all" || l.type === filter);
    const cap = capacity();
    page = Math.max(
      0,
      Math.min(page, Math.max(0, Math.ceil(pool.length / cap) - 1)),
    );
    $("#rows").replaceChildren();
    $('#sheet-toggle').textContent = sheet==='peek' ? (view==='trip'?'Open your trip ↑':'Browse places ↑') : 'Show map ↓';
    $('#sheet-toggle').ariaLabel = sheet==='peek' ? (view==='trip'?'Open your trip':'Browse places') : 'Show map';
    $('#browse-mode').setAttribute('aria-pressed',String(view==='places'));
    $('#trip-mode').setAttribute('aria-pressed',String(view==='trip'));
    $('#trip-mode span').textContent = trip.length ? String(trip.length) : '';
    feedback.textContent = details && selected && trip.includes(selected.id) ? 'Saved to your trip' : '';
    feedback.hidden = !feedback.textContent;
    $('#panel').dataset.detail = String(details);
    $('#filters').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===filter)));

    $("#panel").classList.toggle(
      "has-detail",
      details && !!selected,
    );
    $("#peek-preview").textContent = selected
      ? selected.title
      : locations[0].title;
    $("#panel").dataset.view = view;
    $("#trip-count").textContent = trip.length;
    tripSummary.textContent =
      routeOn && trip.length > 1
        ? `About ${distance(trip.map((id) => locations.find((l) => l.id === id)))} km · straight-line sketch`
        : "";
    if (innerWidth < 760 && innerHeight <= 430 && routeOn && trip.length > 1)
      tripSummary.textContent = `About ${distance(trip.map((id) => locations.find((l) => l.id === id)))} km · sketch`;
    $("#peek-preview").dataset.distance = tripSummary.textContent;
    if (innerWidth <= 350 && routeOn && trip.length > 1)
      $("#peek-preview").textContent = tripSummary.textContent;
    $("#trip-open").hidden = !config.ooty && trip.length === 0;
    $("#trip-open").classList.toggle("in-trip", view === "trip");
    $("#trip-open").ariaLabel = `Open trip, ${trip.length} stops`;
    $("#section-title").textContent =
      details && selected ? selected.title : view === "trip" ? "Your trip" : "Choose a place";
    $("#section-copy").textContent =
      view === "trip"
        ? "Stops in the order you added them."
        : details && selected
          ? selected.description +
            (selected.bestTime
              ? " Best time: " +
                selected.bestTime +
                ". Allow " +
                selected.timeSpent +
                "."
              : "")
          : config.subtitle;
    for (const loc of pool.slice(page * cap, page * cap + cap)) {
      const row = document.createElement("article");
      row.className = "place-row";
      row.dataset.place = loc.id;
      if (loc.id === selected?.id) row.classList.add("selected");
      const choose = document.createElement(details && selected?.id === loc.id ? "div" : "button");
      choose.className = "place-select";
      choose.ariaLabel = `View ${loc.title}`;
      const img = document.createElement("img");
      img.src = scene(loc.type, loc.id);
      img.alt = "";
      img.width = 96;
      img.height = 72;
      const text = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = loc.title;
      const type = document.createElement("span");
      type.className = "place-type";
      type.textContent = loc.type.replaceAll("-", " ");
      text.append(title, type);
      choose.append(img, text);
      choose.onclick = () => select(loc);
      row.append(choose);
      const action = document.createElement("button");
      action.className = "add-stop";
      action.textContent =
        view === "trip" ? "Remove" : trip.includes(loc.id) ? "Saved" : "Add to trip";
      if(!phone())action.textContent=view==="trip"?"−":trip.includes(loc.id)?"✓":"+";
      action.ariaLabel =
        view === "trip"
          ? `Remove ${loc.title}`
          : trip.includes(loc.id)
            ? `${loc.title} saved`
            : `Add ${loc.title} to trip`;
      if (trip.includes(loc.id) && view !== "trip") {
        action.hidden = true;
      } else
        action.onclick = () => {
          if (view === "trip") {
            trip = trip.filter((id) => id !== loc.id);
            save();
            render();
            drawRoute(false);
            if(!trip.length){ details=false; selected=null; render(); }
          } else add(loc.id);
        };
      row.append(action);
      row.onmouseenter = () => {
        for (const b of document.querySelectorAll(".pin"))
          if (b.ariaLabel === loc.title) b.classList.add("hovered");
      };
      row.onmouseleave = () =>
        document
          .querySelectorAll(".pin.hovered")
          .forEach((b) => b.classList.remove("hovered"));
      $("#rows").append(row);
    }
    if (details && selected)
      $("#section-copy").textContent =
        selected.description +
        (selected.bestTime
          ? " Best time: " +
            selected.bestTime +
            ". Allow " +
            selected.timeSpent +
            "."
          : "");
    if (!pool.length) {
      const p = document.createElement("p");
      p.className = "empty-state";
      p.textContent =
        view === "trip"
          ? "No stops yet. Open Places and add a stop."
          : "No places in this category.";
      $("#rows").append(p);
    }
    $(".pager").hidden = pool.length < 2;
    $("#page-label").textContent = pool.length
      ? `${page * cap + 1}${cap > 1 ? "–" + Math.min((page + 1) * cap, pool.length) : ""} of ${pool.length}`
      : "No stops yet";
    $("#previous").textContent="← Prev";
    $("#next").textContent="Next →";
    $("#previous").ariaLabel="Previous place"; $("#next").ariaLabel="Next place";
    $("#previous").hidden = page === 0;
    $("#next").hidden = (page + 1) * cap >= pool.length;
    $("#route-toggle").hidden = !config.ooty || view !== "trip";
    $("#route-toggle").textContent = routeOn ? "Hide route" : "Draw the route";
    $("#back-places").hidden = !details && view !== "trip";
    $("#back-places").textContent = details ? (view === "trip" ? "← Your trip" : "← Places") : "← Places";
    $("#view-sketch").hidden = true;
  }
  const types = ["all", ...new Set(locations.map((l) => l.type))];
  for (const type of types) {
    const b = document.createElement("button");
    b.textContent =
      type === "all"
        ? "All"
        : type === "hill-station"
          ? "Hills"
          : type === "pilgrimage"
            ? "Sacred"
            : type.replaceAll("-", " ");
    b.dataset.type = type;
    b.setAttribute("aria-pressed", String(type === "all"));
    b.onclick = () => {
      filter = type;
      page = 0;
      view = "places";
      details = false;
      selected = null;
      b.scrollIntoView({
        block: "nearest",
        inline: "center",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      $("#filters")
        .querySelectorAll("button")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (phone()) setSheet("half");
      else render();
    };
    $("#filters").append(b);
  }
  $('#sheet-toggle').onclick = () => { setSheet(sheet==='peek'?'half':'peek'); if(details&&selected){ map.setView([selected.lat,selected.lng],Math.max(map.getZoom(),11),{animate:false}); map.panBy([0,Math.round(innerHeight/2-(80+$('#panel').getBoundingClientRect().top)/2)],{animate:false}); } else if(routeOn&&trip.length>1)fit(routePoints);else fit(); };
  $('#trip-open').onclick=()=>openMode('trip');
  $('#back-places').onclick=()=>{ if(details){details=false;selected=null;render();fit(view==='trip'&&trip.length?currentPool():locations);}else openMode('places'); };
  $('#previous').onclick=()=>stepPlace(-1); $('#next').onclick=()=>stepPlace(1);
  $("#view-sketch").onclick = () => {
    routeOn = true;
    drawRoute(true);
    render();
  };
  $("#route-toggle").onclick = () => {
    routeOn = !routeOn;
    drawRoute(true);
    render();
  };
  $("#zoom-in").onclick = () => map.zoomIn(1, { animate: false });
  $("#zoom-out").onclick = () => map.zoomOut(1, { animate: false });
  $("#reset").onclick = () => {
    selected = null;
    details = false;
    view="places"; page=0; filter="all"; setSheet("peek");
    fit();
    drawPins();
  };
  $("#guide").hidden = !config.ooty;
  let guideStep = 0;
  $("#guide").onclick = () => {
    const notes = [
      "Choose a place on the map or in this panel.",
      "Add places with the plus button. Your trip stays on this device.",
      "Open Your trip and tap Draw the route. The dashed sketch is not road directions.",
    ];
    status(notes[guideStep]);
    guideStep = (guideStep + 1) % notes.length;
    $("#guide").textContent = guideStep ? "Next tip →" : "Replay tips ↻";
    if (phone()) setSheet("half");
  };
  map.on("moveend zoomend", () => {
    drawPins();
    paintRoute();
  });
  map.on("viewreset move", paintRoute);
  base.getMaplibreMap?.()?.on("error", () => {
    const e = $("#tile-note");
    e.hidden = false;
    e.textContent = "Map tiles unavailable. Places and trip sketch still work.";
  });
  window.addEventListener("resize", () => {
    map.invalidateSize();
    render();
    paintRoute();
    drawPins();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      view = "places";
      details = false;
      setSheet("peek");
      map.closePopup();
    }
  });
  setSheet("peek");
  fit();
  drawPins();
  drawRoute();
  map.attributionControl.setPrefix(false);
  for (const key of Object.keys(map.attributionControl._attributions)) {
    if (!key.includes(">OSM<"))
      delete map.attributionControl._attributions[key];
  }
  map.attributionControl._update();
  $("#panel-collapse").onclick = () => {
    document.body.classList.toggle("panel-collapsed");
    $("#panel-collapse").textContent = document.body.classList.contains(
      "panel-collapsed",
    )
      ? "Places →"
      : "← Hide";
  };
  $("#credits-open").onclick = () => {
    $("#credits").hidden = !$("#credits").hidden;
  };
}
