document.documentElement.classList.add('is-loading');

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Smooth scroll for [data-scroll] elements
document.addEventListener('click', (e) => {
	const btn = e.target.closest('[data-scroll]');
	if (!btn) return;
	e.preventDefault();
	const sel = btn.dataset.scroll;
	if (!sel) return;
	const target =
		sel.startsWith('#') || sel.startsWith('.')
			? document.querySelector(sel)
			: document.getElementById(sel) || document.querySelector(sel);
	if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// show page after full load
window.addEventListener('load', () => {
	document.documentElement.classList.remove('is-loading');
	document.documentElement.classList.add('is-loaded');
	setTimeout(() => {
		document.body.classList.add('is-ready')
		const event = new CustomEvent('app-ready');
		window.dispatchEvent(event);
	}, 20);
});