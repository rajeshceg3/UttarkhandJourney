import feather from 'feather-icons';

export const showModal = (location) => {
    const modal = document.getElementById('location-modal');
    if (!modal) return;

    modal.innerHTML = '';

    // Create Modal Content Wrapper
    const contentDiv = document.createElement('div');
    contentDiv.className = "modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]";

    // Hero Image Section
    const imgContainer = document.createElement('div');
    imgContainer.className = "relative h-64 w-full flex-shrink-0";

    const img = document.createElement('img');
    img.src = location.image;
    img.alt = location.title;
    img.className = "w-full h-full object-cover";
    img.loading = "lazy";
    imgContainer.appendChild(img);

    // Close Button (Floating on image)
    const closeBtn = document.createElement('button');
    closeBtn.className = "absolute top-4 right-4 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-all duration-200 hover:scale-105";
    closeBtn.ariaLabel = "Close modal";
    closeBtn.innerHTML = '<i data-feather="x" width="20" height="20"></i>';
    closeBtn.onclick = closeModal;
    imgContainer.appendChild(closeBtn);

    // Gradient Overlay for Title visibility if needed, or just let it be clean
    // contentDiv.appendChild(imgContainer);

    // Body Container
    const bodyDiv = document.createElement('div');
    bodyDiv.className = "p-8 overflow-y-auto custom-scrollbar";

    // Title & Type
    const headerDiv = document.createElement('div');
    headerDiv.className = "mb-6";

    const typeTag = document.createElement('span');
    typeTag.className = "inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-accent-terracotta bg-red-50 rounded-full uppercase";
    typeTag.textContent = location.type.replace('-', ' ');
    headerDiv.appendChild(typeTag);

    const title = document.createElement('h2');
    title.className = "text-3xl font-serif font-bold text-gray-900";
    title.textContent = location.title;
    headerDiv.appendChild(title);

    bodyDiv.appendChild(headerDiv);

    // Description
    const desc = document.createElement('div');
    desc.className = "prose prose-indigo text-gray-600 leading-relaxed";

    // Simulate paragraphs if it's one block
    const p = document.createElement('p');
    p.textContent = location.description;
    desc.appendChild(p);

    bodyDiv.appendChild(desc);

    // Footer / Actions?
    // Maybe a "Add to Trip" button here too if not added?
    // For now, keeping it informational as per request, but let's add a nice subtle separator

    // Assemble
    contentDiv.appendChild(imgContainer);
    contentDiv.appendChild(bodyDiv);

    modal.appendChild(contentDiv);

    // Show Modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    feather.replace();
};

export const showConfirmModal = (message, onConfirm) => {
    const modal = document.getElementById('location-modal');
    if (!modal) return;

    modal.innerHTML = '';

    const contentDiv = document.createElement('div');
    contentDiv.className = "modal-content bg-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-sm relative text-center transform transition-all";

    const iconDiv = document.createElement('div');
    iconDiv.className = "mb-6 mx-auto w-16 h-16 bg-red-50 text-accent-terracotta rounded-full flex items-center justify-center";
    iconDiv.innerHTML = '<i data-feather="alert-triangle" width="32" height="32"></i>';
    contentDiv.appendChild(iconDiv);

    const title = document.createElement('h3');
    title.className = "text-xl font-bold text-gray-900 mb-2";
    title.textContent = "Clear Itinerary?";
    contentDiv.appendChild(title);

    const msg = document.createElement('p');
    msg.className = "text-gray-500 mb-8";
    msg.textContent = message || "Are you sure you want to remove all items from your trip? This action cannot be undone.";
    contentDiv.appendChild(msg);

    const btnContainer = document.createElement('div');
    btnContainer.className = "grid grid-cols-2 gap-3";

    const cancelBtn = document.createElement('button');
    cancelBtn.className = "px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors";
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = closeModal;
    btnContainer.appendChild(cancelBtn);

    const confirmBtn = document.createElement('button');
    confirmBtn.className = "px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold shadow-lg shadow-red-200 transition-all hover:transform hover:scale-105";
    confirmBtn.textContent = "Yes, Clear It";
    confirmBtn.onclick = () => {
        onConfirm();
        closeModal();
    };
    btnContainer.appendChild(confirmBtn);

    contentDiv.appendChild(btnContainer);
    modal.appendChild(contentDiv);

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    feather.replace();
};

export const closeModal = () => {
    const modal = document.getElementById('location-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};
