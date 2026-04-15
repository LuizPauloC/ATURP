(function () {
	const grid = document.querySelector('[data-stays-grid]');
	const filterButtons = [...document.querySelectorAll('[data-filter]')];
	const DATA_URL = '../json/onde-ficar.json';
	const CATEGORY_ORDER = ['hotel', 'pousada', 'camping'];
	const ICONS = {
		wifi: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M2 8.82A15.91 15.91 0 0 1 12 5c3.85 0 7.38 1.36 10 3.64" />
				<path d="M5 12.86A10.94 10.94 0 0 1 12 10c2.73 0 5.23 1 7 2.67" />
				<path d="M8.5 16.4A5.97 5.97 0 0 1 12 15c1.36 0 2.61.46 3.6 1.23" />
				<path d="M12 19h.01" />
			</svg>
		`,
		coffee: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M10 2v2" />
				<path d="M14 2v2" />
				<path d="M16 8h1a4 4 0 1 1 0 8h-1" />
				<path d="M4 8h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" />
				<path d="M6 22h10" />
			</svg>
		`,
		car: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M14 16H9" />
				<path d="M15 5H9l-4 6v5h14v-5l-4-6Z" />
				<circle cx="7" cy="16" r="1" />
				<circle cx="17" cy="16" r="1" />
			</svg>
		`,
		bed: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M2 4v16" />
				<path d="M2 10h19a1 1 0 0 1 1 1v4H2Z" />
				<path d="M6 10V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3" />
				<path d="M22 20v-3" />
			</svg>
		`,
		tree: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="m12 13-2-2" />
				<path d="m12 13 2-2" />
				<path d="M12 21v-8" />
				<path d="M4 11a8 8 0 0 1 16 0" />
				<path d="M7 11a5 5 0 0 1 10 0" />
				<path d="M5 15h14" />
			</svg>
		`,
		fire: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M12 3s4 2.5 4 7a4 4 0 1 1-8 0c0-1.9.8-3.5 2-4.8" />
				<path d="M12 14c1.2.8 2 2.1 2 3.5a2 2 0 1 1-4 0c0-1 .4-1.9 1-2.6" />
			</svg>
		`,
		mountain: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="m8 3 4 6 5-3 4 15H3L8 3Z" />
				<path d="m11 12 1-3 2 3" />
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
	let staysByCategory = {};

	if (!grid || !filterButtons.length) return;

	function renderStatus(message) {
		const status = document.createElement('p');
		status.className = 'stays-grid__status';
		status.textContent = message;
		grid.replaceChildren(status);
	}

	function setActiveFilter(category) {
		filterButtons.forEach((button) => {
			const isActive = button.dataset.filter === category;
			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-pressed', String(isActive));
		});
	}

	function getVisibleStays(category) {
		if (category === 'all') {
			return CATEGORY_ORDER.flatMap((key) => staysByCategory[key] ?? []);
		}

		return staysByCategory[category] ?? [];
	}

	function createAmenityItem(amenity) {
		const item = document.createElement('li');
		item.className = 'stay-card__amenity';

		const icon = document.createElement('span');
		icon.className = 'stay-card__amenity-icon';
		icon.innerHTML = ICONS[amenity.icon] ?? ICONS.wifi;

		const label = document.createElement('span');
		label.textContent = amenity.label;

		item.append(icon, label);
		return item;
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

		if (leadingIcon) {
			link.appendChild(createIcon(leadingIcon, 'stay-card__inline-icon stay-card__inline-icon--leading'));
		}

		const text = document.createElement('span');
		text.className = 'stay-card__link-text';
		text.textContent = label;
		link.appendChild(text);

		if (trailingIcon) {
			link.appendChild(createIcon(trailingIcon, 'stay-card__inline-icon stay-card__inline-icon--trailing'));
		}
	}

	function createStayCard(stay) {
		const card = document.createElement('article');
		card.className = 'stay-card';
		card.setAttribute('role', 'listitem');

		const title = document.createElement('h3');
		title.className = 'stay-card__title';
		title.textContent = stay.title;

		const description = document.createElement('p');
		description.className = 'stay-card__description';
		description.textContent = stay.description;

		const amenities = document.createElement('ul');
		amenities.className = 'stay-card__amenities';
		stay.amenities.forEach((amenity) => {
			amenities.appendChild(createAmenityItem(amenity));
		});

		const footer = document.createElement('div');
		footer.className = 'stay-card__footer';

		const divider = document.createElement('hr');
		divider.className = 'stay-card__divider';

		const location = createExternalLink(
			'stay-card__link',
			'',
			stay.location.url,
			`Abrir localização de ${stay.title} no Google Maps`
		);
		appendLinkContent(location, stay.location.label, { leadingIcon: 'location', trailingIcon: 'external' });

		const landmark = document.createElement('p');
		landmark.className = 'stay-card__landmark';
		landmark.textContent = stay.landmark;

		const social = createExternalLink(
			'stay-card__social',
			stay.social.label,
			stay.social.url,
			`Abrir rede social de ${stay.title}`
		);

		const cta = createExternalLink(
			'stay-card__cta',
			'',
			stay.whatsapp,
			`Reservar ${stay.title} pelo WhatsApp`
		);
		appendLinkContent(cta, 'Reservar no WhatsApp', { trailingIcon: 'whatsapp' });

		footer.append(divider, location, landmark, social, cta);
		card.append(title, description, amenities, footer);
		return card;
	}

	function renderCards(category) {
		const stays = getVisibleStays(category);
		grid.setAttribute('aria-busy', 'false');

		if (!stays.length) {
			renderStatus('Nenhuma hospedagem encontrada para este filtro.');
			return;
		}

		const fragment = document.createDocumentFragment();
		stays.forEach((stay) => {
			fragment.appendChild(createStayCard(stay));
		});

		grid.replaceChildren(fragment);
	}

	async function loadStays() {
		renderStatus('Carregando hospedagens...');

		try {
			const response = await fetch(DATA_URL);
			if (!response.ok) {
				throw new Error(`Falha ao carregar JSON (${response.status})`);
			}

			const data = await response.json();
			staysByCategory = CATEGORY_ORDER.reduce((acc, key) => {
				acc[key] = Array.isArray(data[key]) ? data[key] : [];
				return acc;
			}, {});

			setActiveFilter('all');
			renderCards('all');
		} catch (error) {
			grid.setAttribute('aria-busy', 'false');
			renderStatus('Não foi possível carregar as hospedagens. Verifique o arquivo JSON ou sirva o site por um servidor local.');
			console.error(error);
		}
	}

	filterButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const category = button.dataset.filter ?? 'all';
			setActiveFilter(category);
			renderCards(category);
		});
	});

	loadStays();
})();
