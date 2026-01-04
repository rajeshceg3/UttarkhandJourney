import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { locations } from '../data/locations.js';

let map;
let markers = {};
let routingControl;

export const initMap = (elementId, onMarkerClick, onAddToTrip, onMoreInfo) => {
    map = L.map(elementId).setView([30.0668, 79.0193], 8); // Centered on Uttarakhand

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add Markers
    locations.forEach(loc => {
        const customIcon = L.divIcon({
            html: `<div class="custom-marker-icon flex justify-center items-center text-accent-terracotta"><i data-feather="${getIconName(loc.type)}"></i></div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

        const popupContent = createPopupContent(loc);
        marker.bindPopup(L.popup({ closeButton: false }).setContent(popupContent));

        marker.on('click', () => {
            onMarkerClick(loc.id);
        });

        marker.getPopup().on('add', () => {
             // Re-bind events inside popup as DOM is recreated
             const addBtn = document.querySelector(`.leaflet-popup-content button[data-add-id="${loc.id}"]`);
             if (addBtn) addBtn.addEventListener('click', () => onAddToTrip(loc.id));

             const infoBtn = document.querySelector(`.leaflet-popup-content button[data-info-id="${loc.id}"]`);
             if (infoBtn) infoBtn.addEventListener('click', () => onMoreInfo(loc));
        });

        markers[loc.id] = marker;
    });

    return map;
};

export const flyToLocation = (lat, lng) => {
    map.flyTo([lat, lng], 13);
};

export const openMarkerPopup = (id) => {
    if (markers[id]) {
        markers[id].openPopup();
    }
};

export const updateMapRoute = (itineraryIds) => {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    if (itineraryIds.length < 2) return;

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
            styles: [{ color: '#A3B18A', opacity: 0.8, weight: 6 }]
        },
        createMarker: function() { return null; } // Don't create extra markers
    }).addTo(map);
};

function getIconName(type) {
    const icons = {
        'city': 'map-pin',
        'pilgrimage': 'sunrise', // closest to religious/temple
        'hill-station': 'cloud',
        'park': 'compass'
    };
    return icons[type] || 'map-pin';
}

function createPopupContent(loc) {
    const div = document.createElement('div');
    div.innerHTML = `
        <img src="${loc.image}" alt="${loc.title}" class="popup-image w-full h-32 object-cover rounded-t-lg">
        <div class="p-4">
            <h3 class="popup-title font-serif text-lg font-bold">${loc.title}</h3>
            <p class="text-sm my-2 text-gray-600">${loc.description}</p>
            <button class="add-to-trip-btn w-full py-2 px-4 rounded-lg font-semibold text-sm subtle-btn bg-accent-sage text-white mb-2" data-add-id="${loc.id}">
                Add to Trip
            </button>
            <button class="more-info-btn w-full py-2 px-4 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 subtle-btn" data-info-id="${loc.id}">
                More Info
            </button>
        </div>
    `;
    return div;
}
