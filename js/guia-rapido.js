(function () {
	const accordionGroup = document.querySelector('.quick-guide__accordion-group');
	const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	const DURATION = 280;
	const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
	let isTransitioning = false;

	if (!accordionGroup) return;

	const accordions = [...accordionGroup.querySelectorAll('.quick-guide__accordion')].filter((accordion) => {
		return (
			accordion.querySelector('.quick-guide__accordion-summary') &&
			accordion.querySelector('.quick-guide__accordion-content')
		);
	});

	if (!accordions.length) return;

	function getParts(accordion) {
		const summary = accordion.querySelector('.quick-guide__accordion-summary');
		const content = accordion.querySelector('.quick-guide__accordion-content');

		if (!summary || !content) return null;
		return { summary, content };
	}

	function syncSummaryState(accordion, isExpanded = accordion.classList.contains('is-expanded')) {
		const parts = getParts(accordion);
		if (!parts) return;
		parts.summary.setAttribute('aria-expanded', String(isExpanded));
	}

	function setExpandedState(accordion, isExpanded) {
		accordion.classList.toggle('is-expanded', isExpanded);
		syncSummaryState(accordion, isExpanded);
	}

	function clearInlineStyles(accordion, content) {
		accordion.style.height = '';
		accordion.style.transition = '';
		content.style.opacity = '';
		content.style.transform = '';
		content.style.transition = '';
		accordion.classList.remove('is-animating');
	}

	function finalizeAnimation(accordion, content, shouldOpen) {
		if (!shouldOpen) {
			accordion.open = false;
		}

		clearInlineStyles(accordion, content);
		setExpandedState(accordion, shouldOpen);
	}

	function waitForHeightTransition(accordion, content, shouldOpen) {
		return new Promise((resolve) => {
			let settled = false;

			function finish() {
				if (settled) return;
				settled = true;
				window.clearTimeout(timeoutId);
				accordion.removeEventListener('transitionend', onTransitionEnd);
				finalizeAnimation(accordion, content, shouldOpen);
				resolve();
			}

			function onTransitionEnd(event) {
				if (event.target !== accordion || event.propertyName !== 'height') return;
				finish();
			}

			const timeoutId = window.setTimeout(finish, DURATION + 120);
			accordion.addEventListener('transitionend', onTransitionEnd);
		});
	}

	function primeAnimation(accordion, content) {
		accordion.classList.add('is-animating');
		accordion.style.transition = `height ${DURATION}ms ${EASING}`;
		content.style.transition = `opacity ${DURATION}ms ease, transform ${DURATION}ms ${EASING}`;
	}

	function runHeightFrame(changes) {
		window.requestAnimationFrame(() => {
			changes.forEach(({ accordion, content, height, opacity, transform }) => {
				accordion.style.height = `${height}px`;
				content.style.opacity = opacity;
				content.style.transform = transform;
			});
		});
	}

	function openAccordion(accordion) {
		const parts = getParts(accordion);
		if (!parts) return Promise.resolve();

		const { summary, content } = parts;

		if (accordion.open) {
			setExpandedState(accordion, true);
			return Promise.resolve();
		}

		if (motionQuery.matches) {
			accordion.open = true;
			setExpandedState(accordion, true);
			return Promise.resolve();
		}

		const closedHeight = summary.offsetHeight;

		primeAnimation(accordion, content);
		accordion.style.height = `${closedHeight}px`;
		accordion.open = true;
		setExpandedState(accordion, true);

		content.style.opacity = '0';
		content.style.transform = 'translateY(-0.35rem)';

		const expandedHeight = accordion.scrollHeight;

		accordion.offsetHeight;

		runHeightFrame([
			{
				accordion,
				content,
				height: expandedHeight,
				opacity: '1',
				transform: 'translateY(0)',
			},
		]);

		return waitForHeightTransition(accordion, content, true);
	}

	function closeAccordion(accordion) {
		const parts = getParts(accordion);
		if (!parts) return Promise.resolve();

		const { summary, content } = parts;

		if (!accordion.open) {
			setExpandedState(accordion, false);
			return Promise.resolve();
		}

		if (motionQuery.matches) {
			accordion.open = false;
			setExpandedState(accordion, false);
			return Promise.resolve();
		}

		const openHeight = accordion.scrollHeight;
		const collapsedHeight = summary.offsetHeight;

		primeAnimation(accordion, content);
		accordion.style.height = `${openHeight}px`;
		content.style.opacity = '1';
		content.style.transform = 'translateY(0)';
		setExpandedState(accordion, false);

		accordion.offsetHeight;

		runHeightFrame([
			{
				accordion,
				content,
				height: collapsedHeight,
				opacity: '0',
				transform: 'translateY(-0.35rem)',
			},
		]);

		return waitForHeightTransition(accordion, content, false);
	}

	async function swapAccordions(currentAccordion, nextAccordion) {
		const currentParts = getParts(currentAccordion);
		const nextParts = getParts(nextAccordion);

		if (!currentParts || !nextParts) return;

		if (motionQuery.matches) {
			nextAccordion.open = true;
			setExpandedState(nextAccordion, true);
			currentAccordion.open = false;
			setExpandedState(currentAccordion, false);
			return;
		}

		const currentOpenHeight = currentAccordion.scrollHeight;
		const currentCollapsedHeight = currentParts.summary.offsetHeight;
		const nextCollapsedHeight = nextParts.summary.offsetHeight;

		primeAnimation(currentAccordion, currentParts.content);
		currentAccordion.style.height = `${currentOpenHeight}px`;
		currentParts.content.style.opacity = '1';
		currentParts.content.style.transform = 'translateY(0)';
		setExpandedState(currentAccordion, false);

		primeAnimation(nextAccordion, nextParts.content);
		nextAccordion.style.height = `${nextCollapsedHeight}px`;
		nextParts.content.style.opacity = '0';
		nextParts.content.style.transform = 'translateY(-0.35rem)';

		// Keep both details measurable so collapse and expansion can start together.
		nextAccordion.open = true;
		setExpandedState(nextAccordion, true);
		const nextExpandedHeight = nextAccordion.scrollHeight;

		currentAccordion.offsetHeight;
		nextAccordion.offsetHeight;

		runHeightFrame([
			{
				accordion: currentAccordion,
				content: currentParts.content,
				height: currentCollapsedHeight,
				opacity: '0',
				transform: 'translateY(-0.35rem)',
			},
			{
				accordion: nextAccordion,
				content: nextParts.content,
				height: nextExpandedHeight,
				opacity: '1',
				transform: 'translateY(0)',
			},
		]);

		await Promise.all([
			waitForHeightTransition(currentAccordion, currentParts.content, false),
			waitForHeightTransition(nextAccordion, nextParts.content, true),
		]);
	}

	function normalizeAccordions() {
		accordions.forEach((accordion, index) => {
			const parts = getParts(accordion);
			if (!parts) return;

			const shouldOpen = index === 0;
			accordion.open = shouldOpen;
			clearInlineStyles(accordion, parts.content);
			setExpandedState(accordion, shouldOpen);
		});
	}

	async function toggleAccordion(targetAccordion) {
		if (isTransitioning) return;
		isTransitioning = true;

		try {
			if (targetAccordion.open) {
				await closeAccordion(targetAccordion);
				return;
			}

			const currentOpenAccordion = accordions.find(
				(accordion) => accordion !== targetAccordion && accordion.open
			);

			if (currentOpenAccordion) {
				await swapAccordions(currentOpenAccordion, targetAccordion);
				return;
			}

			await openAccordion(targetAccordion);
		} finally {
			isTransitioning = false;
		}
	}

	normalizeAccordions();

	accordions.forEach((accordion) => {
		const parts = getParts(accordion);
		if (!parts) return;

		parts.summary.addEventListener('click', (event) => {
			event.preventDefault();
			toggleAccordion(accordion);
		});
	});
})();
