import { describe, it, expect } from 'vitest';
import { locations } from '../src/locations.js';

describe('Locations Data', () => {
    it('should be an array', () => {
        expect(Array.isArray(locations)).toBe(true);
    });

    it('should have required fields for each location', () => {
        locations.forEach(loc => {
            expect(loc).toHaveProperty('id');
            expect(loc).toHaveProperty('lat');
            expect(loc).toHaveProperty('lng');
            expect(loc).toHaveProperty('title');
            expect(loc).toHaveProperty('type');

            expect(typeof loc.id).toBe('string');
            expect(typeof loc.lat).toBe('number');
            expect(typeof loc.lng).toBe('number');
        });
    });

    it('should have unique IDs', () => {
        const ids = locations.map(l => l.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
});
