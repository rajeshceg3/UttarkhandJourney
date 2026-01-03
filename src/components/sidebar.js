import feather from 'feather-icons';
import { locations } from '../data/locations.js';

export const renderSidebarList = (container, onLocClick, onAddClick) => {
    container.innerHTML = '';
    locations.forEach((loc, index) => {
        const item = document.createElement('div');
        item.className = 'location-item p-4 rounded-lg cursor-pointer fade-in flex justify-between items-center bg-white shadow-sm mb-2';
        item.dataset.id = loc.id;
        item.style.animationDelay = `${index * 50}ms`;

        item.innerHTML = `
            <div>
                <h3 class="font-bold text-lg font-serif">${loc.title}</h3>
                <p class="text-sm text-gray-600 truncate w-48">${loc.description}</p>
            </div>
            <button class="add-sidebar-btn p-2 rounded-full hover:bg-gray-100 transition-colors" data-add-id="${loc.id}" aria-label="Add ${loc.title} to trip">
                <i data-feather="plus-circle" class="text-accent-sage"></i>
            </button>
        `;

        item.querySelector('div').addEventListener('click', () => onLocClick(loc));
        item.querySelector('.add-sidebar-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            onAddClick(loc.id);
        });

        container.appendChild(item);
    });
    feather.replace();
};

export const renderItineraryList = (container, itineraryIds, onRemoveClick) => {
    container.innerHTML = '';
    if (itineraryIds.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center italic mt-4">No destinations added yet.</p>';
        return;
    }

    itineraryIds.forEach(id => {
        const loc = locations.find(l => l.id === id);
        if (!loc) return;

        const item = document.createElement('div');
        item.className = 'itinerary-item p-3 rounded-lg flex justify-between items-center bg-white shadow-sm mb-2 border-l-4 border-accent-terracotta';
        item.innerHTML = `
            <span class="font-medium">${loc.title}</span>
            <button class="remove-btn text-gray-400 hover:text-red-500 transition-colors">
                <i data-feather="x" width="16" height="16"></i>
            </button>
        `;

        item.querySelector('.remove-btn').addEventListener('click', () => onRemoveClick(id));
        container.appendChild(item);
    });
    feather.replace();
};

export const updateActiveLocation = (id) => {
    document.querySelectorAll('.location-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.location-item[data-id="${id}"]`);
    if (activeEl) activeEl.classList.add('active');
};

export const toggleSidebar = (isOpen) => {
    const sidebar = document.getElementById('sidebar');
    if (isOpen) {
        sidebar.classList.add('translate-x-0');
        sidebar.classList.remove('-translate-x-full');
    } else {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
    }
};
