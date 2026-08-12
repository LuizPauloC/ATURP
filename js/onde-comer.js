(function () {
	const grid = document.querySelector('[data-directory-grid]');
	const mealButtons = [...document.querySelectorAll('[data-meal-filter]')];
	const typeButtons = [...document.querySelectorAll('[data-type-filter]')];
	const DATA_URL = './api/legacy_itens.php?cat=onde-comer';
	const ICONS = {
		cutlery: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M272 208C272 155 229 112 176 112C123 112 80 155 80 208C80 261 123 304 176 304C229 304 272 261 272 208zM316.4 240C301.9 304.1 244.5 352 176 352C96.5 352 32 287.5 32 208C32 128.5 96.5 64 176 64C244.5 64 301.9 111.9 316.4 176L388.2 176C397 166.2 409.8 160 424 160L528 160C554.5 160 576 181.5 576 208C576 234.5 554.5 256 528 256L424 256C409.8 256 397 249.8 388.2 240L316.4 240zM176 144C211.3 144 240 172.7 240 208C240 243.3 211.3 272 176 272C140.7 272 112 243.3 112 208C112 172.7 140.7 144 176 144zM432 304C445.3 304 456 314.7 456 328L456 336L552 336C565.3 336 576 346.7 576 360C576 373.3 565.3 384 552 384L312 384C298.7 384 288 373.3 288 360C288 346.7 298.7 336 312 336L408 336L408 328C408 314.7 418.7 304 432 304zM320 528L320 416L544 416L544 528C544 554.5 522.5 576 496 576L368 576C341.5 576 320 554.5 320 528zM80 384L208 384C234.5 384 256 405.5 256 432C256 458.5 234.5 480 208 480L192 480C192 497.7 177.7 512 160 512L96 512C78.3 512 64 497.7 64 480L64 400C64 391.2 71.2 384 80 384zM208 448C216.8 448 224 440.8 224 432C224 423.2 216.8 416 208 416L192 416L192 448L208 448zM56 528L232 528C245.3 528 256 538.7 256 552C256 565.3 245.3 576 232 576L56 576C42.7 576 32 565.3 32 552C32 538.7 42.7 528 56 528z"/>
			</svg>
		`,
		clock: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/>
			</svg>
		`,
		whatsapp: `
			<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
				<path d="M8.38028 8.85335C9.07627 10.303 10.0251 11.6616 11.2266 12.8632C12.4282 14.0648 13.7869 15.0136 15.2365 15.7096C15.3612 15.7694 15.4235 15.7994 15.5024 15.8224C15.7828 15.9041 16.127 15.8454 16.3644 15.6754C16.4313 15.6275 16.4884 15.5704 16.6027 15.4561C16.9523 15.1064 17.1271 14.9316 17.3029 14.8174C17.9658 14.3864 18.8204 14.3864 19.4833 14.8174C19.6591 14.9316 19.8339 15.1064 20.1835 15.4561L20.3783 15.6509C20.9098 16.1824 21.1755 16.4481 21.3198 16.7335C21.6069 17.301 21.6069 17.9713 21.3198 18.5389C21.1755 18.8242 20.9098 19.09 20.3783 19.6214L20.2207 19.779C19.6911 20.3087 19.4263 20.5735 19.0662 20.7757C18.6667 21.0001 18.0462 21.1615 17.588 21.1601C17.1751 21.1589 16.8928 21.0788 16.3284 20.9186C13.295 20.0576 10.4326 18.4332 8.04466 16.0452C5.65668 13.6572 4.03221 10.7948 3.17124 7.76144C3.01103 7.19699 2.93092 6.91477 2.9297 6.50182C2.92833 6.0436 3.08969 5.42311 3.31411 5.0236C3.51636 4.66357 3.78117 4.39876 4.3108 3.86913L4.46843 3.7115C4.99987 3.18006 5.2656 2.91433 5.55098 2.76999C6.11854 2.48292 6.7888 2.48292 7.35636 2.76999C7.64174 2.91433 7.90747 3.18006 8.43891 3.7115L8.63378 3.90637C8.98338 4.25597 9.15819 4.43078 9.27247 4.60655C9.70347 5.26945 9.70347 6.12403 9.27247 6.78692C9.15819 6.96269 8.98338 7.1375 8.63378 7.4871C8.51947 7.60142 8.46231 7.65857 8.41447 7.72538C8.24446 7.96281 8.18576 8.30707 8.26748 8.58743C8.29048 8.66632 8.32041 8.72866 8.38028 8.85335Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		`,
		location: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/>
			</svg>
		`,
		external: `
			<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
				<path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22M2.50002 9H21.5M2.5 15H21.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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

	function createCardImage(imagePath, title) {
		if (!imagePath) return null;

		const image = document.createElement('img');
		image.className = 'directory-card__image';
		image.src = imagePath;
		image.setAttribute('alt', title);
		image.decoding = 'async';
		return image;
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

	function slugify(text) {
		return text.toString().toLowerCase()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '');
	}

	function createFoodCard(place) {
		const card = document.createElement('article');
		card.className = 'directory-card';
		card.setAttribute('role', 'listitem');

		const title = document.createElement('h3');
		title.className = 'directory-card__title';
		
		const titleLink = document.createElement('a');
		titleLink.className = 'directory-card__title-link';
		titleLink.href = `./detalhe.php?type=onde-comer&id=${slugify(place.title)}`;
		titleLink.textContent = place.title;
		title.appendChild(titleLink);

		const image = createCardImage(place.image, place.title);
		let imageElement = null;
		if (image) {
			const imageLink = document.createElement('a');
			imageLink.className = 'directory-card__image-link';
			imageLink.href = `./detalhe.php?type=onde-comer&id=${slugify(place.title)}`;
			imageLink.appendChild(image);
			imageElement = imageLink;
		}

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

		const social = createExternalLink(
			'directory-card__social',
			place.social.label,
			place.social.url,
			`Abrir rede social de ${place.title}`
		);

		const cta = document.createElement('a');
		cta.className = 'directory-card__cta';
		cta.href = `./detalhe.php?type=onde-comer&id=${slugify(place.title)}`;
		appendLinkContent(cta, 'Ver mais detalhes →');

		footer.append(divider, location, social, cta);
		card.append(title, ...(imageElement ? [imageElement] : []), specialty, description, hours, footer);
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
			renderStatus('Não foi possível carregar os estabelecimentos no momento. Tente novamente em instantes.');
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
