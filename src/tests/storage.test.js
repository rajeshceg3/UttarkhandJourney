import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create a mock for localStorage since we might be in node env or jsdom might be slow
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    clear: vi.fn(() => { store = {}; }),
    removeItem: vi.fn(key => { delete store[key]; })
  };
})();

// Mock global window and localStorage if they don't exist
if (typeof window === 'undefined') {
    global.window = {};
}
if (typeof localStorage === 'undefined') {
    global.localStorage = localStorageMock;
}

// Now import the module under test
// Note: We need to use dynamic import or require to ensure mocks are set up BEFORE the module is loaded
// if the module uses localStorage at the top level.
// `src/utils/storage.js` uses localStorage inside functions, so it's safe to import statically usually.
import { loadItinerary, saveItinerary } from '../utils/storage.js';

describe('Storage Utils', () => {
    beforeEach(() => {
        global.localStorage.clear();
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
        global.localStorage.getItem.mockReturnValue('{"not": "an array"}');
        const result = loadItinerary();
        expect(result).toEqual([]);
    });
});
