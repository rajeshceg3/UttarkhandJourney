import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadItinerary, saveItinerary } from '../utils/storage.js';

describe('Storage Utils', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should load empty array if nothing in storage', () => {
        const result = loadItinerary();
        expect(result).toEqual([]);
    });

    it('should save and load itinerary', () => {
        const itinerary = ['dehradun', 'rishikesh'];
        saveItinerary(itinerary);
        const result = loadItinerary();
        expect(result).toEqual(itinerary);
    });
});
