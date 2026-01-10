import feather from 'feather-icons';

export const showModal = (location) => {
    const modal = document.getElementById('location-modal');
    if (!modal) return;

    // Clear previous content
    modal.innerHTML = '';

    // Create Modal Content Wrapper
    const contentDiv = document.createElement('div');
    contentDiv.className = "modal-content bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-lg relative animate-fade-in";

    // Close Button
    const closeBtn = document.createElement('button');
    closeBtn.className = "modal-close-btn absolute top-4 right-4 text-gray-500 hover:text-gray-800";
    closeBtn.ariaLabel = "Close modal";
    // Using innerHTML for the icon is safe here as it's a hardcoded string
    closeBtn.innerHTML = '<i data-feather="x" width="24" height="24"></i>';
    closeBtn.addEventListener('click', closeModal);
    contentDiv.appendChild(closeBtn);

    // Title
    const title = document.createElement('h2');
    title.className = "text-2xl font-serif font-bold mb-4";
    title.textContent = location.title;
    contentDiv.appendChild(title);

    // Image
    const img = document.createElement('img');
    img.src = location.image;
    img.alt = location.title;
    img.className = "w-full h-48 object-cover rounded-md mb-4";
    img.loading = "lazy";
    contentDiv.appendChild(img);

    // Description
    const desc = document.createElement('p');
    desc.className = "text-gray-700 leading-relaxed";
    desc.textContent = location.description;
    contentDiv.appendChild(desc);

    // Type Tag
    const tagContainer = document.createElement('div');
    tagContainer.className = "mt-4 flex items-center gap-2";

    const tag = document.createElement('span');
    tag.className = "px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium capitalize";
    tag.textContent = location.type;
    tagContainer.appendChild(tag);

    contentDiv.appendChild(tagContainer);

    // Append Content to Modal
    modal.appendChild(contentDiv);

    // Show Modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // Replace icons
    feather.replace();
};

export const closeModal = () => {
    const modal = document.getElementById('location-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};
