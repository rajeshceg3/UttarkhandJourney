// --- Map Management ---
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { locations } from './locations.js';
import { icons, openModal, updateButtonStates, handleAddToItinerary } from './ui.js';
import { getItinerary } from './itinerary.js';

let map;
const markers = {};
let routingControl = null;

export const initMap = () => {
    map = L.map('map', { center: [30.0668, 79.0193], zoom: 8, zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    locations.forEach(loc => {
        const customIcon = L.divIcon({
            html: `<div class="custom-marker-icon">${icons[loc.type] || icons['city']}</div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
            <img src="${loc.image}" alt="${loc.title}" class="popup-image w-full h-32 object-cover">
            <div class="p-4">
                <h3 class="popup-title">${loc.title}</h3>
                <p class="text-sm my-2">${loc.description}</p>
                <button class="add-to-trip-btn w-full py-2 px-4 rounded-lg font-semibold text-sm subtle-btn" data-add-id="${loc.id}">Add to Trip</button>
                <button class="more-info-btn w-full mt-2 py-2 px-4 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 subtle-btn" data-id="${loc.id}">More Info</button>
            </div>
        `;

        marker.bindPopup(L.popup({closeButton: false}).setContent(popupContent));

        marker.on('click', () => {
            document.querySelectorAll('.location-item').forEach(el => el.classList.remove('active'));
            const listItem = document.querySelector(`.location-item[data-id="${loc.id}"]`);
            if (listItem) listItem.classList.add('active');
        });

        marker.getPopup().on('add', () => {
            updateButtonStates();
            const popupNode = marker.getPopup().getElement();

            popupNode.querySelector(`.add-to-trip-btn`).addEventListener('click', () => {
                handleAddToItinerary(loc.id);
            });

            popupNode.querySelector(`.more-info-btn`).addEventListener('click', () => {
                openModal(loc);
            });
        });

        markers[loc.id] = marker;
    });

    // Sidebar Close on Map Click
    document.getElementById('map').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const toggleButton = document.getElementById('mobile-toggle');
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Listeners for external control
    document.addEventListener('filter-locations', (e) => {
        const type = e.detail.type;
        locations.forEach(loc => {
            const locationItem = document.querySelector(`.location-item[data-id="${loc.id}"]`);
            const marker = markers[loc.id];
            const show = (type === 'all' || loc.type === type);

            if (locationItem) locationItem.style.display = show ? 'flex' : 'none';
            if (marker) {
                if (show) {
                    if (!map.hasLayer(marker)) map.addLayer(marker);
                } else {
                    if (map.hasLayer(marker)) map.removeLayer(marker);
                }
            }
        });
    });

    document.addEventListener('clear-route', () => {
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
            const btn = document.getElementById('toggle-route-btn');
            if(btn) btn.textContent = 'Show Route';
        }
    });

    document.getElementById('toggle-route-btn').addEventListener('click', (e) => {
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
            e.target.textContent = 'Show Route';
        } else {
            const itinerary = getItinerary();
            const waypoints = itinerary.map(id => {
                const location = locations.find(l => l.id === id);
                return L.latLng(location.lat, location.lng);
            });

            routingControl = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: true,
                createMarker: function() { return null; } // Don't create default markers
            }).addTo(map);
            e.target.textContent = 'Hide Route';
        }
    });
};

export const flyToLocation = (lat, lng) => {
    map.flyTo([lat, lng], 13);
};

export const openMarkerPopup = (id) => {
    if (markers[id]) {
        markers[id].openPopup();
    }
};
