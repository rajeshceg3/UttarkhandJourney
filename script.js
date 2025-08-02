document.addEventListener('DOMContentLoaded', function () {
    // --- State ---
    let itinerary = [];
    let routingControl = null;


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
                const titleSpan = document.createElement('span');
                titleSpan.className = 'font-semibold';
                titleSpan.textContent = location.title;

                const removeButton = document.createElement('button');
                removeButton.className = 'remove-btn p-1';
                removeButton.dataset.id = location.id;
                removeButton.setAttribute('aria-label', `Remove ${location.title} from trip`);
                removeButton.innerHTML = `<i data-feather="x" class="w-5 h-5 text-gray-500"></i>`; // Icon HTML is trusted

                item.appendChild(titleSpan);
                item.appendChild(removeButton);

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

            // Handle the text-based button in the map popup
            if (btn.classList.contains('add-to-trip-btn')) {
                btn.textContent = isAdded ? 'Added ✔' : 'Add to Trip';
                btn.disabled = isAdded;
            }
            // Handle the icon-based button in the sidebar
            else if (btn.classList.contains('add-sidebar-btn')) {
                const icon = isAdded ? 'check-circle' : 'plus-circle';
                const color = isAdded ? 'text-green-500' : 'text-blue-500';
                const existingIcon = btn.querySelector('i');

                // Update only if the icon needs to change, to prevent flicker
                if (!existingIcon || !existingIcon.dataset.feather.includes(icon)) {
                    btn.innerHTML = `<i data-feather="${icon}" class="w-6 h-6 ${color}"></i>`;
                }
                btn.disabled = isAdded;
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
            const isPressed = btn.dataset.filter === type;
            btn.classList.toggle('active', isPressed);
            btn.setAttribute('aria-pressed', isPressed);
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
        // If a route is displayed, remove it
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
            toggleRouteBtn.textContent = 'Show Route'; // Reset button text
        }
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
        // Clear previous content
        modalBody.innerHTML = '';

        const title = document.createElement('h2');
        title.className = 'text-3xl font-bold mb-4';
        title.textContent = location.title;

        const image = document.createElement('img');
        image.src = location.image;
        image.alt = location.title;
        image.className = 'w-full h-64 object-cover rounded-lg mb-4';

        const description = document.createElement('p');
        description.className = 'text-lg';
        description.textContent = location.description;

        const type = document.createElement('p');
        type.className = 'text-sm text-gray-500 mt-4';
        type.textContent = `Type: ${location.type}`;

        modalBody.appendChild(title);
        modalBody.appendChild(image);
        modalBody.appendChild(description);
        modalBody.appendChild(type);

        modal.classList.add('show');
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
        const textDiv = document.createElement('div');
        const titleH3 = document.createElement('h3');
        titleH3.className = 'font-bold text-lg';
        titleH3.textContent = loc.title;
        const descriptionP = document.createElement('p');
        descriptionP.className = 'text-sm text-gray-600';
        descriptionP.textContent = loc.description;
        textDiv.appendChild(titleH3);
        textDiv.appendChild(descriptionP);

        const addButton = document.createElement('button');
        addButton.className = 'add-sidebar-btn p-1 subtle-btn';
        addButton.dataset.addId = loc.id;
        addButton.setAttribute('aria-label', `Add ${loc.title} to trip`);

        item.appendChild(textDiv);
        item.appendChild(addButton);

        textDiv.addEventListener('click', () => {
            map.flyTo([loc.lat, loc.lng], 13);
            markers[loc.id].openPopup();
        });
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            addToItinerary(loc.id);
        });
        locationListEl.appendChild(item);

        // Add marker to map
        const customIcon = L.divIcon({ html: `<div class="custom-marker-icon">${icons[loc.type] || icons['city']}</div>`, className: '', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] });
        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

        const popupContent = document.createElement('div');
        const img = document.createElement('img');
        img.src = loc.image;
        img.alt = loc.title;
        img.className = 'popup-image w-full h-32 object-cover';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'p-4';
        const popupTitle = document.createElement('h3');
        popupTitle.className = 'popup-title';
        popupTitle.textContent = loc.title;
        const popupDescription = document.createElement('p');
        popupDescription.className = 'text-sm my-2';
        popupDescription.textContent = loc.description;
        const popupAddButton = document.createElement('button');
        popupAddButton.className = 'add-to-trip-btn w-full py-2 px-4 rounded-lg font-semibold text-sm subtle-btn';
        popupAddButton.dataset.addId = loc.id;
        popupAddButton.textContent = 'Add to Trip';
        const moreInfoButton = document.createElement('button');
        moreInfoButton.className = 'more-info-btn w-full mt-2 py-2 px-4 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 subtle-btn';
        moreInfoButton.dataset.id = loc.id;
        moreInfoButton.textContent = 'More Info';
        contentDiv.appendChild(popupTitle);
        contentDiv.appendChild(popupDescription);
        contentDiv.appendChild(popupAddButton);
        contentDiv.appendChild(moreInfoButton);
        popupContent.appendChild(img);
        popupContent.appendChild(contentDiv);

        marker.bindPopup(L.popup({closeButton: false}).setContent(popupContent));

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
    toggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sidebar.classList.toggle('open');
        toggleButton.setAttribute('aria-expanded', isOpen);
    });
    document.getElementById('map').addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });

    // --- Load, Render, and Init ---
    loadItinerary();
    renderItinerary();
    feather.replace();
});
