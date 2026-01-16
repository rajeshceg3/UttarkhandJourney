import feather from 'feather-icons';

export const renderFilters = (container, locations, onFilterChange) => {
    if (!container) return;
    const types = ['all', ...new Set(locations.map(l => l.type))];

    container.innerHTML = '';

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = `filter-btn px-4 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-500 capitalize transition-all border border-transparent hover:bg-white hover:shadow-sm ${type === 'all' ? 'active' : ''}`;
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
        emptyState.className = 'flex flex-col items-center justify-center py-12 text-gray-400';

        const icon = document.createElement('i');
        icon.dataset.feather = "map";
        icon.className = "mb-3 text-gray-300";
        icon.setAttribute('width', '48');
        icon.setAttribute('height', '48');
        emptyState.appendChild(icon);

        const text = document.createElement('p');
        text.className = "text-base font-medium";
        text.textContent = 'No locations found.';
        emptyState.appendChild(text);

        container.appendChild(emptyState);
        feather.replace();
        return;
    }

    filteredLocations.forEach((loc, index) => {
        const item = document.createElement('div');
        item.className = 'location-item group relative p-3 rounded-xl cursor-pointer bg-white mb-3 flex gap-4 overflow-hidden';
        item.dataset.id = loc.id;
        item.style.setProperty('--delay', `${index * 50}ms`);

        // Thumbnail Image
        const imgContainer = document.createElement('div');
        imgContainer.className = "w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative";

        const img = document.createElement('img');
        img.src = loc.image; // Assuming loc.image exists, fallback if needed
        img.alt = loc.title;
        img.className = "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110";
        img.loading = "lazy";

        // Error handling for image
        img.onerror = () => {
            img.style.display = 'none';
            const fallbackIcon = document.createElement('i');
            fallbackIcon.dataset.feather = 'image';
            fallbackIcon.className = "text-gray-300 absolute inset-0 m-auto";
            imgContainer.appendChild(fallbackIcon);
            feather.replace();
        };

        imgContainer.appendChild(img);
        item.appendChild(imgContainer);

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.className = "flex-1 min-w-0 flex flex-col justify-center";

        const title = document.createElement('h3');
        title.className = 'font-bold text-base text-gray-800 font-serif leading-tight mb-1 truncate';
        title.textContent = loc.title;
        contentDiv.appendChild(title);

        const type = document.createElement('span');
        type.className = "text-xs text-accent-terracotta font-medium uppercase tracking-wider mb-1 block";
        type.textContent = loc.type.replace('-', ' ');
        contentDiv.appendChild(type);

        const desc = document.createElement('p');
        desc.className = 'text-xs text-gray-500 line-clamp-2';
        desc.textContent = loc.description;
        contentDiv.appendChild(desc);

        item.appendChild(contentDiv);

        // Action Button
        const isAdded = itineraryIds.includes(loc.id);
        const actionBtn = document.createElement('button');
        actionBtn.className = `w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAdded ? 'bg-accent-sage text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-accent-sage hover:text-white hover:shadow-md'}`;
        actionBtn.dataset.addId = loc.id;
        actionBtn.ariaLabel = isAdded ? `Added` : `Add to trip`;
        actionBtn.disabled = isAdded;

        const icon = document.createElement('i');
        icon.dataset.feather = isAdded ? "check" : "plus";
        icon.setAttribute('width', '20');
        icon.setAttribute('height', '20');
        actionBtn.appendChild(icon);

        // Add to item but position it or flex it?
        // Let's use flex layout
        const actionDiv = document.createElement('div');
        actionDiv.className = "flex items-center justify-center pl-2";
        actionDiv.appendChild(actionBtn);
        item.appendChild(actionDiv);

        // Events
        item.addEventListener('click', (e) => {
            // Prevent triggering if button was clicked
            if (e.target.closest('button')) return;
            onLocClick(loc);
        });

        if (!isAdded) {
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Animation for button
                actionBtn.classList.add('scale-90');
                setTimeout(() => actionBtn.classList.remove('scale-90'), 150);
                onAddClick(loc.id);
            });
        }

        container.appendChild(item);
    });
};

export const renderItineraryList = (container, locations, itineraryIds, onRemoveClick, onClearClick) => {
    if (!container) return;
    container.innerHTML = '';

    if (itineraryIds.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'flex flex-col items-center justify-center py-6 text-gray-400';

        const icon = document.createElement('i');
        icon.dataset.feather = "calendar";
        icon.className = "mb-2 text-gray-300";
        emptyState.appendChild(icon);

        const text = document.createElement('p');
        text.className = "text-sm";
        text.textContent = 'Your trip is empty.';
        emptyState.appendChild(text);

        container.appendChild(emptyState);
        feather.replace();
        return;
    }

    // Header with Clear All
    if (itineraryIds.length > 0 && onClearClick) {
        const headerDiv = document.createElement('div');
        headerDiv.className = "flex justify-between items-center mb-3 px-1";

        const countSpan = document.createElement('span');
        countSpan.className = "text-xs font-bold text-gray-400 uppercase tracking-widest";
        countSpan.textContent = `${itineraryIds.length} Destinations`;
        headerDiv.appendChild(countSpan);

        const clearBtn = document.createElement('button');
        clearBtn.className = "text-xs text-red-400 hover:text-red-600 font-medium transition-colors flex items-center gap-1";
        clearBtn.innerHTML = 'Clear All';
        clearBtn.onclick = onClearClick;
        headerDiv.appendChild(clearBtn);

        container.appendChild(headerDiv);
    }

    const listContainer = document.createElement('div');
    listContainer.className = "space-y-2";

    itineraryIds.forEach((id, index) => {
        const loc = locations.find(l => l.id === id);
        if (!loc) return;

        const item = document.createElement('div');
        item.className = 'itinerary-item p-3 rounded-lg flex gap-3 items-center bg-white shadow-sm border border-gray-100 group';
        // Add explicit left border color via style or class based on type?
        // Using common class from CSS

        // Number badge
        const badge = document.createElement('div');
        badge.className = "w-6 h-6 rounded-full bg-accent-terracotta text-white flex items-center justify-center text-xs font-bold shadow-sm";
        badge.textContent = index + 1;
        item.appendChild(badge);

        const titleSpan = document.createElement('span');
        titleSpan.className = 'font-medium text-sm text-gray-700 flex-1 truncate';
        titleSpan.textContent = loc.title;
        item.appendChild(titleSpan);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100';
        removeBtn.ariaLabel = `Remove ${loc.title}`;

        const icon = document.createElement('i');
        icon.dataset.feather = "trash-2"; // Changed to trash for better semantics
        icon.setAttribute('width', '16');
        icon.setAttribute('height', '16');
        removeBtn.appendChild(icon);

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            onRemoveClick(id);
        });

        item.appendChild(removeBtn);
        listContainer.appendChild(item);
    });

    container.appendChild(listContainer);
};

export const updateActiveLocation = (container, id) => {
    if (!container) return;
    container.querySelectorAll('.location-item').forEach(el => {
        el.classList.remove('active');
        el.classList.remove('ring-2', 'ring-accent-sage', 'ring-offset-2');
    });
    const activeEl = container.querySelector(`.location-item[data-id="${id}"]`);
    if (activeEl) {
        activeEl.classList.add('active');
        // Add accessibility focus ring visual
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
