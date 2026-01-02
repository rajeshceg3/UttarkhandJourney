import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addToItinerary, removeFromItinerary, clearItinerary, getItinerary, loadItinerary, saveItinerary } from '../src/itinerary.js';

describe('Itinerary Logic', () => {
    beforeEach(() => {
        clearItinerary();
        localStorage.clear();
        vi.spyOn(Storage.prototype, 'setItem');
    });

    it('should start with an empty itinerary', () => {
        expect(getItinerary()).toEqual([]);
    });

    it('should add an item to the itinerary', () => {
        const added = addToItinerary('test-loc');
        expect(added).toBe(true);
        expect(getItinerary()).toContain('test-loc');
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not add duplicate items', () => {
        addToItinerary('test-loc');
        const addedAgain = addToItinerary('test-loc');
        expect(addedAgain).toBe(false);
        expect(getItinerary().length).toBe(1);
    });

    it('should remove an item from the itinerary', () => {
        addToItinerary('loc1');
        addToItinerary('loc2');
        removeFromItinerary('loc1');
        expect(getItinerary()).not.toContain('loc1');
        expect(getItinerary()).toContain('loc2');
    });

    it('should clear the itinerary', () => {
        addToItinerary('loc1');
        clearItinerary();
        expect(getItinerary()).toEqual([]);
    });

    it('should load itinerary from localStorage', () => {
        const saved = JSON.stringify(['saved-loc']);
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(saved);
        loadItinerary();
        expect(getItinerary()).toContain('saved-loc');
    });
});
