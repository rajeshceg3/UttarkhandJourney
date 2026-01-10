// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderSidebarList, renderFilters, renderItineraryList } from '../components/sidebar.js';

// Mock feather
vi.mock('feather-icons', () => ({
    default: {
        replace: vi.fn(),
    },
}));

// Mock confirm
global.confirm = vi.fn(() => true);

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

             // global.confirm mock returns true by default
             clearBtn.click();
             expect(global.confirm).toHaveBeenCalled();
             expect(onClearClick).toHaveBeenCalled();
        });

        it('should render empty state', () => {
             const onRemoveClick = vi.fn();
             const onClearClick = vi.fn();
             renderItineraryList(container, mockLocations, [], onRemoveClick, onClearClick);

             expect(container.textContent).toContain('Start adding destinations');
        });
    });
});
