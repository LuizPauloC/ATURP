document.documentElement.classList.add('is-loading');

document.addEventListener('click', (event) => {
	const trigger = event.target.closest('[data-scroll]');
	if (!trigger) return;

	const sel = trigger.dataset.scroll;
	if (!sel) return;

	const target =
		sel.startsWith('#') || sel.startsWith('.')
			? document.querySelector(sel)
			: document.getElementById(sel) || document.querySelector(sel);

	if (!target) return;

	event.preventDefault();
	target.scrollIntoView({ behavior: 'smooth', block: 'start' });

	if (sel.startsWith('#')) {
		window.history.replaceState(null, '', sel);
	}
});

document.addEventListener('DOMContentLoaded', () => {
	document.body.classList.add('is-ready');
	window.requestAnimationFrame(() => {
		document.documentElement.classList.remove('is-loading');
	});
});
