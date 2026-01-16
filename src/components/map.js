import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

export const initMap = (elementId, locations, onMarkerClick, onAddToTrip, onMoreInfo, getItinerary) => {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) {
        console.error(`Map element with id "${elementId}" not found.`);
        return null;
    }

    const map = L.map(elementId).setView([30.0668, 79.0193], 8); // Centered on Uttarakhand

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

            if (count >= 5) {
                colorClass = 'bg-accent-terracotta';
            }

            return L.divIcon({
                html: `<div class="${colorClass} text-white font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110" style="width: 40px; height: 40px;">${count}</div>`,
                className: 'marker-cluster-custom',
                iconSize: L.point(40, 40)
            });
        }
    });

    const markers = {};
    let routingControl = null;

    // Helper: Create Popup Content
    const createPopupContent = (loc) => {
        const div = document.createElement('div');
        div.className = "popup-content";

        const img = document.createElement('img');
        img.src = loc.image;
        img.alt = loc.title;
        img.className = "popup-image w-full h-32 object-cover rounded-t-lg";
        img.loading = "lazy";
        div.appendChild(img);

        const contentDiv = document.createElement('div');
        contentDiv.className = "p-4";

        const title = document.createElement('h3');
        title.className = "popup-title font-serif text-lg font-bold";
        title.textContent = loc.title;
        contentDiv.appendChild(title);

        const desc = document.createElement('p');
        desc.className = "text-sm my-2 text-gray-600";
        desc.textContent = loc.description;
        contentDiv.appendChild(desc);

        // Check itinerary status
        const currentItinerary = getItinerary ? getItinerary() : [];
        const isAdded = currentItinerary.includes(loc.id);

        const addBtn = document.createElement('button');
        if (isAdded) {
            addBtn.className = "add-to-trip-btn w-full py-2 px-4 rounded-lg font-semibold text-sm subtle-btn bg-gray-300 text-gray-600 mb-2 cursor-default";
            addBtn.textContent = "Added to Trip";
            addBtn.disabled = true;
        } else {
            addBtn.className = "add-to-trip-btn w-full py-2 px-4 rounded-lg font-semibold text-sm subtle-btn bg-accent-sage text-white mb-2";
            addBtn.textContent = "Add to Trip";
            addBtn.setAttribute('data-add-id', loc.id);
            addBtn.onclick = () => onAddToTrip(loc.id);
        }
        contentDiv.appendChild(addBtn);

        const infoBtn = document.createElement('button');
        infoBtn.className = "more-info-btn w-full py-2 px-4 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 subtle-btn";
        infoBtn.textContent = "More Info";
        infoBtn.setAttribute('data-info-id', loc.id);
        infoBtn.onclick = () => onMoreInfo(loc);
        contentDiv.appendChild(infoBtn);

        div.appendChild(contentDiv);

        return div;
    };

    // Helper: Get Icon
    const getIconName = (type) => {
        const icons = {
            'city': 'map-pin',
            'pilgrimage': 'sunrise',
            'hill-station': 'cloud',
            'park': 'compass'
        };
        return icons[type] || 'map-pin';
    };

    // Add Markers
    locations.forEach(loc => {
        // Safe construction of icon HTML
        const iconName = getIconName(loc.type);

        const iconWrapper = document.createElement('div');
        iconWrapper.className = "custom-marker-icon flex justify-center items-center text-accent-terracotta";

        const iconElement = document.createElement('i');
        iconElement.setAttribute('data-feather', iconName);
        iconWrapper.appendChild(iconElement);

        const customIcon = L.divIcon({
            html: iconWrapper,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });

        // Add to cluster instead of map directly
        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

        // Use a function for bindPopup to ensure content is fresh when opened
        marker.bindPopup(() => createPopupContent(loc), { closeButton: false });

        marker.on('click', () => {
            onMarkerClick(loc.id);
        });

        markersCluster.addLayer(marker);
        markers[loc.id] = marker;
    });

    // Add cluster group to map
    map.addLayer(markersCluster);

    // Public Methods
    /**
     * Smoothly pans the map to a specific location.
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    const flyToLocation = (lat, lng) => {
        if (map) {
            map.flyTo([lat, lng], 13);

            // If the marker is in a cluster, we might need to expand it
            // Finding the marker by lat/lng or id is tricky without reference
            // But flyTo zooms in, so it usually breaks the cluster
        }
    };

    /**
     * Opens the popup for a specific marker.
     * @param {number|string} id - Location ID
     */
    const openMarkerPopup = (id) => {
        if (markers[id]) {
            // zoomToShowLayer is needed if the marker is clustered
            markersCluster.zoomToShowLayer(markers[id], () => {
                markers[id].openPopup();
            });
        }
    };

    /**
     * Updates the routing line on the map based on the current itinerary.
     * Uses Leaflet Routing Machine to calculate and draw the route.
     * @param {Array<number|string>} itineraryIds - List of location IDs in order
     */
    const updateMapRoute = (itineraryIds) => {
        if (!map) return;

        // Clear existing route
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }

        if (!itineraryIds || itineraryIds.length < 2) return;

        const waypoints = itineraryIds
            .map(id => locations.find(l => l.id === id))
            .filter(Boolean)
            .map(loc => L.latLng(loc.lat, loc.lng));

        // Create new route control
        // Note: createMarker returns null to suppress default markers, as we use custom ones
        routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#A3B18A', opacity: 0.8, weight: 6 }]
            },
            createMarker: function() { return null; }
        }).addTo(map);
    };

    return {
        flyToLocation,
        openMarkerPopup,
        updateMapRoute,
        mapInstance: map
    };
};
