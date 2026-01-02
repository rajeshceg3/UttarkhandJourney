// --- UI Management ---
import feather from 'feather-icons';
import Toastify from 'toastify-js';
import { locations } from './locations.js';
import { getItinerary, addToItinerary, removeFromItinerary, clearItinerary } from './itinerary.js';
import { flyToLocation, openMarkerPopup } from './map.js';

const itineraryListEl = document.getElementById('itinerary-list');
const itineraryEmptyEl = document.getElementById('itinerary-empty');
const clearItineraryBtn = document.getElementById('clear-itinerary-btn');
const toggleRouteBtn = document.getElementById('toggle-route-btn');
const locationListEl = document.getElementById('location-list');
const modal = document.getElementById('location-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.querySelector('.modal-close-btn');

// --- Icons ---
export const icons = {
    'hill-station': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D98C7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 21h20L12 3zM8.5 14l2.5 3 3-4.5 2.5 3.5"/></svg>`,
    'pilgrimage': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D98C7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    'park': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D98C7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.9 10.9c-1.3 3.3-3.3 6.6-6.4 9.3-2.3 2-4.8 3.3-7.5 3.8-1.1.2-2.2-.4-2.7-1.4s-.2-2.3.6-3.1c.9-.9 2.1-1.5 3.4-1.9 2.2-.7 4.5-2 6.5-3.8 2.2-2 4-4.5 5.2-7.4.4-1 .1-2.2-.8-2.8-.9-.6-2.1-.4-2.8.5-1.1 1.4-2.4 3.1-3.7 4.8m-2.1-2.1c-.2.2-.4.4-.6.6"></path></svg>`,
    'city': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D98C7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
};

export const updateButtonStates = () => {
    const itinerary = getItinerary();
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

            if (!existingIcon || !existingIcon.dataset.feather.includes(icon)) {
                btn.innerHTML = `<i data-feather="${icon}" class="w-6 h-6 ${color}"></i>`;
            }
            btn.disabled = isAdded;
        }
    });
    feather.replace();
};

export const renderItinerary = () => {
    const itinerary = getItinerary();
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
            removeButton.innerHTML = `<i data-feather="x" class="w-5 h-5 text-gray-500"></i>`;

            item.appendChild(titleSpan);
            item.appendChild(removeButton);

            itineraryListEl.appendChild(item);
            setTimeout(() => item.classList.remove('adding'), 500);
        }
    });

    // Remove items that are no longer in itinerary
    Array.from(itineraryListEl.children).forEach(item => {
        if (!itinerary.includes(item.dataset.id)) {
            item.remove();
        }
    });

    // Update visibility
    itineraryEmptyEl.style.display = itinerary.length === 0 ? 'block' : 'none';
    clearItineraryBtn.style.display = itinerary.length === 0 ? 'none' : 'block';
    toggleRouteBtn.style.display = itinerary.length >= 2 ? 'block' : 'none';

    updateButtonStates();
    feather.replace();
};

export const handleAddToItinerary = (id) => {
    if (addToItinerary(id)) {
        renderItinerary();
        Toastify({
            text: "Added to trip!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#A3B18A",
            },
        }).showToast();
    }
};

export const handleRemoveFromItinerary = (id) => {
    const item = itineraryListEl.querySelector(`[data-id="${id}"]`);
    if (item) {
        item.classList.add('removing');
        setTimeout(() => {
            removeFromItinerary(id);
            renderItinerary();
        }, 300);
    }
};

export const initUI = () => {
    renderItinerary();

    // Clear Itinerary
    clearItineraryBtn.addEventListener('click', () => {
        // Trigger a custom event for the map controller to listen to if needed
        document.dispatchEvent(new CustomEvent('clear-route'));
        clearItinerary();
        renderItinerary();
    });

    // Remove item
    itineraryListEl.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.remove-btn');
        if (removeButton) {
            handleRemoveFromItinerary(removeButton.dataset.id);
        }
    });

    // Modal Events
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Mobile Sidebar
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('mobile-toggle');
    toggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sidebar.classList.toggle('open');
        toggleButton.setAttribute('aria-expanded', isOpen);
    });

    // Initial Render of Locations List
    locations.forEach((loc, index) => {
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
            flyToLocation(loc.lat, loc.lng);
            openMarkerPopup(loc.id);
        });

        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleAddToItinerary(loc.id);
        });

        locationListEl.appendChild(item);
    });

    // Filter Buttons
    document.getElementById('filter-container').addEventListener('click', (e) => {
        const filterButton = e.target.closest('.filter-btn');
        if (filterButton) {
            const type = filterButton.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                const isPressed = btn.dataset.filter === type;
                btn.classList.toggle('active', isPressed);
                btn.setAttribute('aria-pressed', isPressed);
            });
            document.dispatchEvent(new CustomEvent('filter-locations', { detail: { type } }));
        }
    });
};

export const openModal = (location) => {
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
