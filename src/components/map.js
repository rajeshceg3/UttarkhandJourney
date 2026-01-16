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
        zoomControl: false // We will add it manually to position it better
    }).setView([30.0668, 79.0193], 8);

    // Custom Zoom Control to top-right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create a marker cluster group
    const markersCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        disableClusteringAtZoom: 16,
        iconCreateFunction: function (cluster) {
            const count = cluster.getChildCount();
            let colorClass = 'bg-accent-sage';
            if (count >= 5) colorClass = 'bg-accent-terracotta';

            return L.divIcon({
                html: `<div class="${colorClass} text-white font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110" style="width: 44px; height: 44px; font-size: 16px;">${count}</div>`,
                className: 'marker-cluster-custom',
                iconSize: L.point(44, 44)
            });
        }
    });

    const markers = {};
    let routingControl = null;

    // Helper: Create Popup Content
    const createPopupContent = (loc) => {
        const div = document.createElement('div');
        div.className = "flex flex-col overflow-hidden bg-white w-[280px]";

        // Image Section
        const imgContainer = document.createElement('div');
        imgContainer.className = "relative h-36 w-full";

        const img = document.createElement('img');
        img.src = loc.image;
        img.alt = loc.title;
        img.className = "w-full h-full object-cover";
        img.loading = "lazy";
        imgContainer.appendChild(img);

        // Overlay Gradient
        const gradient = document.createElement('div');
        gradient.className = "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4";

        const title = document.createElement('h3');
        title.className = "text-white font-serif text-lg font-bold leading-tight shadow-black drop-shadow-md";
        title.textContent = loc.title;
        gradient.appendChild(title);

        imgContainer.appendChild(gradient);
        div.appendChild(imgContainer);

        // Content Section
        const contentDiv = document.createElement('div');
        contentDiv.className = "p-4 flex flex-col gap-3";

        const desc = document.createElement('p');
        desc.className = "text-sm text-gray-600 line-clamp-2";
        desc.textContent = loc.description;
        contentDiv.appendChild(desc);

        // Buttons
        const btnGroup = document.createElement('div');
        btnGroup.className = "flex gap-2 mt-1";

        const currentItinerary = getItinerary ? getItinerary() : [];
        const isAdded = currentItinerary.includes(loc.id);

        const addBtn = document.createElement('button');
        addBtn.className = `flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1 ${isAdded ? 'bg-gray-100 text-accent-sage cursor-default' : 'bg-accent-sage text-white hover:bg-opacity-90 shadow-md hover:shadow-lg'}`;
        addBtn.disabled = isAdded;

        if (isAdded) {
            addBtn.innerHTML = '<span>Added</span> <i data-feather="check" width="14" height="14"></i>';
        } else {
            addBtn.innerHTML = '<span>Add to Trip</span> <i data-feather="plus" width="14" height="14"></i>';
            addBtn.onclick = (e) => {
                e.stopPropagation();
                onAddToTrip(loc.id);
            };
        }
        btnGroup.appendChild(addBtn);

        const infoBtn = document.createElement('button');
        infoBtn.className = "flex-1 py-2 px-3 rounded-lg font-semibold text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md";
        infoBtn.textContent = "More Info";
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            onMoreInfo(loc);
        };
        btnGroup.appendChild(infoBtn);

        contentDiv.appendChild(btnGroup);
        div.appendChild(contentDiv);

        // We need to render feathers immediately for the popup HTML string
        // But since we return a node, we can do it after appending, or try to do it here.
        // However, feather.replace() works on the DOM.
        // Leaflet will append this node. We can observe it or just use simple SVGs if feather fails.
        // Better yet: manual SVG injection for popup to ensure reliability without needing to call feather.replace again.
        // Actually, let's keep it simple. The parent caller or main loop might not re-scan popup content.
        // We will manually inject SVG string for reliability.

        return div;
    };

    // Helper: Get SVG String for Icons
    const getIconSVG = (type) => {
        // We could use feather.icons[name].toSvg()
        const map = {
            'city': 'map-pin',
            'pilgrimage': 'sunrise',
            'hill-station': 'cloud',
            'park': 'compass'
        };
        const iconName = map[type] || 'map-pin';
        return feather.icons[iconName].toSvg({ width: 20, height: 20, color: '#E07A5F', 'stroke-width': 2.5 });
    };

    // Add Markers
    locations.forEach(loc => {
        const svgString = getIconSVG(loc.type);

        // Custom Pin Style
        const iconHtml = `
            <div class="relative w-10 h-10 flex items-center justify-center group">
                <div class="absolute inset-0 bg-white rounded-full shadow-md transform group-hover:scale-110 transition-transform duration-200 border-2 border-white"></div>
                <div class="relative z-10 text-accent-terracotta transform group-hover:-translate-y-1 transition-transform duration-200">
                    ${svgString}
                </div>
                <div class="absolute -bottom-1 w-2 h-2 bg-white transform rotate-45 shadow-sm"></div>
            </div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: '', // Remove default styles
            iconSize: [40, 40],
            iconAnchor: [20, 44], // Tip of the pin
            popupAnchor: [0, -48]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

        // Bind popup content with feather icon handling
        marker.bindPopup(() => {
            const node = createPopupContent(loc);
            // Little hack to render icons inside the node before it's attached
            // But since feather works on DOM, we might need a small delay or use raw SVG strings in createPopupContent too
            // Let's use raw SVG strings in createPopupContent for buttons to be safe
            setTimeout(() => feather.replace(), 0);
            return node;
        }, { closeButton: false, offset: [0, 0], maxWidth: 300, minWidth: 280 });

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
                duration: 1.5
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
                styles: [{ color: '#E07A5F', opacity: 0.8, weight: 5, dashArray: '10, 10' }]
            },
            createMarker: () => null,
            addWaypoints: false, // Disable adding via map
            draggableWaypoints: false
        }).addTo(map);

        // Hide the itinerary instructions container that LRM creates by default
        // We only want the line on the map
        // LRM adds a control container, we can hide it via CSS or here
    };

    return {
        flyToLocation,
        openMarkerPopup,
        updateMapRoute,
        mapInstance: map
    };
};
