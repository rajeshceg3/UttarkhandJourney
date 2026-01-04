// LocalStorage Wrapper
const STORAGE_KEY = 'uttarakhand_itinerary';

export const loadItinerary = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Failed to load itinerary', e);
        return [];
    }
};

export const saveItinerary = (itinerary) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(itinerary));
    } catch (e) {
        console.error('Failed to save itinerary', e);
    }
};
