import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import feather from 'feather-icons';

export const initMap = (elementId, locations, onMarkerClick, onAddToTrip, onMoreInfo, getItinerary) => {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) {
        console.error(`Map element with id "${elementId}" not found.`);
        return null;
    }

    const map = L.map(elementId, {
        zoomControl: false,
        attributionControl: false // We can add a smaller one if needed or style the default
    }).setView([30.0668, 79.0193], 8);

    L.control.attribution({
        position: 'bottomright'
    }).addTo(map);

    // Custom Zoom Control to top-right with margin handled in CSS
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Create a marker cluster group with polished styling
    const markersCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        disableClusteringAtZoom: 16,
        iconCreateFunction: function (cluster) {
            const count = cluster.getChildCount();
            let colorClass = 'bg-accent-sage';
            if (count >= 5) colorClass = 'bg-accent-terracotta';

            // Added animate-pulse-slow for a breathing effect
            return L.divIcon({
                html: `<div class="${colorClass} text-white font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110 animate-pulse-slow" style="width: 44px; height: 44px; font-size: 16px;">${count}</div>`,
                className: 'marker-cluster-custom',
                iconSize: L.point(44, 44)
            });
        }
    });

    const markers = {};
    let routingControl = null;

    // Helper: Get SVG String for Icons (Reliable)
    const getIconSVG = (iconName, size = 20, color = 'currentColor', strokeWidth = 2) => {
        return feather.icons[iconName].toSvg({ width: size, height: size, color: color, 'stroke-width': strokeWidth });
    };

    // Helper: Create Popup Content
    const createPopupContent = (loc) => {
        const div = document.createElement('div');
        // No overflow-hidden on wrapper, we handle rounding via CSS on leaflet-popup-content-wrapper
        div.className = "flex flex-col w-[280px]";

        // Image Section
        const imgContainer = document.createElement('div');
        imgContainer.className = "relative h-40 w-full rounded-t-2xl overflow-hidden"; // Rounded top explicitly

        const img = document.createElement('img');
        img.src = loc.image;
        img.alt = loc.title;
        img.className = "w-full h-full object-cover transform hover:scale-105 transition-transform duration-700";
        img.loading = "lazy";
        imgContainer.appendChild(img);

        // Overlay Gradient
        const gradient = document.createElement('div');
        gradient.className = "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4";

        const title = document.createElement('h3');
        title.className = "text-white font-serif text-xl font-bold leading-tight drop-shadow-md";
        title.textContent = loc.title;
        gradient.appendChild(title);

        imgContainer.appendChild(gradient);
        div.appendChild(imgContainer);

        // Content Section
        const contentDiv = document.createElement('div');
        contentDiv.className = "p-4 flex flex-col gap-3 bg-white/50";

        const desc = document.createElement('p');
        desc.className = "text-sm text-gray-600 line-clamp-2 leading-relaxed";
        desc.textContent = loc.description;
        contentDiv.appendChild(desc);

        // Buttons
        const btnGroup = document.createElement('div');
        btnGroup.className = "flex gap-2 mt-1";

        const currentItinerary = getItinerary ? getItinerary() : [];
        const isAdded = currentItinerary.includes(loc.id);

        const addBtn = document.createElement('button');
        // Primary Action
        const baseBtnClass = "flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95";

        if (isAdded) {
            addBtn.className = `${baseBtnClass} bg-gray-100 text-accent-sage cursor-default shadow-none`;
            addBtn.innerHTML = `<span>Added</span> ${getIconSVG('check', 14)}`;
            addBtn.disabled = true;
        } else {
            addBtn.className = `${baseBtnClass} bg-accent-sage text-white hover:bg-accent-sage-dark`;
            addBtn.innerHTML = `<span>Add to Trip</span> ${getIconSVG('plus', 14, 'white')}`;
            addBtn.onclick = (e) => {
                e.stopPropagation();
                onAddToTrip(loc.id);
                // Optimistic UI update for button
                addBtn.className = `${baseBtnClass} bg-gray-100 text-accent-sage cursor-default shadow-none`;
                addBtn.innerHTML = `<span>Added</span> ${getIconSVG('check', 14)}`;
            };
        }
        btnGroup.appendChild(addBtn);

        const infoBtn = document.createElement('button');
        infoBtn.className = "flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md active:scale-95";
        infoBtn.textContent = "More Info";
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            onMoreInfo(loc);
        };
        btnGroup.appendChild(infoBtn);

        contentDiv.appendChild(btnGroup);
        div.appendChild(contentDiv);

        return div;
    };

    const getPinSVG = (type) => {
        const iconMap = {
            'city': 'map-pin',
            'pilgrimage': 'sunrise',
            'hill-station': 'cloud',
            'park': 'compass'
        };
        return getIconSVG(iconMap[type] || 'map-pin', 18, '#E76F51', 2.5);
    };

    // Add Markers
    locations.forEach(loc => {
        const svgString = getPinSVG(loc.type);

        // Custom Pin Style - Polished
        const iconHtml = `
            <div class="relative w-12 h-12 flex items-center justify-center group cursor-pointer">
                <!-- Outer Ring Pulse (CSS) -->
                <div class="absolute inset-0 bg-white/30 rounded-full animate-pulse-slow"></div>
                <!-- Main Circle -->
                <div class="absolute inset-1 bg-white rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300 border-[3px] border-white flex items-center justify-center z-10">
                    ${svgString}
                </div>
                <!-- Tip -->
                <div class="absolute -bottom-1 w-3 h-3 bg-white transform rotate-45 shadow-sm z-0"></div>
            </div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: '', // Remove default styles
            iconSize: [48, 48],
            iconAnchor: [24, 52], // Tip of the pin (adjusted for larger size)
            popupAnchor: [0, -50]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

        marker.bindPopup(() => createPopupContent(loc), {
            closeButton: false,
            offset: [0, 10],
            maxWidth: 300,
            minWidth: 280,
            className: 'glass-popup' // We can target this if needed, but wrapper covers most
        });

        marker.on('click', () => {
            onMarkerClick(loc.id);
        });

        markersCluster.addLayer(marker);
        markers[loc.id] = marker;
    });

    map.addLayer(markersCluster);

    // Methods
    const flyToLocation = (lat, lng) => {
        if (map) {
            map.flyTo([lat, lng], 14, {
                animate: true,
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    };

    const openMarkerPopup = (id) => {
        if (markers[id]) {
            markersCluster.zoomToShowLayer(markers[id], () => {
                markers[id].openPopup();
            });
        }
    };

    const updateMapRoute = (itineraryIds) => {
        if (!map) return;
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }

        if (!itineraryIds || itineraryIds.length < 2) return;

        const waypoints = itineraryIds
            .map(id => locations.find(l => l.id === id))
            .filter(Boolean)
            .map(loc => L.latLng(loc.lat, loc.lng));

        routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [
                    { className: 'route-shadow', color: 'white', opacity: 0.8, weight: 6 },
                    { className: 'route-line', color: '#E76F51', opacity: 1, weight: 4, dashArray: '10, 12' }
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 10
            },
            createMarker: () => null,
            addWaypoints: false,
            draggableWaypoints: false
        }).addTo(map);
    };

    return {
        flyToLocation,
        openMarkerPopup,
        updateMapRoute,
        mapInstance: map
    };
};
