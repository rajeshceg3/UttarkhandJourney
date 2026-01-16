// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderSidebarList, renderFilters, renderItineraryList, toggleSidebar, updateActiveLocation } from '../components/sidebar.js';

// Mock feather
vi.mock('feather-icons', () => ({
    default: {
        replace: vi.fn(),
    },
}));

const mockLocations = [
    { id: 1, title: 'Loc 1', type: 'temple', description: 'Desc 1', lat: 10, lng: 10 },
    { id: 2, title: 'Loc 2', type: 'adventure', description: 'Desc 2', lat: 20, lng: 20 },
];

describe('Sidebar Component', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        vi.clearAllMocks();
    });

    describe('renderFilters', () => {
        it('should render filter buttons', () => {
            const onFilterChange = vi.fn();
            renderFilters(container, mockLocations, onFilterChange);

            const buttons = container.querySelectorAll('.filter-btn');
            // 'all', 'temple', 'adventure'
            expect(buttons.length).toBe(3);
            expect(buttons[0].textContent).toBe('all');
        });

        it('should call onFilterChange when clicked', () => {
            const onFilterChange = vi.fn();
            renderFilters(container, mockLocations, onFilterChange);

            const btn = container.querySelector('.filter-btn[data-type="all"]');
            btn.click();
            expect(onFilterChange).toHaveBeenCalledWith('all');
        });
    });

    describe('renderSidebarList', () => {
        it('should render locations', () => {
            const onLocClick = vi.fn();
            const onAddClick = vi.fn();
            // Provide empty itinerary array
            renderSidebarList(container, mockLocations, [], onLocClick, onAddClick);

            const items = container.querySelectorAll('.location-item');
            expect(items.length).toBe(mockLocations.length);
        });

        it('should render empty state if no locations match', () => {
            const onLocClick = vi.fn();
            const onAddClick = vi.fn();
            renderSidebarList(container, mockLocations, [], onLocClick, onAddClick, 'non-existent-type');

            expect(container.textContent).toContain('No locations found');
        });

        it('should handle location click', () => {
            const onLocClick = vi.fn();
            const onAddClick = vi.fn();
            renderSidebarList(container, mockLocations, [], onLocClick, onAddClick);

            const item = container.querySelector('.location-item');
            item.querySelector('div').click(); // click the text part
            expect(onLocClick).toHaveBeenCalledWith(mockLocations[0]);
        });

        it('should handle add button click', () => {
            const onLocClick = vi.fn();
            const onAddClick = vi.fn();
            renderSidebarList(container, mockLocations, [], onLocClick, onAddClick);

            const btn = container.querySelector('.add-sidebar-btn');
            btn.click();
            expect(onAddClick).toHaveBeenCalledWith(mockLocations[0].id);
        });

        it('should show added state for items in itinerary', () => {
            const onLocClick = vi.fn();
            const onAddClick = vi.fn();
            const itinerary = [mockLocations[0].id];
            renderSidebarList(container, mockLocations, itinerary, onLocClick, onAddClick);

            const btn = container.querySelector(`.location-item[data-id="${mockLocations[0].id}"] .add-sidebar-btn`);
            expect(btn.disabled).toBe(true);
            expect(btn.ariaLabel).toContain('added');
        });
    });

    describe('renderItineraryList', () => {
        it('should render itinerary items', () => {
             const onRemoveClick = vi.fn();
             const onClearClick = vi.fn();
             const itinerary = [mockLocations[0].id];
             renderItineraryList(container, mockLocations, itinerary, onRemoveClick, onClearClick);

             const items = container.querySelectorAll('.itinerary-item');
             expect(items.length).toBe(1);
        });

        it('should render clear button if itinerary not empty', () => {
             const onRemoveClick = vi.fn();
             const onClearClick = vi.fn();
             const itinerary = [mockLocations[0].id];
             renderItineraryList(container, mockLocations, itinerary, onRemoveClick, onClearClick);

             const clearBtn = container.querySelector('button.text-red-500');
             expect(clearBtn).not.toBeNull();

             // Modified: confirm() call removed in favor of Modal (handled in main.js)
             // The sidebar just calls the onClearClick callback
             clearBtn.click();
             expect(onClearClick).toHaveBeenCalled();
        });

        it('should render empty state', () => {
             const onRemoveClick = vi.fn();
             const onClearClick = vi.fn();
             renderItineraryList(container, mockLocations, [], onRemoveClick, onClearClick);

             expect(container.textContent).toContain('Start adding destinations');
        });
    });

    describe('toggleSidebar', () => {
        it('should open sidebar', () => {
            const el = document.createElement('div');
            el.classList.add('-translate-x-full');
            toggleSidebar(el, true);
            expect(el.classList.contains('translate-x-0')).toBe(true);
            expect(el.classList.contains('-translate-x-full')).toBe(false);
        });

        it('should close sidebar', () => {
            const el = document.createElement('div');
            el.classList.add('translate-x-0');
            toggleSidebar(el, false);
            expect(el.classList.contains('-translate-x-full')).toBe(true);
            expect(el.classList.contains('translate-x-0')).toBe(false);
        });

        it('should do nothing if element is null', () => {
            expect(() => toggleSidebar(null, true)).not.toThrow();
        });
    });

    describe('updateActiveLocation', () => {
        it('should highlight active location', () => {
            container.innerHTML = `
                <div class="location-item" data-id="1"></div>
                <div class="location-item active" data-id="2"></div>
            `;
            updateActiveLocation(container, 1);

            expect(container.querySelector('[data-id="1"]').classList.contains('active')).toBe(true);
            expect(container.querySelector('[data-id="2"]').classList.contains('active')).toBe(false);
        });

        it('should do nothing if container is null', () => {
             expect(() => updateActiveLocation(null, 1)).not.toThrow();
        });
    });

    describe('safeguards', () => {
        it('renderFilters should handle null container', () => {
             expect(() => renderFilters(null, [], () => {})).not.toThrow();
        });
        it('renderSidebarList should handle null container', () => {
             expect(() => renderSidebarList(null, [], [], () => {}, () => {})).not.toThrow();
        });
        it('renderItineraryList should handle null container', () => {
             expect(() => renderItineraryList(null, [], [], () => {}, () => {})).not.toThrow();
        });
    });
});
