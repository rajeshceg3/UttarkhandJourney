// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import L from 'leaflet'; // Import mocked L to access spies

// Mock Leaflet
const mockMap = {
    setView: vi.fn().mockReturnThis(),
    flyTo: vi.fn(),
    removeControl: vi.fn(),
    addControl: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    invalidateSize: vi.fn(),
};

const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    openPopup: vi.fn(),
    on: vi.fn(),
};

const mockRoutingControl = {
    addTo: vi.fn(),
};

const mockClusterGroup = {
    addLayer: vi.fn(),
    addLayers: vi.fn(),
    zoomToShowLayer: vi.fn((marker, cb) => cb && cb()),
    addTo: vi.fn(),
    clearLayers: vi.fn(),
    getChildCount: vi.fn(() => 10),
};

const mockControlZoom = {
    addTo: vi.fn(),
};

vi.mock('leaflet', () => {
    return {
        default: {
            map: vi.fn(() => mockMap),
            tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
            marker: vi.fn(() => mockMarker),
            divIcon: vi.fn(),
            point: vi.fn(),
            popup: vi.fn(() => ({ setContent: vi.fn().mockReturnThis() })),
            latLng: vi.fn(),
            markerClusterGroup: vi.fn(() => mockClusterGroup),
            control: {
                zoom: vi.fn(() => mockControlZoom),
                attribution: vi.fn(() => ({ addTo: vi.fn() }))
            },
            Routing: {
                control: vi.fn(() => mockRoutingControl)
            }
        }
    };
});

// Mock Leaflet Routing Machine CSS import (since we are in node/jsdom)
vi.mock('leaflet-routing-machine', () => ({}));
vi.mock('leaflet.markercluster', () => ({}));

import { initMap } from '../components/map.js';

describe('Map Component', () => {
    let locations;

    beforeEach(() => {
        document.body.innerHTML = '<div id="map"></div>';
        locations = [
            { id: 1, lat: 10, lng: 10, title: 'Loc 1', type: 'city' },
            { id: 2, lat: 20, lng: 20, title: 'Loc 2', type: 'park' }
        ];
        vi.clearAllMocks();
    });

    it('should initialize map', () => {
        const controls = initMap('map', locations, vi.fn(), vi.fn(), vi.fn());
        expect(controls).not.toBeNull();
        expect(L.control.zoom).toHaveBeenCalled(); // Updated to check custom zoom control
        expect(L.control.attribution).toHaveBeenCalled();
    });

    it('should add markers for each location', () => {
        initMap('map', locations, vi.fn(), vi.fn(), vi.fn());
        expect(L.marker).toHaveBeenCalledTimes(2);
        expect(mockClusterGroup.addLayer).toHaveBeenCalledTimes(2);
    });

    it('flyToLocation should call map.flyTo', () => {
        const controls = initMap('map', locations, vi.fn(), vi.fn(), vi.fn());
        controls.flyToLocation(123, 456);
        expect(mockMap.flyTo).toHaveBeenCalledWith([123, 456], 14, expect.any(Object)); // Updated zoom level to 14
    });

    it('updateMapRoute should add routing control', () => {
         const controls = initMap('map', locations, vi.fn(), vi.fn(), vi.fn());
         controls.updateMapRoute([1, 2]);
         expect(L.Routing.control).toHaveBeenCalled();
    });
});
