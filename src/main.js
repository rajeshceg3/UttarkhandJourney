import './style.css';
import { initMap, flyToLocation, openMarkerPopup, updateMapRoute } from './components/map.js';
import { renderSidebarList, renderFilters, renderItineraryList, updateActiveLocation, toggleSidebar } from './components/sidebar.js';
import { showModal } from './components/modal.js';
import { loadItinerary, saveItinerary } from './utils/storage.js';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import feather from 'feather-icons';

let itinerary = loadItinerary();

const init = () => {
    // DOM Elements
    const sidebarListEl = document.getElementById('location-list');
    const filterContainerEl = document.getElementById('filter-container');
    const itineraryListEl = document.getElementById('itinerary-list');
    const mobileToggleBtn = document.getElementById('mobile-toggle');

    // Logic
    const handleFilterChange = (type) => {
        renderSidebarList(sidebarListEl, handleLocationClick, handleAddToTrip, type);
    };

    const handleAddToTrip = (id) => {
        if (!itinerary.includes(id)) {
            itinerary.push(id);
            saveItinerary(itinerary);
            updateUI();
            Toastify({
                text: "Added to your trip!",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#A3B18A",
            }).showToast();
        } else {
             Toastify({
                text: "Already in your trip.",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#D98C7A",
            }).showToast();
        }
    };

    const handleRemoveFromTrip = (id) => {
        itinerary = itinerary.filter(itemId => itemId !== id);
        saveItinerary(itinerary);
        updateUI();
        Toastify({
            text: "Removed from trip.",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#D98C7A",
        }).showToast();
    };

    const handleLocationClick = (loc) => {
        flyToLocation(loc.lat, loc.lng);
        openMarkerPopup(loc.id);
        updateActiveLocation(loc.id);
        if (window.innerWidth < 768) {
            toggleSidebar(false);
        }
    };

    const handleMoreInfo = (loc) => {
        showModal(loc);
        feather.replace();
    };

    const updateUI = () => {
        renderItineraryList(itineraryListEl, itinerary, handleRemoveFromTrip);
        updateMapRoute(itinerary);
    };

    // Init Map
    initMap('map',
        (id) => updateActiveLocation(id),
        handleAddToTrip,
        handleMoreInfo
    );

    // Init Sidebar
    renderFilters(filterContainerEl, handleFilterChange);
    renderSidebarList(sidebarListEl, handleLocationClick, handleAddToTrip);
    updateUI();

    // Event Listeners
    mobileToggleBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const isHidden = sidebar.classList.contains('-translate-x-full');
        toggleSidebar(isHidden);
    });

    feather.replace();
};

document.addEventListener('DOMContentLoaded', init);
