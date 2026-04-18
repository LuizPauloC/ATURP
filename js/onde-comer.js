(function () {
	const grid = document.querySelector('[data-directory-grid]');
	const mealButtons = [...document.querySelectorAll('[data-meal-filter]')];
	const typeButtons = [...document.querySelectorAll('[data-type-filter]')];
	const DATA_URL = '../json/onde-comer.json';
	const ICONS = {
		cutlery: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
				<path d="M63.9 14.4C63.1 6.2 56.2 0 48 0S32.9 6.2 32 14.3L17.9 149.7c-1.3 6-1.9 12.1-1.9 18.2 0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7 0-6.1-.6-12.2-1.9-18.2L223.9 14.3C223.1 6.2 216.2 0 208 0s-15.1 6.2-15.9 14.4l-13.6 135.5c-.6 5.7-5.4 10.1-11.1 10.1-5.8 0-10.6-4.4-11.2-10.2L143.9 14.6C143.2 6.3 136.3 0 128 0s-15.2 6.3-15.9 14.6L99.8 149.8c-.5 5.8-5.4 10.2-11.2 10.2-5.8 0-10.6-4.4-11.1-10.1L63.9 14.4zM448 0c-16 0-128 32-128 176v112c0 35.3 28.7 64 64 64h32v128c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32z"/>
			</svg>
		`,
		clock: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
				<path d="M256 48a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm0 464A256 256 0 1 1 256 0a256 256 0 1 1 0 512zM232 128c0-13.3 10.7-24 24-24s24 10.7 24 24v103l71 47.4c11 7.4 14 22.3 6.7 33.3-7.4 11-22.3 14-33.3 6.7l-81.7-54.5A24 24 0 0 1 232 244V128z"/>
			</svg>
		`,
		whatsapp: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">
				<path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z"/>
			</svg>
		`,
		location: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">
				<path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/>
			</svg>
		`,
		external: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">
				<path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z"/>
			</svg>
		`
	};
	const activeFilters = {
		meal: 'all',
		type: 'all'
	};
	let places = [];

	if (!grid || !mealButtons.length || !typeButtons.length) return;

	function renderStatus(message) {
		const status = document.createElement('p');
		status.className = 'directory-grid__status';
		status.textContent = message;
		grid.replaceChildren(status);
	}

	function setActiveButtons(buttons, datasetKey, value) {
		buttons.forEach((button) => {
			const isActive = button.dataset[datasetKey] === value;
			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-pressed', String(isActive));
		});
	}

	function createExternalLink(className, label, href, ariaLabel) {
		const link = document.createElement('a');
		link.className = className;
		link.href = href;
		link.target = '_blank';
		link.rel = 'noreferrer';
		link.textContent = label;
		link.setAttribute('aria-label', ariaLabel);
		return link;
	}

	function createIcon(iconName, className) {
		const icon = document.createElement('span');
		icon.className = className;
		icon.setAttribute('aria-hidden', 'true');
		icon.innerHTML = ICONS[iconName];
		return icon;
	}

	function appendLinkContent(link, label, options = {}) {
		const { leadingIcon, trailingIcon } = options;
		const text = document.createElement('span');
		text.className = 'directory-card__link-text';
		text.textContent = label;

		if (leadingIcon) {
			const main = document.createElement('span');
			main.className = 'directory-card__link-main';
			main.append(
				createIcon(leadingIcon, 'directory-card__icon directory-card__icon--leading'),
				text
			);
			link.appendChild(main);
		} else {
			link.appendChild(text);
		}

		if (trailingIcon) {
			link.appendChild(createIcon(trailingIcon, 'directory-card__icon directory-card__icon--trailing'));
		}
	}

	function createHourItem(hour) {
		const row = document.createElement('div');
		row.className = 'food-card__hour';

		const icon = createIcon('clock', 'food-card__hour-icon');
		const text = document.createElement('span');
		text.className = 'food-card__hour-text';

		const line = document.createElement('span');
		line.textContent = `${hour.label}: ${hour.value}`;

		text.appendChild(line);
		row.append(icon, text);
		return row;
	}

	function getVisiblePlaces() {
		return places.filter((place) => {
			const matchesMeal =
				activeFilters.meal === 'all' || place.mealMoments.includes(activeFilters.meal);
			const matchesType =
				activeFilters.type === 'all' || place.establishmentTypes.includes(activeFilters.type);

			return matchesMeal && matchesType;
		});
	}

	function createFoodCard(place) {
		const card = document.createElement('article');
		card.className = 'directory-card';
		card.setAttribute('role', 'listitem');

		const title = document.createElement('h3');
		title.className = 'directory-card__title';
		title.textContent = place.title;

		const specialty = document.createElement('p');
		specialty.className = 'food-card__specialty';
		specialty.append(
			createIcon('cutlery', 'food-card__specialty-icon'),
			document.createTextNode(place.specialty)
		);

		const description = document.createElement('p');
		description.className = 'directory-card__description';
		description.textContent = place.description;

		const hours = document.createElement('div');
		hours.className = 'food-card__hours';
		place.hours.forEach((hour) => {
			hours.appendChild(createHourItem(hour));
		});

		const footer = document.createElement('div');
		footer.className = 'directory-card__footer';

		const divider = document.createElement('hr');
		divider.className = 'directory-card__divider';

		const location = createExternalLink(
			'directory-card__link',
			'',
			place.location.url,
			`Abrir localização de ${place.title} no Google Maps`
		);
		appendLinkContent(location, place.location.label, { leadingIcon: 'location', trailingIcon: 'external' });

		const landmark = document.createElement('p');
		landmark.className = 'directory-card__landmark';
		landmark.textContent = place.landmark;

		const social = createExternalLink(
			'directory-card__social',
			place.social.label,
			place.social.url,
			`Abrir rede social de ${place.title}`
		);

		const cta = createExternalLink(
			'directory-card__cta',
			'',
			place.whatsapp,
			`Entrar em contato com ${place.title} pelo WhatsApp`
		);
		appendLinkContent(cta, 'Chamar no WhatsApp', { trailingIcon: 'whatsapp' });

		footer.append(divider, location, landmark, social, cta);
		card.append(title, specialty, description, hours, footer);
		return card;
	}

	function renderCards() {
		const visiblePlaces = getVisiblePlaces();
		grid.setAttribute('aria-busy', 'false');

		if (!visiblePlaces.length) {
			renderStatus('Nenhum estabelecimento encontrado para esta combinação de filtros.');
			return;
		}

		const fragment = document.createDocumentFragment();
		visiblePlaces.forEach((place) => {
			fragment.appendChild(createFoodCard(place));
		});

		grid.replaceChildren(fragment);
	}

	async function loadPlaces() {
		renderStatus('Carregando estabelecimentos...');

		try {
			const response = await fetch(DATA_URL);
			if (!response.ok) {
				throw new Error(`Falha ao carregar JSON (${response.status})`);
			}

			const data = await response.json();
			places = Array.isArray(data) ? data : Array.isArray(data.places) ? data.places : [];

			setActiveButtons(mealButtons, 'mealFilter', activeFilters.meal);
			setActiveButtons(typeButtons, 'typeFilter', activeFilters.type);
			renderCards();
		} catch (error) {
			grid.setAttribute('aria-busy', 'false');
			renderStatus('Não foi possível carregar os estabelecimentos. Verifique o arquivo JSON ou sirva o site por um servidor local.');
			console.error(error);
		}
	}

	mealButtons.forEach((button) => {
		button.addEventListener('click', () => {
			activeFilters.meal = button.dataset.mealFilter ?? 'all';
			setActiveButtons(mealButtons, 'mealFilter', activeFilters.meal);
			renderCards();
		});
	});

	typeButtons.forEach((button) => {
		button.addEventListener('click', () => {
			activeFilters.type = button.dataset.typeFilter ?? 'all';
			setActiveButtons(typeButtons, 'typeFilter', activeFilters.type);
			renderCards();
		});
	});

	loadPlaces();
})();
