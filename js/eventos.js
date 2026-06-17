(function () {
	const grid = document.querySelector('[data-events-grid]');
	const DATA_URL = '../json/eventos.json';

	if (!grid) return;

	function renderStatus(message) {
		const status = document.createElement('p');
		status.className = 'directory-grid__status';
		status.style.color = '#777';
		status.style.padding = '20px';
		status.textContent = message;
		grid.replaceChildren(status);
	}

	function createEventCard(event) {
		const card = document.createElement('a');
		card.className = 'calendar-grid__event-card';
		card.href = `./evento.html?id=${event.id}`;
		card.style.backgroundImage = `linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.2) 100%), url('..${event.image}')`;
		card.style.backgroundSize = 'cover';
		card.style.backgroundPosition = 'center';
		card.style.textDecoration = 'none';

		const wrapper = document.createElement('div');
		wrapper.className = 'event-card__content-wrapper';

		const title = document.createElement('h3');
		title.className = 'event-card__event-title';
		title.textContent = event.title;

		const localSpan = document.createElement('span');
		localSpan.className = 'event-card__event-local';
		localSpan.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="event-card__local-icon">
				<path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/>
			</svg>
			<span class="event-card__text">${event.local}</span>
		`;

		const dateSpan = document.createElement('span');
		dateSpan.className = 'event-card__event-date';
		dateSpan.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="event-card__date-icon">
				<path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z"/>
			</svg>
			<span class="event-card__text">${event.date}</span>
		`;

		wrapper.append(title, localSpan, dateSpan);
		card.append(wrapper);
		return card;
	}

	function renderEvents(events) {
		grid.setAttribute('aria-busy', 'false');
		if (!events.length) {
			renderStatus('Nenhum evento programado para os próximos dias.');
			return;
		}

		const fragment = document.createDocumentFragment();
		events.forEach((event) => {
			fragment.appendChild(createEventCard(event));
		});

		grid.replaceChildren(fragment);
	}

	async function loadEvents() {
		renderStatus('Carregando eventos...');

		try {
			const response = await fetch(DATA_URL);
			if (!response.ok) {
				throw new Error(`Falha ao carregar JSON (${response.status})`);
			}

			const data = await response.json();
			const events = Array.isArray(data) ? data : [];
			renderEvents(events);
		} catch (error) {
			grid.setAttribute('aria-busy', 'false');
			renderStatus('Não foi possível carregar os eventos no momento.');
			console.error(error);
		}
	}

	loadEvents();
})();
