import './style.css';
import { initMap } from './components/map.js';
import { renderSidebarList, renderFilters, renderItineraryList, updateActiveLocation, toggleSidebar } from './components/sidebar.js';
import { showModal } from './components/modal.js';
import { loadItinerary, saveItinerary } from './utils/storage.js';
import { locations } from './data/locations.js';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import feather from 'feather-icons';

let itinerary = loadItinerary();
let currentFilter = 'all';

const init = () => {
    // DOM Elements
    const sidebarListEl = document.getElementById('location-list');
    const filterContainerEl = document.getElementById('filter-container');
    const itineraryListEl = document.getElementById('itinerary-list');
    const mobileToggleBtn = document.getElementById('mobile-toggle');
    const sidebarEl = document.getElementById('sidebar');

    if (!sidebarListEl || !filterContainerEl || !itineraryListEl) {
        console.error("Critical DOM elements missing");
        return;
    }

    let mapControls = null;

    // Logic
    const handleFilterChange = (type) => {
        currentFilter = type;
        renderSidebarList(sidebarListEl, locations, itinerary, handleLocationClick, handleAddToTrip, type);
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

    const handleClearItinerary = () => {
        itinerary = [];
        saveItinerary(itinerary);
        updateUI();
        Toastify({
            text: "Itinerary cleared.",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#D98C7A",
        }).showToast();
    };

    const handleLocationClick = (loc) => {
        if (mapControls) {
            mapControls.flyToLocation(loc.lat, loc.lng);
            mapControls.openMarkerPopup(loc.id);
        }
        updateActiveLocation(sidebarListEl, loc.id);
        if (window.innerWidth < 768 && sidebarEl) {
            toggleSidebar(sidebarEl, false);
        }
    };

    const handleMoreInfo = (loc) => {
        showModal(loc);
        feather.replace();
    };

    const getItinerary = () => itinerary;

    const updateUI = () => {
        renderItineraryList(itineraryListEl, locations, itinerary, handleRemoveFromTrip, handleClearItinerary);
        renderSidebarList(sidebarListEl, locations, itinerary, handleLocationClick, handleAddToTrip, currentFilter);
        if (mapControls) {
            mapControls.updateMapRoute(itinerary);
        }
        feather.replace();
    };

    // Init Map
    try {
        mapControls = initMap('map',
            locations,
            (id) => updateActiveLocation(sidebarListEl, id),
            handleAddToTrip,
            handleMoreInfo,
            getItinerary
        );
    } catch (error) {
        console.error("Failed to initialize map:", error);
    }

    // Init Sidebar
    try {
        renderFilters(filterContainerEl, locations, handleFilterChange);
        renderSidebarList(sidebarListEl, locations, itinerary, handleLocationClick, handleAddToTrip, currentFilter);
        renderItineraryList(itineraryListEl, locations, itinerary, handleRemoveFromTrip, handleClearItinerary);
        if (mapControls) {
            mapControls.updateMapRoute(itinerary);
        }
    } catch (error) {
        console.error("Failed to initialize sidebar:", error);
    }

    // Event Listeners
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', () => {
            if (sidebarEl) {
                const isHidden = sidebarEl.classList.contains('-translate-x-full');
                toggleSidebar(sidebarEl, isHidden);
            }
        });
    }

    feather.replace();
};

document.addEventListener('DOMContentLoaded', init);
