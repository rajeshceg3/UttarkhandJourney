// --- Itinerary Logic ---
import "toastify-js/src/toastify.css";

let itinerary = [];

export const getItinerary = () => itinerary;

export const loadItinerary = () => {
    const savedItinerary = localStorage.getItem('tripItinerary');
    if (savedItinerary) {
        itinerary = JSON.parse(savedItinerary);
    }
};

export const saveItinerary = () => {
    localStorage.setItem('tripItinerary', JSON.stringify(itinerary));
};

export const addToItinerary = (id) => {
    if (!itinerary.includes(id)) {
        itinerary.push(id);
        saveItinerary();
        return true;
    }
    return false;
};

export const removeFromItinerary = (id) => {
    itinerary = itinerary.filter(itemId => itemId !== id);
    saveItinerary();
};

export const clearItinerary = () => {
    itinerary = [];
    saveItinerary();
};
