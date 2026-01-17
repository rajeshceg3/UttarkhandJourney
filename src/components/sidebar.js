import feather from 'feather-icons';

export const renderFilters = (container, locations, onFilterChange) => {
    if (!container) return;
    const types = ['all', ...new Set(locations.map(l => l.type))];

    container.innerHTML = '';

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = `filter-btn whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 border border-transparent bg-gray-50 text-gray-400 hover:bg-white hover:text-accent-navy hover:shadow-md ${type === 'all' ? 'active' : ''}`;
        if (type === 'all') {
            btn.classList.add('bg-accent-navy', 'text-white', 'shadow-md');
            btn.classList.remove('bg-gray-50', 'text-gray-400');
        }
        btn.dataset.type = type;
        btn.ariaLabel = `Filter by ${type}`;
        btn.textContent = type.replace('-', ' ');

        btn.addEventListener('click', (e) => {
            const clickedBtn = e.target.closest('.filter-btn');
            if (clickedBtn) {
                 container.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active', 'bg-accent-navy', 'text-white', 'shadow-md');
                    b.classList.add('bg-gray-50', 'text-gray-400');
                 });
                 clickedBtn.classList.add('active', 'bg-accent-navy', 'text-white', 'shadow-md');
                 clickedBtn.classList.remove('bg-gray-50', 'text-gray-400');
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
        emptyState.className = 'flex flex-col items-center justify-center py-12 text-gray-400 animate-fade-in';

        const icon = document.createElement('i');
        icon.dataset.feather = "map";
        icon.className = "mb-4 text-gray-200";
        icon.setAttribute('width', '56');
        icon.setAttribute('height', '56');
        emptyState.appendChild(icon);

        const text = document.createElement('p');
        text.className = "text-base font-medium";
        text.textContent = 'No destinations found.';
        emptyState.appendChild(text);

        container.appendChild(emptyState);
        feather.replace();
        return;
    }

    filteredLocations.forEach((loc, index) => {
        const item = document.createElement('div');
        item.className = 'location-item group relative p-3 rounded-2xl cursor-pointer bg-white mb-4 flex gap-4 overflow-hidden';
        item.dataset.id = loc.id;
        item.style.setProperty('--delay', `${index * 50}ms`);

        // Thumbnail Image
        const imgContainer = document.createElement('div');
        imgContainer.className = "w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative shadow-sm";

        const img = document.createElement('img');
        img.src = loc.image;
        img.alt = loc.title;
        img.className = "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110";
        img.loading = "lazy";

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
        contentDiv.className = "flex-1 min-w-0 flex flex-col justify-center py-1";

        const title = document.createElement('h3');
        title.className = 'font-serif font-bold text-lg text-gray-800 leading-tight mb-1 truncate group-hover:text-accent-terracotta transition-colors';
        title.textContent = loc.title;
        contentDiv.appendChild(title);

        const type = document.createElement('span');
        type.className = "text-[10px] text-accent-sage-dark font-bold uppercase tracking-widest mb-2 block";
        type.textContent = loc.type.replace('-', ' ');
        contentDiv.appendChild(type);

        const desc = document.createElement('p');
        desc.className = 'text-xs text-gray-500 line-clamp-2 leading-relaxed';
        desc.textContent = loc.description;
        contentDiv.appendChild(desc);

        item.appendChild(contentDiv);

        // Action Button (Floating/Integrated)
        const isAdded = itineraryIds.includes(loc.id);
        const actionBtn = document.createElement('button');

        // Polished Button
        actionBtn.className = `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isAdded ? 'bg-accent-sage text-white shadow-md cursor-default' : 'bg-gray-50 text-gray-400 hover:bg-accent-terracotta hover:text-white hover:shadow-lg hover:scale-110'}`;

        actionBtn.dataset.addId = loc.id;
        actionBtn.ariaLabel = isAdded ? `Added` : `Add to trip`;
        actionBtn.disabled = isAdded;

        const icon = document.createElement('i');
        icon.dataset.feather = isAdded ? "check" : "plus";
        icon.setAttribute('width', '20');
        icon.setAttribute('height', '20');
        actionBtn.appendChild(icon);

        const actionDiv = document.createElement('div');
        actionDiv.className = "flex flex-col items-center justify-center pl-1";
        actionDiv.appendChild(actionBtn);
        item.appendChild(actionDiv);

        // Events
        item.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            onLocClick(loc);
        });

        if (!isAdded) {
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Animation for button
                actionBtn.classList.add('scale-75');
                setTimeout(() => actionBtn.classList.remove('scale-75'), 150);
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
        emptyState.className = 'flex flex-col items-center justify-center py-8 text-gray-300';

        const icon = document.createElement('i');
        icon.dataset.feather = "calendar";
        icon.className = "mb-2 opacity-50";
        emptyState.appendChild(icon);

        const text = document.createElement('p');
        text.className = "text-xs font-medium uppercase tracking-wide";
        text.textContent = 'Empty Trip';
        emptyState.appendChild(text);

        container.appendChild(emptyState);
        feather.replace();
        return;
    }

    // Header with Clear All
    if (itineraryIds.length > 0 && onClearClick) {
        const headerDiv = document.createElement('div');
        headerDiv.className = "flex justify-between items-center mb-4 px-1";

        const countSpan = document.createElement('span');
        countSpan.className = "text-[10px] font-bold text-gray-400 uppercase tracking-widest";
        countSpan.textContent = `${itineraryIds.length} stops`;
        headerDiv.appendChild(countSpan);

        const clearBtn = document.createElement('button');
        clearBtn.className = "text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase tracking-wide transition-colors flex items-center gap-1";
        clearBtn.innerHTML = 'Clear';
        clearBtn.onclick = onClearClick;
        headerDiv.appendChild(clearBtn);

        container.appendChild(headerDiv);
    }

    const listContainer = document.createElement('div');
    listContainer.className = "space-y-3";

    itineraryIds.forEach((id, index) => {
        const loc = locations.find(l => l.id === id);
        if (!loc) return;

        const item = document.createElement('div');
        item.className = 'itinerary-item p-3 pr-2 rounded-xl flex gap-3 items-center bg-white shadow-sm border border-gray-100 group transition-transform hover:translate-x-1';

        // Number badge
        const badge = document.createElement('div');
        badge.className = "w-6 h-6 rounded-full bg-accent-navy text-white flex items-center justify-center text-[10px] font-bold shadow-md ring-2 ring-white";
        badge.textContent = index + 1;
        item.appendChild(badge);

        const titleSpan = document.createElement('span');
        titleSpan.className = 'font-medium text-sm text-gray-700 flex-1 truncate font-serif';
        titleSpan.textContent = loc.title;
        item.appendChild(titleSpan);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 transition-all duration-200';
        removeBtn.ariaLabel = `Remove ${loc.title}`;

        const icon = document.createElement('i');
        icon.dataset.feather = "x";
        icon.setAttribute('width', '14');
        icon.setAttribute('height', '14');
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
