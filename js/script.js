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

// Faz a transição do loading para o conteúdo principal
document.addEventListener('DOMContentLoaded', () => {
	document.body.classList.add('is-ready');
	window.requestAnimationFrame(() => {
		document.documentElement.classList.remove('is-loading');
	});
});

// Deixa o header em cor sólida ao rolar a página
const header = document.querySelector('.site-header__nav');
const pixelsLimit = 200;

if (header) {
  const startsTransparent = document.body?.dataset.headerTransparent === 'true';

  const updateHeaderColor = () => {
    if (!startsTransparent || window.scrollY > pixelsLimit) {
      header.classList.add('solid-color');
    }
    else {
      header.classList.remove('solid-color');
    }
  };

  updateHeaderColor();
  window.addEventListener('scroll', updateHeaderColor);
}

// Atualiza o ano no rodapé
const yearElement = document.getElementById('current-year');
if (yearElement) {
  const currentYear = new Date().getFullYear();
  yearElement.textContent = currentYear;
}
