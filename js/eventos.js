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
		if (!imagePath) return '';
		let normalized = String(imagePath).trim();
		if (/^[a-z][a-z0-9+.-]*:/i.test(normalized) || normalized.startsWith('//')) {
			try {
				const url = new URL(normalized, window.location.href);
				if (url.origin !== window.location.origin) return '';
				normalized = decodeURIComponent(url.pathname);
			} catch {
				return '';
			}
		} else {
			try {
				normalized = decodeURIComponent(normalized);
			} catch {
				return '';
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
		return '';
	}

	function createCardIcon(className, pathData) {
		const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		icon.setAttribute('viewBox', '0 0 640 640');
		icon.setAttribute('class', className);
		icon.setAttribute('aria-hidden', 'true');

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', pathData);
		icon.appendChild(path);

		return icon;
	}

	function createEventCard(event) {
		const card = document.createElement('a');
		card.className = 'calendar-grid__event-card';
		card.href = `./detalhe.php?type=evento&id=${encodeURIComponent(event.id || '')}`;
		const imageUrl = normalizeImageUrl(event.image);
		if (imageUrl) {
			card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,.6), rgba(0,0,0,.2)), url('${imageUrl}')`;
			card.style.backgroundSize = 'cover';
			card.style.backgroundPosition = 'center';
		}
		card.style.textDecoration = 'none';

		const wrapper = document.createElement('div');
		wrapper.className = 'event-card__content-wrapper';

		const title = document.createElement('h3');
		title.className = 'event-card__event-title';
		title.textContent = event.title || 'Evento';

		const local = document.createElement('span');
		local.className = 'event-card__event-local';
		const localIcon = createCardIcon(
			'event-card__local-icon',
			'M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z'
		);
		const localText = document.createElement('span');
		localText.className = 'event-card__text';
		localText.textContent = event.local || 'Local a definir';
		local.append(localIcon, localText);

		const date = document.createElement('span');
		date.className = 'event-card__event-date';
		const dateIcon = createCardIcon(
			'event-card__date-icon',
			'M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z'
		);
		const dateText = document.createElement('span');
		dateText.className = 'event-card__text';
		dateText.textContent = event.date || 'A definir';
		date.append(dateIcon, dateText);

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
