(function () {
	const grid = document.querySelector('[data-directory-grid]');
	const filterButtons = [...document.querySelectorAll('[data-filter]')];
	const DATA_URL = './api/legacy_itens.php?cat=onde-ficar';
	const CATEGORY_ORDER = ['pousada', 'camping'];
	const ICONS = {
		wifi: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M320 160C229.1 160 146.8 196 86.3 254.6C73.6 266.9 53.3 266.6 41.1 253.9C28.9 241.2 29.1 220.9 41.8 208.7C113.7 138.9 211.9 96 320 96C428.1 96 526.3 138.9 598.3 208.7C611 221 611.3 241.3 599 253.9C586.7 266.5 566.4 266.9 553.8 254.6C493.2 196 410.9 160 320 160zM272 496C272 469.5 293.5 448 320 448C346.5 448 368 469.5 368 496C368 522.5 346.5 544 320 544C293.5 544 272 522.5 272 496zM200 390.2C188.3 403.5 168.1 404.7 154.8 393C141.5 381.3 140.3 361.1 152 347.8C193 301.4 253.1 272 320 272C386.9 272 447 301.4 488 347.8C499.7 361.1 498.4 381.3 485.2 393C472 404.7 451.7 403.4 440 390.2C410.6 356.9 367.8 336 320 336C272.2 336 229.4 356.9 200 390.2z"/>
			</svg>
		`,
		coffee: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M184 48C170.7 48 160 58.7 160 72C160 110.9 183.4 131.4 199.1 145.1L200.2 146.1C216.5 160.4 224 167.9 224 184C224 197.3 234.7 208 248 208C261.3 208 272 197.3 272 184C272 145.1 248.6 124.6 232.9 110.9L231.8 109.9C215.5 95.7 208 88.1 208 72C208 58.7 197.3 48 184 48zM128 256C110.3 256 96 270.3 96 288L96 480C96 533 139 576 192 576L384 576C425.8 576 461.4 549.3 474.5 512L480 512C550.7 512 608 454.7 608 384C608 313.3 550.7 256 480 256L128 256zM480 448L480 320C515.3 320 544 348.7 544 384C544 419.3 515.3 448 480 448zM320 72C320 58.7 309.3 48 296 48C282.7 48 272 58.7 272 72C272 110.9 295.4 131.4 311.1 145.1L312.2 146.1C328.5 160.4 336 167.9 336 184C336 197.3 346.7 208 360 208C373.3 208 384 197.3 384 184C384 145.1 360.6 124.6 344.9 110.9L343.8 109.9C327.5 95.7 320 88.1 320 72z"/>
			</svg>
		`,
		car: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM288 320L336 320C353.7 320 368 305.7 368 288C368 270.3 353.7 256 336 256L288 256L288 320zM336 384L288 384L288 416C288 433.7 273.7 448 256 448C238.3 448 224 433.7 224 416L224 232C224 209.9 241.9 192 264 192L336 192C389 192 432 235 432 288C432 341 389 384 336 384z"/>
			</svg>
		`,
		bed: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M64 96C81.7 96 96 110.3 96 128L96 352L320 352L320 224C320 206.3 334.3 192 352 192L512 192C565 192 608 235 608 288L608 512C608 529.7 593.7 544 576 544C558.3 544 544 529.7 544 512L544 448L96 448L96 512C96 529.7 81.7 544 64 544C46.3 544 32 529.7 32 512L32 128C32 110.3 46.3 96 64 96zM144 256C144 220.7 172.7 192 208 192C243.3 192 272 220.7 272 256C272 291.3 243.3 320 208 320C172.7 320 144 291.3 144 256z"/>
			</svg>
		`,
		tree: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M320 32C327 32 333.7 35.1 338.3 40.5L474.3 200.5C480.4 207.6 481.7 217.6 477.8 226.1C473.9 234.6 465.4 240 456 240L431.1 240L506.3 328.5C512.4 335.6 513.7 345.6 509.8 354.1C505.9 362.6 497.4 368 488 368L449.5 368L538.3 472.5C544.4 479.6 545.7 489.6 541.8 498.1C537.9 506.6 529.4 512 520 512L352 512L352 576C352 593.7 337.7 608 320 608C302.3 608 288 593.7 288 576L288 512L120 512C110.6 512 102.1 506.6 98.2 498.1C94.3 489.6 95.6 479.6 101.7 472.5L190.5 368L152 368C142.6 368 134.1 362.6 130.2 354.1C126.3 345.6 127.6 335.6 133.7 328.5L208.9 240L184 240C174.6 240 166.1 234.6 162.2 226.1C158.3 217.6 159.6 207.6 165.7 200.5L301.7 40.5C306.3 35.1 313 32 320 32z"/>
			</svg>
		`,
		fire: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M90.9 270.9L67.7 508.9C65.8 527.7 80.6 544 99.5 544L272.2 544C298.7 544 320.2 522.5 320.2 496L320.2 367C320.2 358.7 326.9 352 335.2 352C340.7 352 345.8 355 348.4 359.9L434.5 518.9C442.9 534.4 459.1 544 476.7 544L540.8 544C559.7 544 574.5 527.7 572.6 508.9L549.6 271.1C547.7 251.5 536.8 233.8 520.1 223.3L344.9 112.3C329.2 102.3 309.1 102.4 293.4 112.4L120.1 223.2C103.6 233.8 92.8 251.4 90.9 270.9z"/>
			</svg>
		`,
		mountain: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false">
				<path d="M320.5 64C335.2 64 348.7 72.1 355.7 85L571.7 485C578.4 497.4 578.1 512.4 570.9 524.5C563.7 536.6 550.6 544 536.6 544L104.6 544C90.5 544 77.5 536.6 70.3 524.5C63.1 512.4 62.8 497.4 69.5 485L285.5 85L288.4 80.4C295.7 70.2 307.6 64 320.5 64zM234.4 313.9L261.2 340.7C267.4 346.9 277.6 346.9 283.8 340.7L327.1 297.4C333.1 291.4 341.2 288 349.7 288L392.5 288L320.4 154.5L234.3 313.9z"/>
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
		`,
	};
	let staysByCategory = {};

	if (!grid || !filterButtons.length) return;

	function renderStatus(message) {
		const status = document.createElement('p');
		status.className = 'directory-grid__status';
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
		const text = document.createElement('span');
		text.className = 'directory-card__link-text';
		text.textContent = label;

		if (leadingIcon) {
			const main = document.createElement('span');
			main.className = 'directory-card__link-main';
			main.append(createIcon(leadingIcon, 'directory-card__icon directory-card__icon--leading'), text);
			link.appendChild(main);
		} else {
			link.appendChild(text);
		}

		if (trailingIcon) {
			link.appendChild(createIcon(trailingIcon, 'directory-card__icon directory-card__icon--trailing'));
		}
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

	function slugify(text) {
		return text
			.toString()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '');
	}

	function createStayCard(stay) {
		const card = document.createElement('article');
		card.className = 'directory-card';
		card.setAttribute('role', 'listitem');

		const detailUrl = `./detalhe.php?type=onde-ficar&id=${slugify(stay.title)}`;

		const title = document.createElement('h3');
		title.className = 'directory-card__title';

		const titleLink = document.createElement('a');
		titleLink.className = 'directory-card__title-link';
		titleLink.href = detailUrl;
		titleLink.textContent = stay.title;
		title.appendChild(titleLink);

		const image = createCardImage(stay.image, stay.title);
		let imageElement = null;

		if (image) {
			const imageLink = document.createElement('a');
			imageLink.className = 'directory-card__image-link';
			imageLink.href = detailUrl;
			imageLink.appendChild(image);
			imageElement = imageLink;
		}

		const description = document.createElement('p');
		description.className = 'directory-card__description';
		description.textContent = stay.description || '';

		const amenities = document.createElement('ul');
		amenities.className = 'stay-card__amenities';

		const stayAmenities = Array.isArray(stay.amenities) ? stay.amenities : [];
		stayAmenities.forEach((amenity) => {
			amenities.appendChild(createAmenityItem(amenity));
		});

		const footer = document.createElement('div');
		footer.className = 'directory-card__footer';

		const divider = document.createElement('hr');
		divider.className = 'directory-card__divider';

		const location = createExternalLink(
			'directory-card__link',
			'',
			stay.location?.url || '#',
			`Abrir localização de ${stay.title} no Google Maps`,
		);
		appendLinkContent(location, stay.location?.label || 'Ver localização', {
			leadingIcon: 'location',
			trailingIcon: 'external',
		});

		const social = createExternalLink(
			'directory-card__social',
			stay.social?.label || 'Instagram',
			stay.social?.url || '#',
			`Abrir rede social de ${stay.title}`,
		);

		const cta = document.createElement('a');
		cta.className = 'directory-card__cta';
		cta.href = detailUrl;
		appendLinkContent(cta, 'Ver mais detalhes →');

		footer.append(divider, location, social, cta);
		card.append(title, ...(imageElement ? [imageElement] : []), description, amenities, footer);

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
			renderStatus('Não foi possível carregar as hospedagens no momento. Tente novamente em instantes.');
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
