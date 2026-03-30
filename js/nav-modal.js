// -----NAV MODAL-----
(function () {
	const overlay = document.querySelector('.nav-modal-overlay');
	const modal   = document.querySelector('.nav-modal');
	const menuBtn = document.querySelector('.menu-btn');
	const closeBtn = document.querySelector('.nav-modal__close');

	function openModal() {
		overlay.classList.add('is-open');
		modal.classList.add('is-open');
		document.body.style.overflow = 'hidden';
		menuBtn.setAttribute('aria-expanded', 'true');
	}

	function closeModal() {
		overlay.classList.remove('is-open');
		modal.classList.remove('is-open');
		document.body.style.overflow = '';
		menuBtn.setAttribute('aria-expanded', 'false');
	}

	menuBtn.addEventListener('click', () => {
		const isOpen = modal.classList.contains('is-open');
		isOpen ? closeModal() : openModal();
	});

	closeBtn.addEventListener('click', closeModal);
	overlay.addEventListener('click', closeModal);

	// Fechar com ESC
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && modal.classList.contains('is-open')) {
			closeModal();
		}
	});
})();