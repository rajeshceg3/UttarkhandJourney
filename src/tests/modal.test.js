// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showModal } from '../components/modal.js';

// Mock feather
vi.mock('feather-icons', () => ({
    default: {
        replace: vi.fn(),
    },
}));

describe('Modal Component', () => {
    let modal;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="location-modal" class="hidden"></div>
        `;
        modal = document.getElementById('location-modal');
    });

    it('should show modal with correct content', () => {
        const location = {
            title: 'Test Location',
            image: 'test.jpg',
            description: 'Test Description',
            type: 'city'
        };

        showModal(location);

        expect(modal.classList.contains('hidden')).toBe(false);
        expect(modal.querySelector('h2').textContent).toBe(location.title);
        expect(modal.querySelector('p').textContent).toBe(location.description);
        expect(modal.querySelector('img').src).toContain(location.image);
    });

    it('should close modal when close button clicked', () => {
        const location = { title: 'T', image: 'i', description: 'd', type: 'c' };
        showModal(location);

        const closeBtn = modal.querySelector('.modal-close-btn');
        closeBtn.click();

        expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('should close modal when clicking outside content', () => {
        const location = { title: 'T', image: 'i', description: 'd', type: 'c' };
        showModal(location);

        // Click on the backdrop (modal itself)
        modal.click();
        expect(modal.classList.contains('hidden')).toBe(true);
    });

     it('should NOT close modal when clicking inside content', () => {
        const location = { title: 'T', image: 'i', description: 'd', type: 'c' };
        showModal(location);

        const content = modal.querySelector('.modal-content');
        content.click();
        expect(modal.classList.contains('hidden')).toBe(false);
    });
});
