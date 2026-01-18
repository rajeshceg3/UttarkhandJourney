import feather from 'feather-icons';

export const renderFilters = (container, locations, onFilterChange) => {
    if (!container) return;
    const types = ['all', ...new Set(locations.map(l => l.type))];

    container.innerHTML = '';

    types.forEach(type => {
        const btn = document.createElement('button');
        // Polished Pill Style
        const isActive = type === 'all';
        const baseClass = "filter-btn whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all duration-300 border border-transparent";
        const activeClass = "bg-accent-navy text-white shadow-lg shadow-indigo-200 scale-105";
        const inactiveClass = "bg-white/50 text-gray-500 hover:bg-white hover:text-accent-terracotta hover:shadow-md";

        btn.className = `${baseClass} ${isActive ? activeClass : inactiveClass}`;

        btn.dataset.type = type;
        btn.ariaLabel = `Filter by ${type}`;
        btn.textContent = type.replace('-', ' ');

        btn.addEventListener('click', (e) => {
            const clickedBtn = e.target.closest('.filter-btn');
            if (clickedBtn) {
                 container.querySelectorAll('.filter-btn').forEach(b => {
                    b.className = `${baseClass} ${inactiveClass}`;
                 });
                 clickedBtn.className = `${baseClass} ${activeClass}`;
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
        emptyState.className = 'flex flex-col items-center justify-center py-16 text-gray-300 animate-fade-in text-center px-6';

        const iconContainer = document.createElement('div');
        iconContainer.className = "mb-4 w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center";

        const icon = document.createElement('i');
        icon.dataset.feather = "map";
        icon.className = "text-gray-300";
        icon.setAttribute('width', '24');
        icon.setAttribute('height', '24');
        iconContainer.appendChild(icon);
        emptyState.appendChild(iconContainer);

        const text = document.createElement('p');
        text.className = "text-sm font-medium text-gray-500";
        text.textContent = 'No destinations match your filter.';
        emptyState.appendChild(text);

        container.appendChild(emptyState);
        feather.replace();
        return;
    }

    filteredLocations.forEach((loc, index) => {
        const item = document.createElement('div');
        // Glass-like card
        item.className = 'location-item group relative p-4 rounded-3xl cursor-pointer bg-white mb-5 flex flex-col md:flex-row gap-5 overflow-hidden transition-all duration-300 border border-transparent hover:border-accent-terracotta/20';
        item.dataset.id = loc.id;
        item.style.setProperty('--delay', `${index * 60}ms`);

        // Thumbnail Image
        const imgContainer = document.createElement('div');
        imgContainer.className = "w-full md:w-28 h-40 md:h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm";

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
        contentDiv.className = "flex-1 min-w-0 flex flex-col justify-center";

        const headerRow = document.createElement('div');
        headerRow.className = "flex justify-between items-start mb-1";

        const title = document.createElement('h3');
        title.className = 'font-serif font-bold text-xl text-gray-800 leading-tight group-hover:text-accent-terracotta transition-colors text-balance';
        title.textContent = loc.title;
        headerRow.appendChild(title);

        contentDiv.appendChild(headerRow);

        const type = document.createElement('span');
        type.className = "text-[10px] text-accent-sage-dark font-bold uppercase tracking-widest mb-3 block";
        type.textContent = loc.type.replace('-', ' ');
        contentDiv.appendChild(type);

        const desc = document.createElement('p');
        desc.className = 'text-xs text-gray-500 line-clamp-2 leading-relaxed text-pretty';
        desc.textContent = loc.description;
        contentDiv.appendChild(desc);

        item.appendChild(contentDiv);

        // Action Button (Floating on Mobile, Integrated on Desktop)
        const isAdded = itineraryIds.includes(loc.id);
        const actionBtn = document.createElement('button');

        // Polished Button
        const btnBase = "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0 absolute bottom-4 right-4 md:static md:w-10 md:h-10 md:self-center";
        const btnState = isAdded
            ? "bg-accent-sage text-white shadow-md cursor-default"
            : "bg-gray-50 text-gray-400 hover:bg-accent-terracotta hover:text-white hover:shadow-lg hover:scale-110";

        actionBtn.className = `${btnBase} ${btnState}`;
        actionBtn.dataset.addId = loc.id;
        actionBtn.ariaLabel = isAdded ? `Added` : `Add to trip`;
        actionBtn.disabled = isAdded;

        const icon = document.createElement('i');
        icon.dataset.feather = isAdded ? "check" : "plus";
        icon.setAttribute('width', '20');
        icon.setAttribute('height', '20');
        actionBtn.appendChild(icon);

        item.appendChild(actionBtn);

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
        text.textContent = 'Start planning your trip';
        emptyState.appendChild(text);

        container.appendChild(emptyState);
        feather.replace();
        return;
    }

    // Header
    if (itineraryIds.length > 0 && onClearClick) {
        const headerDiv = document.createElement('div');
        headerDiv.className = "flex justify-between items-end mb-6 px-1";

        const titleDiv = document.createElement('div');
        const tinyLabel = document.createElement('p');
        tinyLabel.className = "text-[10px] uppercase tracking-widest text-gray-400 font-bold";
        tinyLabel.textContent = "Your Journey";
        titleDiv.appendChild(tinyLabel);

        const countSpan = document.createElement('h4');
        countSpan.className = "text-lg font-serif font-bold text-accent-navy";
        countSpan.textContent = `${itineraryIds.length} Stops`;
        titleDiv.appendChild(countSpan);

        headerDiv.appendChild(titleDiv);

        const clearBtn = document.createElement('button');
        clearBtn.className = "text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase tracking-wide transition-colors px-2 py-1 hover:bg-red-50 rounded-lg";
        clearBtn.textContent = 'Clear All';
        clearBtn.onclick = onClearClick;
        headerDiv.appendChild(clearBtn);

        container.appendChild(headerDiv);
    }

    const listContainer = document.createElement('div');
    listContainer.className = "space-y-0 relative"; // Changed for timeline

    // Timeline Line
    const timeline = document.createElement('div');
    timeline.className = "absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100 z-0";
    if (itineraryIds.length > 1) {
        listContainer.appendChild(timeline);
    }

    itineraryIds.forEach((id, index) => {
        const loc = locations.find(l => l.id === id);
        if (!loc) return;

        const item = document.createElement('div');
        item.className = 'itinerary-item relative z-10 p-2 pl-0 flex gap-4 items-center group';

        // Number badge
        const badge = document.createElement('div');
        badge.className = "w-10 h-10 flex-shrink-0 rounded-full bg-white border-2 border-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shadow-sm group-hover:border-accent-terracotta group-hover:text-accent-terracotta transition-colors";
        badge.textContent = index + 1;
        item.appendChild(badge);

        // Card
        const card = document.createElement('div');
        card.className = "flex-1 p-3 rounded-xl bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 group-hover:shadow-md transition-all duration-300 flex items-center justify-between";

        const info = document.createElement('div');
        info.className = "flex flex-col";

        const titleSpan = document.createElement('span');
        titleSpan.className = 'font-bold text-sm text-gray-700 font-serif';
        titleSpan.textContent = loc.title;
        info.appendChild(titleSpan);

        const typeSpan = document.createElement('span');
        typeSpan.className = "text-[10px] text-gray-400 uppercase tracking-wider";
        typeSpan.textContent = loc.type;
        info.appendChild(typeSpan);

        card.appendChild(info);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100';
        removeBtn.ariaLabel = `Remove ${loc.title}`;

        const icon = document.createElement('i');
        icon.dataset.feather = "trash-2";
        icon.setAttribute('width', '14');
        icon.setAttribute('height', '14');
        removeBtn.appendChild(icon);

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            onRemoveClick(id);
        });

        card.appendChild(removeBtn);
        item.appendChild(card);
        listContainer.appendChild(item);
    });

    container.appendChild(listContainer);
};

export const updateActiveLocation = (container, id) => {
    if (!container) return;
    container.querySelectorAll('.location-item').forEach(el => {
        el.classList.remove('active', 'ring-2', 'ring-accent-sage', 'ring-offset-2');
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
