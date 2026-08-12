(() => {
    const dialog = document.getElementById('gallery-lightbox-dialog');
    const image = dialog?.querySelector('.lightbox-dialog__image');
    const caption = dialog?.querySelector('.lightbox-dialog__caption');
    const items = Array.from(document.querySelectorAll('[data-gallery-lightbox-index]'));
    const photos = items.map((item) => {
        const img = item.querySelector('img');
        return {
            src: img?.getAttribute('src') || '',
            alt: img?.getAttribute('alt') || '',
            caption: item.dataset.caption || '',
        };
    }).filter((photo) => photo.src);

    let currentPhotoIndex = 0;

    if (!dialog || !image || photos.length === 0) {
        return;
    }

    function updateLightboxImage() {
        const photo = photos[currentPhotoIndex];
        if (!photo) {
            return;
        }

        image.src = photo.src;
        image.alt = photo.alt || photo.caption || 'Foto da galeria';

        if (caption) {
            caption.textContent = photo.caption || '';
            caption.hidden = !photo.caption;
        }
    }

    function showPrevPhoto() {
        currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
        updateLightboxImage();
    }

    function showNextPhoto() {
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
        updateLightboxImage();
    }

    function openLightbox(index) {
        currentPhotoIndex = Number.isInteger(index) ? index : 0;
        updateLightboxImage();
        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }
    }

    function closeLightbox() {
        if (dialog.open && typeof dialog.close === 'function') {
            dialog.close();
            return;
        }

        dialog.removeAttribute('open');
    }

    items.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    dialog.querySelectorAll('[data-lightbox-close]').forEach((button) => {
        button.addEventListener('click', closeLightbox);
    });

    dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', showPrevPhoto);
    dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', showNextPhoto);

    document.addEventListener('keydown', (event) => {
        if (!dialog.open) {
            return;
        }

        if (event.key === 'Escape') {
            closeLightbox();
        } else if (event.key === 'ArrowLeft') {
            showPrevPhoto();
        } else if (event.key === 'ArrowRight') {
            showNextPhoto();
        }
    });
})();
