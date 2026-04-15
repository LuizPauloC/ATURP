(function () {
	const overlay = document.querySelector('.nav-modal-overlay');
	const modal = document.querySelector('.nav-modal');
	const menuBtn = document.querySelector('.menu-btn');
	const closeBtn = document.querySelector('.nav-modal__close');
	const navLinks = modal?.querySelectorAll('.nav-modal__link') ?? [];
	const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
	let previousFocus = null;

	if (!overlay || !modal || !menuBtn || !closeBtn) return;

	function setModalState(isOpen) {
		overlay.classList.toggle('is-open', isOpen);
		modal.classList.toggle('is-open', isOpen);
		overlay.setAttribute('aria-hidden', String(!isOpen));
		modal.setAttribute('aria-hidden', String(!isOpen));
		menuBtn.setAttribute('aria-expanded', String(isOpen));
		document.body.style.overflow = isOpen ? 'hidden' : '';

		if (isOpen) {
			previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			modal.removeAttribute('inert');
			const firstFocusable = modal.querySelector(focusableSelector);
			(firstFocusable ?? closeBtn).focus();
			return;
		}

		modal.setAttribute('inert', '');
		previousFocus?.focus();
	}

	const openModal = () => setModalState(true);
	const closeModal = () => setModalState(false);

	menuBtn.addEventListener('click', () => {
		const isOpen = modal.classList.contains('is-open');
		isOpen ? closeModal() : openModal();
	});

	closeBtn.addEventListener('click', closeModal);
	overlay.addEventListener('click', closeModal);
	navLinks.forEach((link) => link.addEventListener('click', closeModal));

	document.addEventListener('keydown', (event) => {
		if (!modal.classList.contains('is-open')) return;

		if (event.key === 'Escape') {
			closeModal();
			return;
		}

		if (event.key !== 'Tab') return;

		const focusableElements = [...modal.querySelectorAll(focusableSelector)];
		if (!focusableElements.length) {
			event.preventDefault();
			return;
		}

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (event.shiftKey && document.activeElement === firstElement) {
			event.preventDefault();
			lastElement.focus();
		} else if (!event.shiftKey && document.activeElement === lastElement) {
			event.preventDefault();
			firstElement.focus();
		}
	});
})();
