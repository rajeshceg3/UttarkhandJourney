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

    it('should return empty array if loaded data is not an array', () => {
        // Spy on localStorage.getItem to return invalid JSON
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        getItemSpy.mockReturnValue('{"not": "an array"}');

        const result = loadItinerary();
        expect(result).toEqual([]);

        getItemSpy.mockRestore();
    });

    it('should return empty array if JSON parse fails', () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        getItemSpy.mockReturnValue('{invalid json');

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = loadItinerary();
        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();

        getItemSpy.mockRestore();
        consoleSpy.mockRestore();
    });

    it('should catch error when saving itinerary fails', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        setItemSpy.mockImplementation(() => {
             throw new Error('Quota exceeded');
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        saveItinerary(['test']);
        expect(consoleSpy).toHaveBeenCalled();

        setItemSpy.mockRestore();
        consoleSpy.mockRestore();
    });
});
