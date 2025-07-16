document.addEventListener('DOMContentLoaded', function () {
    // --- State ---
    let itinerary = [];
    let routingControl = null;

    // --- Data ---
    const locations = [
        { id: 'dehradun', lat: 30.3165, lng: 78.0322, title: 'Dehradun', description: 'The capital city, nestled in the Doon Valley.', image: 'https://placehold.co/400x300/A7C7E7/FFFFFF?text=Dehradun', type: 'city' },
        { id: 'haridwar', lat: 29.9457, lng: 78.1642, title: 'Haridwar', description: 'A holy city where the River Ganges enters the plains.', image: 'https://placehold.co/400x300/F8C8DC/FFFFFF?text=Haridwar', type: 'pilgrimage' },
        { id: 'rishikesh', lat: 30.1314, lng: 78.2913, title: 'Rishikesh', description: 'Known as the "Yoga Capital of the World".', image: 'https://placehold.co/400x300/B2D8B2/FFFFFF?text=Rishikesh', type: 'pilgrimage' },
        { id: 'nainital', lat: 29.3803, lng: 79.4636, title: 'Nainital', description: 'A charming hill station built around Naini Lake.', image: 'https://placehold.co/400x300/E6E6FA/FFFFFF?text=Nainital', type: 'hill-station' },
        { id: 'mussoorie', lat: 30.4593, lng: 78.0729, title: 'Mussoorie', description: 'The "Queen of the Hills," with stunning Himalayan views.', image: 'https://placehold.co/400x300/FFDAB9/FFFFFF?text=Mussoorie', type: 'hill-station' },
        { id: 'badrinath', lat: 30.7423, lng: 79.4934, title: 'Badrinath', description: 'A sacred pilgrimage site dedicated to Lord Vishnu.', image: 'https://placehold.co/400x300/C3B1E1/FFFFFF?text=Badrinath', type: 'pilgrimage' },
        { id: 'kedarnath', lat: 30.6046, lng: 79.0659, title: 'Kedarnath', description: 'Home to the ancient Kedarnath Temple.', image: 'https://placehold.co/400x300/F5DEB3/FFFFFF?text=Kedarnath', type: 'pilgrimage' },
        { id: 'corbett', lat: 29.5845, lng: 79.4565, title: 'Jim Corbett NP', description: 'India\'s oldest national park, home to the Bengal tiger.', image: 'https://placehold.co/400x300/98FB98/FFFFFF?text=Corbett', type: 'park' },
        { id: 'valley_of_flowers', lat: 30.6976, lng: 79.5663, title: 'Valley of Flowers', description: 'A vibrant national park with alpine flowers.', image: 'https://placehold.co/400x300/FFB6C1/FFFFFF?text=Valley+of+Flowers', type: 'park' },
        { id: 'auli', lat: 30.5293, lng: 79.5639, title: 'Auli', description: 'A premier ski destination with panoramic views.', image: 'https://placehold.co/400x300/ADD8E6/FFFFFF?text=Auli', type: 'hill-station' }
    ];

    // --- Map Initialization ---
    const map = L.map('map', { center: [30.0668, 79.0193], zoom: 8, zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', { attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);

    // --- Icons ---
    const icons = {
        'hill-station': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D98C7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 21h20L12 3zM8.5 14l2.5 3 3-4.5 2.5 3.5"/></svg>`,
        'pilgrimage': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D98C7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
        'park': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D98C7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.9 10.9c-1.3 3.3-3.3 6.6-6.4 9.3-2.3 2-4.8 3.3-7.5 3.8-1.1.2-2.2-.4-2.7-1.4s-.2-2.3.6-3.1c.9-.9 2.1-1.5 3.4-1.9 2.2-.7 4.5-2 6.5-3.8 2.2-2 4-4.5 5.2-7.4.4-1 .1-2.2-.8-2.8-.9-.6-2.1-.4-2.8.5-1.1 1.4-2.4 3.1-3.7 4.8m-2.1-2.1c-.2.2-.4.4-.6.6"></path></svg>`,
        'city': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D98C7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
    };

    const locationListEl = document.getElementById('location-list');
    const itineraryListEl = document.getElementById('itinerary-list');
    const itineraryEmptyEl = document.getElementById('itinerary-empty');
    const clearItineraryBtn = document.getElementById('clear-itinerary-btn');
    const toggleRouteBtn = document.getElementById('toggle-route-btn');
    const filterContainer = document.getElementById('filter-container');
    const markers = {};

    // --- Core Functions ---
    const renderItinerary = () => {
        const existingIds = Array.from(itineraryListEl.children).map(item => item.dataset.id);

        // Add new items
        itinerary.forEach(locationId => {
            if (!existingIds.includes(locationId)) {
                const location = locations.find(l => l.id === locationId);
                const item = document.createElement('div');
                item.className = 'itinerary-item flex items-center justify-between p-3 rounded-lg shadow-sm adding';
                item.dataset.id = location.id;
                item.innerHTML = `
                    <span class="font-semibold">${location.title}</span>
                    <button class="remove-btn p-1" data-id="${location.id}">
                        <i data-feather="x" class="w-5 h-5 text-gray-500"></i>
                    </button>
                `;
                itineraryListEl.appendChild(item);
                setTimeout(() => item.classList.remove('adding'), 500);
            }
        });

        // Update visibility
        itineraryEmptyEl.style.display = itinerary.length === 0 ? 'block' : 'none';
        clearItineraryBtn.style.display = itinerary.length === 0 ? 'none' : 'block';
        toggleRouteBtn.style.display = itinerary.length >= 2 ? 'block' : 'none';

        updateButtonStates();
        feather.replace();
    };

    const updateButtonStates = () => {
        document.querySelectorAll('[data-add-id]').forEach(btn => {
            const id = btn.dataset.addId;
            const isAdded = itinerary.includes(id);

            if (btn.tagName === 'BUTTON') {
                btn.textContent = isAdded ? 'Added ✔' : 'Add to Trip';
                btn.disabled = isAdded;
            } else {
                const icon = isAdded ? 'check-circle' : 'plus-circle';
                const color = isAdded ? 'text-green-500' : 'text-blue-500';
                if (!btn.innerHTML.includes(icon)) {
                     btn.innerHTML = `<i data-feather="${icon}" class="w-6 h-6 ${color}"></i>`;
                }
            }
        });
        feather.replace();
    };

    const saveItinerary = () => {
        localStorage.setItem('tripItinerary', JSON.stringify(itinerary));
    };

    const loadItinerary = () => {
        const savedItinerary = localStorage.getItem('tripItinerary');
        if (savedItinerary) {
            itinerary = JSON.parse(savedItinerary);
        }
    };

    const addToItinerary = (id) => {
        if (!itinerary.includes(id)) {
            itinerary.push(id);
            renderItinerary();
            saveItinerary();
        }
    };

    const removeFromItinerary = (id) => {
        const item = itineraryListEl.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.classList.add('removing');
            setTimeout(() => {
                itinerary = itinerary.filter(itemId => itemId !== id);
                item.remove();
                renderItinerary();
                saveItinerary();
            }, 300);
        }
    };

    const filterLocations = (type) => {
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

        // Update active button style
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === type);
             if (btn.dataset.filter === type) {
                btn.style.backgroundColor = 'var(--accent-sage)';
                btn.style.color = 'white';
            } else {
                btn.style.backgroundColor = 'white';
                btn.style.color = 'var(--text-indigo)';
            }
        });
    };

    // --- Event Listeners ---
    filterContainer.addEventListener('click', (e) => {
        const filterButton = e.target.closest('.filter-btn');
        if (filterButton) {
            filterLocations(filterButton.dataset.filter);
        }
    });
    clearItineraryBtn.addEventListener('click', () => {
        itinerary = [];
        renderItinerary();
        saveItinerary();
    });

    itineraryListEl.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.remove-btn');
        if (removeButton) {
            removeFromItinerary(removeButton.dataset.id);
        }
    });

    toggleRouteBtn.addEventListener('click', () => {
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
            toggleRouteBtn.textContent = 'Show Route';
        } else {
            const waypoints = itinerary.map(id => {
                const location = locations.find(l => l.id === id);
                return L.latLng(location.lat, location.lng);
            });

            routingControl = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: true
            }).addTo(map);
            toggleRouteBtn.textContent = 'Hide Route';
        }
    });

    const modal = document.getElementById('location-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.modal-close-btn');

    const openModal = (location) => {
        modalBody.innerHTML = `
            <h2 class="text-3xl font-bold mb-4">${location.title}</h2>
            <img src="${location.image}" alt="${location.title}" class="w-full h-64 object-cover rounded-lg mb-4">
            <p class="text-lg">${location.description}</p>
            <p class="text-sm text-gray-500 mt-4">Type: ${location.type}</p>
        `;
        modal.classList.add('show');
        feather.replace();
    };

    const closeModal = () => {
        modal.classList.remove('show');
    };

    map.on('popupopen', (e) => {
        const moreInfoBtn = e.popup.getElement().querySelector('.more-info-btn');
        if (moreInfoBtn) {
            moreInfoBtn.addEventListener('click', () => {
                const locationId = moreInfoBtn.dataset.id;
                const location = locations.find(l => l.id === locationId);
                openModal(location);
            });
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    // --- Initial Population ---
    locations.forEach((loc, index) => {
        // Add to sidebar
        const item = document.createElement('div');
        item.className = 'location-item p-4 rounded-lg cursor-pointer fade-in flex justify-between items-center';
        item.dataset.id = loc.id;
        item.style.animationDelay = `${index * 50}ms`;
        item.innerHTML = `
            <div>
                <h3 class="font-bold text-lg">${loc.title}</h3>
                <p class="text-sm text-gray-600">${loc.description}</p>
            </div>
            <button class="add-sidebar-btn p-1 subtle-btn" data-add-id="${loc.id}"></button>
        `;
        item.querySelector('div').addEventListener('click', () => {
            map.flyTo([loc.lat, loc.lng], 13);
            markers[loc.id].openPopup();
        });
        item.querySelector('.add-sidebar-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            addToItinerary(loc.id);
        });
        locationListEl.appendChild(item);

        // Add marker to map
        const customIcon = L.divIcon({ html: `<div class="custom-marker-icon">${icons[loc.type] || icons['city']}</div>`, className: '', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] });
        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(L.popup({closeButton: false}).setContent(`
            <div>
                <img src="${location.image}" alt="${loc.title}" class="popup-image w-full h-32 object-cover">
                <div class="p-4">
                    <h3 class="popup-title">${loc.title}</h3>
                    <p class="text-sm my-2">${loc.description}</p>
                    <button class="add-to-trip-btn w-full py-2 px-4 rounded-lg font-semibold text-sm subtle-btn" data-add-id="${loc.id}">Add to Trip</button>
                    <button class="more-info-btn w-full mt-2 py-2 px-4 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 subtle-btn" data-id="${loc.id}">More Info</button>
                </div>
            </div>
        `));

        marker.on('click', () => {
            document.querySelectorAll('.location-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
        });

        marker.getPopup().on('add', () => {
            updateButtonStates();
            document.querySelector(`.leaflet-popup-content button[data-add-id="${loc.id}"]`).addEventListener('click', () => {
                addToItinerary(loc.id);
            });
        });

        markers[loc.id] = marker;
    });

    // --- Mobile Sidebar Toggle ---
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('mobile-toggle');
    toggleButton.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('open'); });
    document.getElementById('map').addEventListener('click', () => { if (sidebar.classList.contains('open')) sidebar.classList.remove('open'); });

    // --- Load, Render, and Init ---
    loadItinerary();
    renderItinerary();
    feather.replace();
});
