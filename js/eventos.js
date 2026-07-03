(function () {
	const grid = document.querySelector('[data-events-grid]');
	const DATA_URL = './api/public_eventos.php';

	if (!grid) return;

	function renderStatus(message) {
		const status = document.createElement('p');
		status.className = 'directory-grid__status';
		status.style.color = '#777';
		status.style.padding = '20px';
		status.textContent = message;
		grid.replaceChildren(status);
	}

	function normalizeImageUrl(imagePath) {
		if (!imagePath) return './assets/placeholders/eventos.jpeg';
		let normalized = String(imagePath).trim();
		if (/^[a-z][a-z0-9+.-]*:/i.test(normalized) || normalized.startsWith('//')) {
			try {
				const url = new URL(normalized, window.location.href);
				if (url.origin !== window.location.origin) return './assets/placeholders/eventos.jpeg';
				normalized = decodeURIComponent(url.pathname);
			} catch {
				return './assets/placeholders/eventos.jpeg';
			}
		} else {
			try {
				normalized = decodeURIComponent(normalized);
			} catch {
				return './assets/placeholders/eventos.jpeg';
			}
		}

		normalized = normalized.replace(/^\.?\//, '').replace(/^\/+/, '');
		const segments = normalized.split('/');
		const hasUnsafeSegment = segments.some((segment) => !segment || segment === '.' || segment === '..');
		if (
			!hasUnsafeSegment &&
			!/[\x00-\x1F\x7F<>"'`\\]/.test(normalized) &&
			/^(uploads|assets)\/.+\.(jpe?g|png|webp|gif)$/i.test(normalized)
		) {
			return `./${normalized}`;
		}
		return './assets/placeholders/eventos.jpeg';
	}

	function createEventCard(event) {
		const card = document.createElement('a');
		card.className = 'calendar-grid__event-card';
		card.href = `./detalhe.php?type=evento&id=${encodeURIComponent(event.id || '')}`;
		card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,.6), rgba(0,0,0,.2)), url('${normalizeImageUrl(event.image)}')`;
		card.style.backgroundSize = 'cover';
		card.style.backgroundPosition = 'center';
		card.style.textDecoration = 'none';

		const wrapper = document.createElement('div');
		wrapper.className = 'event-card__content-wrapper';

		const title = document.createElement('h3');
		title.className = 'event-card__event-title';
		title.textContent = event.title || 'Evento';

		const local = document.createElement('span');
		local.className = 'event-card__event-local';
		const localText = document.createElement('span');
		localText.className = 'event-card__text';
		localText.textContent = event.local || 'Local a definir';
		local.appendChild(localText);

		const date = document.createElement('span');
		date.className = 'event-card__event-date';
		const dateText = document.createElement('span');
		dateText.className = 'event-card__text';
		dateText.textContent = event.date || 'A definir';
		date.appendChild(dateText);

		wrapper.append(title, local, date);
		card.appendChild(wrapper);

		return card;
	}

	async function loadEvents() {
		renderStatus('Carregando eventos...');

		try {
			const response = await fetch(DATA_URL);
			if (!response.ok) throw new Error(`Falha ao carregar eventos (${response.status})`);

			const data = await response.json();
			renderEvents(Array.isArray(data) ? data : []);
		} catch (error) {
			grid.setAttribute('aria-busy', 'false');
			renderStatus('Não foi possível carregar os eventos no momento.');
			console.error(error);
		}
	}

	function renderEvents(events) {
		grid.setAttribute('aria-busy', 'false');

		if (!events.length) {
			renderStatus('Nenhum evento programado para os próximos dias.');
			return;
		}

		const fragment = document.createDocumentFragment();
		events.forEach((event) => fragment.appendChild(createEventCard(event)));
		grid.replaceChildren(fragment);
	}

	loadEvents();
})();
