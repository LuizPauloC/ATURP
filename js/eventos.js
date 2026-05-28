(function () {
	const track = document.querySelector('[data-events-grid]');
	const prevButton = document.querySelector('[data-carousel-prev]');
	const nextButton = document.querySelector('[data-carousel-next]');

	if (!track || !prevButton || !nextButton) return;

	function getScrollAmount() {
		const firstCard = track.querySelector('.event-card');
		if (!firstCard) return track.clientWidth;

		const styles = window.getComputedStyle(track);
		const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
		return firstCard.getBoundingClientRect().width + gap;
	}

	function updateButtons() {
		const maxScrollLeft = track.scrollWidth - track.clientWidth;
		const currentScrollLeft = track.scrollLeft;
		const threshold = 2;

		prevButton.disabled = currentScrollLeft <= threshold;
		nextButton.disabled = currentScrollLeft >= maxScrollLeft - threshold;
	}

	function scrollCarousel(direction) {
		track.scrollBy({
			left: getScrollAmount() * direction,
			behavior: 'smooth'
		});
	}

	prevButton.addEventListener('click', () => scrollCarousel(-1));
	nextButton.addEventListener('click', () => scrollCarousel(1));
	track.addEventListener('scroll', updateButtons, { passive: true });
	window.addEventListener('resize', updateButtons);

	updateButtons();
})();
