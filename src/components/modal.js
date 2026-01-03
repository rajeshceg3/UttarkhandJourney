export const showModal = (location) => {
    const modal = document.getElementById('location-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-lg relative animate-fade-in">
            <button class="modal-close-btn absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                <i data-feather="x" width="24" height="24"></i>
            </button>
            <h2 class="text-2xl font-serif font-bold mb-4">${location.title}</h2>
            <img src="${location.image}" alt="${location.title}" class="w-full h-48 object-cover rounded-md mb-4">
            <p class="text-gray-700 leading-relaxed">${location.description}</p>
            <div class="mt-4 flex items-center gap-2">
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium capitalize">
                    ${location.type}
                </span>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
};

export const closeModal = () => {
    const modal = document.getElementById('location-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};
