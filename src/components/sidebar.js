import feather from 'feather-icons';

export const renderFilters = (container, locations, onFilterChange) => {
    if (!container) return;
    const types = ['all', ...new Set(locations.map(l => l.type))];

    container.innerHTML = '';

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = `filter-btn px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize transition-all border border-transparent ${type === 'all' ? 'active' : ''}`;
        btn.dataset.type = type;
        btn.ariaLabel = `Filter by ${type}`;
        btn.textContent = type.replace('-', ' ');

        btn.addEventListener('click', (e) => {
            const clickedBtn = e.target.closest('.filter-btn');
            if (clickedBtn) {
                 container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                 clickedBtn.classList.add('active');
                 onFilterChange(clickedBtn.dataset.type);
            }
        });
        container.appendChild(btn);
    });
};

export const renderSidebarList = (container, locations, itineraryIds, onLocClick, onAddClick, filterType = 'all') => {
    if (!container) return;
    container.innerHTML = '';

    const filteredLocations = filterType === 'all'
        ? locations
        : locations.filter(loc => loc.type === filterType);

    if (filteredLocations.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'flex flex-col items-center justify-center py-8 text-gray-500';

        const icon = document.createElement('i');
        icon.dataset.feather = "map";
        icon.className = "mb-2 text-gray-300";
        icon.setAttribute('width', '32');
        icon.setAttribute('height', '32');
        emptyState.appendChild(icon);

        const text = document.createElement('p');
        text.className = "text-sm";
        text.textContent = 'No locations found matching this filter.';
        emptyState.appendChild(text);

        container.appendChild(emptyState);
        feather.replace();
        return;
    }

    filteredLocations.forEach((loc, index) => {
        const item = document.createElement('div');
        item.className = 'location-item p-4 rounded-lg cursor-pointer fade-in flex justify-between items-center bg-white shadow-sm mb-2';
        item.dataset.id = loc.id;
        item.style.animationDelay = `${index * 50}ms`;

        // Content Container
        const contentDiv = document.createElement('div');

        const title = document.createElement('h3');
        title.className = 'font-bold text-lg font-serif';
        title.textContent = loc.title;
        contentDiv.appendChild(title);

        const desc = document.createElement('p');
        desc.className = 'text-sm text-gray-600 truncate w-48';
        desc.textContent = loc.description;
        contentDiv.appendChild(desc);

        item.appendChild(contentDiv);

        // Add Button Logic
        const isAdded = itineraryIds.includes(loc.id);
        const addBtn = document.createElement('button');
        addBtn.className = `add-sidebar-btn p-2 rounded-full transition-colors ${isAdded ? 'bg-accent-sage/20 text-accent-sage cursor-default' : 'hover:bg-gray-100 text-gray-400 hover:text-accent-sage'}`;
        addBtn.dataset.addId = loc.id;
        addBtn.ariaLabel = isAdded ? `${loc.title} added to trip` : `Add ${loc.title} to trip`;
        addBtn.disabled = isAdded; // Disable if already added

        const icon = document.createElement('i');
        icon.dataset.feather = isAdded ? "check" : "plus-circle";
        if (isAdded) {
             // icon.className = "text-accent-sage"; // Handled by parent class
        } else {
             icon.className = "text-accent-sage";
        }
        addBtn.appendChild(icon);

        item.appendChild(addBtn);

        // Events
        contentDiv.addEventListener('click', () => onLocClick(loc));
        if (!isAdded) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onAddClick(loc.id);
            });
        } else {
             addBtn.addEventListener('click', (e) => e.stopPropagation());
        }

        container.appendChild(item);
    });
    feather.replace();
};

export const renderItineraryList = (container, locations, itineraryIds, onRemoveClick, onClearClick) => {
    if (!container) return;
    container.innerHTML = '';

    if (itineraryIds.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'flex flex-col items-center justify-center py-6 text-gray-500';

        const icon = document.createElement('i');
        icon.dataset.feather = "calendar";
        icon.className = "mb-2 text-gray-300";
        emptyState.appendChild(icon);

        const text = document.createElement('p');
        text.className = "text-sm italic";
        text.textContent = 'Start adding destinations!';
        emptyState.appendChild(text);

        container.appendChild(emptyState);
        feather.replace();
        return;
    }

    // Add "Clear All" button if there are items
    if (itineraryIds.length > 0 && onClearClick) {
        const headerDiv = document.createElement('div');
        headerDiv.className = "flex justify-end mb-2";

        const clearBtn = document.createElement('button');
        clearBtn.className = "text-xs text-red-500 hover:text-red-700 underline font-medium";
        clearBtn.textContent = "Clear All";
        clearBtn.onclick = () => {
            if (confirm("Are you sure you want to clear your entire itinerary? This action cannot be undone.")) {
                onClearClick();
            }
        };
        headerDiv.appendChild(clearBtn);

        container.appendChild(headerDiv);
    }

    itineraryIds.forEach(id => {
        const loc = locations.find(l => l.id === id);
        if (!loc) return;

        const item = document.createElement('div');
        item.className = 'itinerary-item p-3 rounded-lg flex justify-between items-center bg-white shadow-sm mb-2 border-l-4 border-accent-terracotta';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'font-medium';
        titleSpan.textContent = loc.title;
        item.appendChild(titleSpan);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn text-gray-400 hover:text-red-500 transition-colors';
        removeBtn.ariaLabel = `Remove ${loc.title} from trip`;

        const icon = document.createElement('i');
        icon.dataset.feather = "x";
        icon.setAttribute('width', '16');
        icon.setAttribute('height', '16');
        removeBtn.appendChild(icon);

        item.appendChild(removeBtn);

        removeBtn.addEventListener('click', () => onRemoveClick(id));
        container.appendChild(item);
    });
    feather.replace();
};

export const updateActiveLocation = (container, id) => {
    if (!container) return;
    container.querySelectorAll('.location-item').forEach(el => el.classList.remove('active'));
    const activeEl = container.querySelector(`.location-item[data-id="${id}"]`);
    if (activeEl) activeEl.classList.add('active');
};

export const toggleSidebar = (sidebarEl, isOpen) => {
    if (!sidebarEl) return;
    if (isOpen) {
        sidebarEl.classList.add('translate-x-0');
        sidebarEl.classList.remove('-translate-x-full');
    } else {
        sidebarEl.classList.remove('translate-x-0');
        sidebarEl.classList.add('-translate-x-full');
    }
};
