(function () {
	const container = document.querySelector('[data-detail-container]');
	
	const DATA_URLS = {
		'evento': './api/public_eventos.php',
		'onde-ficar': './api/legacy_itens.php?cat=onde-ficar',
		'onde-comer': './api/legacy_itens.php?cat=onde-comer',
		'servicos': './api/public_servicos.php',
		'experiencias': './api/legacy_itens.php?cat=experiencias'
};

	if (!container) return;

	// Configuração do Lightbox Modal
	let currentPhotos = [];
	let currentPhotoIndex = 0;

	const dialog = document.getElementById('lightbox-dialog');
	const dialogImg = dialog?.querySelector('.lightbox-dialog__image');
	const dialogCaption = dialog?.querySelector('.lightbox-dialog__caption');
	const closeBtn = dialog?.querySelector('.lightbox-dialog__close');
	const prevBtn = dialog?.querySelector('.lightbox-dialog__arrow--prev');
	const nextBtn = dialog?.querySelector('.lightbox-dialog__arrow--next');
	const backdropCloser = dialog?.querySelector('.lightbox-dialog__backdrop-closer');

	function updateLightboxImage() {
		if (!dialogImg || currentPhotos.length === 0) return;
		
		const src = currentPhotos[currentPhotoIndex];
		
		dialogImg.style.opacity = '0';
		setTimeout(() => {
			dialogImg.src = src;
			dialogImg.style.opacity = '1';
			
			if (dialogCaption) {
				dialogCaption.textContent = `Foto ${currentPhotoIndex + 1} de ${currentPhotos.length}`;
			}
		}, 100);

		if (prevBtn && nextBtn) {
			if (currentPhotos.length <= 1) {
				prevBtn.classList.add('is-hidden');
				nextBtn.classList.add('is-hidden');
			} else {
				prevBtn.classList.remove('is-hidden');
				nextBtn.classList.remove('is-hidden');
			}
		}
	}

	function showPrevPhoto() {
		if (currentPhotos.length <= 1) return;
		currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
		updateLightboxImage();
	}

	function showNextPhoto() {
		if (currentPhotos.length <= 1) return;
		currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
		updateLightboxImage();
	}

	function openLightbox(photosList, startIndex = 0) {
		if (!dialog) return;
		currentPhotos = photosList;
		currentPhotoIndex = startIndex;
		updateLightboxImage();
		dialog.showModal();
		document.body.style.overflow = 'hidden';
	}

	if (dialog) {
		closeBtn?.addEventListener('click', () => dialog.close());
		backdropCloser?.addEventListener('click', () => dialog.close());
		
		dialog.addEventListener('close', () => {
			document.body.style.overflow = '';
		});

		prevBtn?.addEventListener('click', (e) => {
			e.stopPropagation();
			showPrevPhoto();
		});

		nextBtn?.addEventListener('click', (e) => {
			e.stopPropagation();
			showNextPhoto();
		});

		window.addEventListener('keydown', (e) => {
			if (!dialog.open) return;
			if (e.key === 'ArrowLeft') {
				showPrevPhoto();
			} else if (e.key === 'ArrowRight') {
				showNextPhoto();
			}
		});
	}

	function getUrlParams() {
		const urlParams = new URLSearchParams(window.location.search);
		const type = urlParams.get('type') || '';
		const id = urlParams.get('id') || '';

		return {
			type: Object.prototype.hasOwnProperty.call(DATA_URLS, type) ? type : null,
			id
	};
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

	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	function safeExternalUrl(value) {
		const raw = String(value ?? '').trim();
		if (!raw || raw === '#') return '#';

		try {
			const url = new URL(raw, window.location.origin);
			return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
		} catch {
			return '#';
		}
	}

	function safeImageSrc(value) {
		let normalized = String(value ?? '').trim();
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

	function findItem(data, id, type) {
		const requestedId = String(id || '').trim();

		function matchesItem(item) {
			if (!item) return false;

			const itemId = String(item.id || '').trim();
			const itemSlug = String(item.slug || '').trim();
			const titleSlug = item.title ? slugify(item.title) : '';

			return itemId === requestedId || itemSlug === requestedId || titleSlug === requestedId;
		}

		if (type === 'evento' && Array.isArray(data)) {
			return data.find(matchesItem);
		}

		if (Array.isArray(data)) {
			return data.find(matchesItem);
		}

		for (const category in data) {
			if (Array.isArray(data[category])) {
				const item = data[category].find(matchesItem);
				if (item) return item;
			}
		}

		return null;
	}

	function renderStatus(message, isError = false, type = 'evento') {
		const wrapper = document.createElement('div');
		if (isError) {
			wrapper.className = 'detail-error-status';
			
			let homeUrl = './o-que-fazer.php';
			let homeLabel = 'Voltar para o que fazer';
			if (type === 'onde-ficar') {
				homeUrl = './onde-ficar.php';
				homeLabel = 'Voltar para onde ficar';
			} else if (type === 'onde-comer') {
				homeUrl = './onde-comer.php';
				homeLabel = 'Voltar para onde comer';
			} else if (type === 'servicos') {
				homeUrl = './servicos.php';
				homeLabel = 'Voltar para serviços';
			}

			wrapper.innerHTML = `
				<h3>Ops! Algo deu errado</h3>
				<p>${escapeHtml(message)}</p>
				<a href="${homeUrl}" class="btn-home">${escapeHtml(homeLabel)}</a>
			`;
		} else {
			wrapper.className = 'detail-loading-status';
			wrapper.innerHTML = `<p>${escapeHtml(message)}</p>`;
		}
		container.replaceChildren(wrapper);
	}

	function renderItemDetails(item, type) {
		document.title = `${item.title} | Detalhes | ATURP - Pancas, ES`;

		// 1. Coluna da Esquerda (Mídia, Título e Descrição)
		const leftCol = document.createElement('div');
		leftCol.className = 'detail__media';

		// Bloco do Título e Descrição
		const textCard = document.createElement('div');
		textCard.className = 'detail__info-content';

		const titleElement = document.createElement('h1');
		titleElement.className = 'detail__title';
		titleElement.textContent = item.title;

		const descTitle = document.createElement('h2');
		descTitle.className = 'detail__section-title';
		descTitle.textContent = type === 'evento' ? 'Sobre o Evento' : (type === 'onde-ficar' ? 'Sobre a Hospedagem' : (type === 'onde-comer' ? 'Sobre o Estabelecimento' : 'Sobre o Serviço'));

		const descText = document.createElement('p');
		descText.className = 'detail__description-text';
		descText.textContent = item.description;

		textCard.append(titleElement, descTitle, descText);

		// Galeria de Fotos / Imagem principal
		const rawPhotos = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos : (item.image ? [item.image] : []);
		const photos = rawPhotos.map(safeImageSrc).filter(Boolean);
		
		if (photos.length > 0) {
			const mainImageWrapper = document.createElement('div');
			mainImageWrapper.className = 'detail__main-image-wrapper';

			const mainImage = document.createElement('img');
			mainImage.className = 'detail__main-image';
			mainImage.src = photos[0];
			mainImage.alt = `Imagem de ${item.title}`;
			mainImageWrapper.appendChild(mainImage);

			// Clique na imagem principal para abrir o Lightbox
			mainImage.addEventListener('click', () => {
				const currentSrc = mainImage.getAttribute('src');
				const currentIndex = photos.findIndex(p => p === currentSrc);
				openLightbox(photos, currentIndex !== -1 ? currentIndex : 0);
			});

			leftCol.appendChild(mainImageWrapper);

			// Se tiver mais de uma foto na galeria, renderiza thumbnails
			if (photos.length > 1) {
				const galleryWrapper = document.createElement('div');
				galleryWrapper.className = 'detail__gallery';

				photos.forEach((photoUrl, index) => {
					const btn = document.createElement('button');
					btn.type = 'button';
					btn.className = `detail__thumb-btn ${index === 0 ? 'is-active' : ''}`;
					btn.setAttribute('aria-label', `Ver foto ${index + 1} de ${item.title}`);

					const img = document.createElement('img');
					img.className = 'detail__thumb-image';
					img.src = photoUrl;
					img.alt = `Miniatura ${index + 1}`;

					btn.appendChild(img);

					// Evento de clique para trocar a imagem principal
					btn.addEventListener('click', () => {
						galleryWrapper.querySelectorAll('.detail__thumb-btn').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						mainImage.style.opacity = '0';
						setTimeout(() => {
							mainImage.src = photoUrl;
							mainImage.style.opacity = '1';
						}, 150);
					});

					galleryWrapper.appendChild(btn);
				});

				mainImage.style.transition = 'opacity 0.15s ease-in-out';
				leftCol.appendChild(galleryWrapper);
			}
		}

		leftCol.appendChild(textCard);

		// 2. Coluna da Direita (Sidebar com Informações e Contatos)
		const rightCol = document.createElement('div');
		rightCol.className = 'detail__sidebar';

		// Card de Informações
		const infoCard = document.createElement('div');
		infoCard.className = 'detail__card';

		let infoHtml = '';

		if (type === 'evento') {
			infoHtml = `
				<h3 class="detail__card-title">Programação</h3>
				<ul class="detail__meta-list">
					<li class="detail__meta-item">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="detail__meta-icon">
							<path d="M96 32V64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48h-48V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM48 192H400V448H48V192z"/>
						</svg>
						<div>
							<div class="detail__meta-label">Data</div>
							<div class="detail__meta-value">${escapeHtml(item.date)}</div>
						</div>
					</li>
					<li class="detail__meta-item">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail__meta-icon">
							<path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.3 25.9 4.3 33.2-6.7s4.3-25.9-6.7-33.2L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
						</svg>
						<div>
							<div class="detail__meta-label">Horário</div>
							<div class="detail__meta-value">${escapeHtml(item.time)}</div>
						</div>
					</li>
					<li class="detail__meta-item">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="detail__meta-icon">
							<path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"/>
						</svg>
						<div>
							<div class="detail__meta-label">Local</div>
							<div class="detail__meta-value">${escapeHtml(item.local)}</div>
							${item.location_url ? `
								<iframe 
									src="https://maps.google.com/maps?q=${encodeURIComponent(item.local + ', Pancas, ES')}&t=&z=15&ie=UTF8&iwloc=&output=embed" 
									class="detail__map-iframe" 
									allowfullscreen="" 
									loading="lazy"
									title="Mapa de localização de ${escapeHtml(item.local)}"
								></iframe>
							` : ''}
						</div>
					</li>
				</ul>
			`;
		} else if (type === 'onde-ficar') {
			infoHtml = `
				<h3 class="detail__card-title">Hospedagem</h3>
				<ul class="detail__meta-list">
					<li class="detail__meta-item">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="detail__meta-icon">
							<path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"/>
						</svg>
						<div>
							<div class="detail__meta-label">Endereço</div>
							<div class="detail__meta-value">${escapeHtml(item.location.label)}</div>
							${item.location.url && item.location.url !== 'null' ? `
								<iframe 
									src="https://maps.google.com/maps?q=${encodeURIComponent(item.title + ', ' + item.location.label)}&t=&z=15&ie=UTF8&iwloc=&output=embed" 
									class="detail__map-iframe" 
									allowfullscreen="" 
									loading="lazy"
									title="Mapa de localização de ${escapeHtml(item.title)}"
								></iframe>
							` : ''}
						</div>
					</li>
					${item.landmark ? `
						<li class="detail__meta-item">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail__meta-icon">
								<path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"/>
							</svg>
							<div>
								<div class="detail__meta-label">Referência</div>
								<div class="detail__meta-value">${escapeHtml(item.landmark)}</div>
							</div>
						</li>
					` : ''}
				</ul>
			`;
		} else if (type === 'onde-comer') {
			const mealLabels = {
				'cafe-da-manha': 'Café da manhã',
				'almoco': 'Almoço',
				'lanches': 'Lanches',
				'jantar': 'Jantar'
			};
			const moments = item.mealMoments ? item.mealMoments.map(m => mealLabels[m] || m).join(', ') : '';

			infoHtml = `
				<h3 class="detail__card-title">Informações</h3>
				<ul class="detail__meta-list">
					<li class="detail__meta-item">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="detail__meta-icon">
							<path d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32v128c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32zM63.9 14.3C63.1 6.2 56.2 0 48 0S32.9 6.2 32 14.3L17.9 149.7C16.6 155.7 16 161.8 16 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7 0-6.1-.6-12.2-1.9-18.2L223.9 14.3c-.8-8.1-7.7-14.3-15.9-14.3s-15.1 6.2-15.9 14.4l-13.6 135.5c-.6 5.7-5.4 10.1-11.1 10.1s-10.6-4.4-11.2-10.2L143.9 14.6c-.7-8.3-7.6-14.6-15.9-14.6s-15.2 6.3-15.9 14.6L99.8 149.8c-.5 5.8-5.4 10.2-11.2 10.2s-10.6-4.4-11.1-10.1L63.9 14.3z"/>
						</svg>
						<div>
							<div class="detail__meta-label">Especialidade</div>
							<div class="detail__meta-value">${escapeHtml(item.specialty)}</div>
						</div>
					</li>
					${moments ? `
						<li class="detail__meta-item">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail__meta-icon">
								<path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.3 25.9 4.3 33.2-6.7s4.3-25.9-6.7-33.2L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
							</svg>
							<div>
								<div class="detail__meta-label">Momentos</div>
								<div class="detail__meta-value">${escapeHtml(moments)}</div>
							</div>
						</li>
					` : ''}
					<li class="detail__meta-item">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="detail__meta-icon">
							<path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"/>
						</svg>
						<div>
							<div class="detail__meta-label">Endereço</div>
							<div class="detail__meta-value">${escapeHtml(item.location.label)}</div>
							${item.location.url && item.location.url !== 'null' ? `
								<iframe 
									src="https://maps.google.com/maps?q=${encodeURIComponent(item.title + ', ' + item.location.label)}&t=&z=15&ie=UTF8&iwloc=&output=embed" 
									class="detail__map-iframe" 
									allowfullscreen="" 
									loading="lazy"
									title="Mapa de localização de ${escapeHtml(item.title)}"
								></iframe>
							` : ''}
						</div>
					</li>
					${item.landmark ? `
						<li class="detail__meta-item">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail__meta-icon">
								<path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"/>
							</svg>
							<div>
								<div class="detail__meta-label">Referência</div>
								<div class="detail__meta-value">${escapeHtml(item.landmark)}</div>
							</div>
						</li>
					` : ''}
				</ul>
			`;
		} else if (type === 'servicos') {
			infoHtml = `
				<h3 class="detail__card-title">Informações</h3>
				<ul class="detail__meta-list">
					<li class="detail__meta-item">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="detail__meta-icon">
							<path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"/>
						</svg>
						<div>
							<div class="detail__meta-label">Endereço</div>
							<div class="detail__meta-value">${escapeHtml(item.location.label)}</div>
							${item.location.url && item.location.url !== 'null' ? `
								<iframe 
									src="https://maps.google.com/maps?q=${encodeURIComponent(item.title + ', ' + item.location.label)}&t=&z=15&ie=UTF8&iwloc=&output=embed" 
									class="detail__map-iframe" 
									allowfullscreen="" 
									loading="lazy"
									title="Mapa de localização de ${escapeHtml(item.title)}"
								></iframe>
							` : ''}
						</div>
					</li>
					${item.landmark ? `
						<li class="detail__meta-item">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail__meta-icon">
								<path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"/>
							</svg>
							<div>
								<div class="detail__meta-label">Referência</div>
								<div class="detail__meta-value">${escapeHtml(item.landmark)}</div>
							</div>
						</li>
					` : ''}
				</ul>
			`;
		}

		infoCard.innerHTML = infoHtml;
		rightCol.appendChild(infoCard);

		// Card de Comodidades / Destaques
		if (item.amenities && item.amenities.length > 0) {
			const amenitiesCard = document.createElement('div');
			amenitiesCard.className = 'detail__card';
			
			const amenitiesList = item.amenities.map(a => `
				<li class="detail__meta-item">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail__meta-icon">
						<path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
					</svg>
					<span class="detail__meta-value" style="font-weight: 600;">${escapeHtml(a.label)}</span>
				</li>
			`).join('');

			amenitiesCard.innerHTML = `
				<h3 class="detail__card-title">Destaques e Comodidades</h3>
				<ul class="detail__meta-list">
					${amenitiesList}
				</ul>
			`;
			rightCol.appendChild(amenitiesCard);
		}

		// Card de Funcionamento (para onde-comer)
		if (type === 'onde-comer' && item.hours && item.hours.length > 0) {
			const hoursCard = document.createElement('div');
			hoursCard.className = 'detail__card';
			const hoursList = item.hours.map(h => `
				<li class="detail__meta-item">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail__meta-icon">
						<path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.3 25.9 4.3 33.2-6.7s4.3-25.9-6.7-33.2L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
					</svg>
					<div>
						<div class="detail__meta-label">${escapeHtml(h.label)}</div>
						<div class="detail__meta-value">${escapeHtml(h.value)}</div>
					</div>
				</li>
			`).join('');

			hoursCard.innerHTML = `
				<h3 class="detail__card-title">Horário de Funcionamento</h3>
				<ul class="detail__meta-list">
					${hoursList}
				</ul>
			`;
			rightCol.appendChild(hoursCard);
		}

		// Card de Contatos
		if ((item.social && item.social.url && item.social.url !== 'null') || (item.whatsapp && item.whatsapp !== 'null')) {
			const contactCard = document.createElement('div');
			contactCard.className = 'detail__card';

			const contactTitle = document.createElement('h3');
			contactTitle.className = 'detail__card-title';
			contactTitle.textContent = 'Contato e Informações';

			const ctasWrapper = document.createElement('div');
			ctasWrapper.className = 'detail__ctas';

			if (item.whatsapp && item.whatsapp !== 'null') {
				const waBtn = document.createElement('a');
				waBtn.href = safeExternalUrl(item.whatsapp);
				waBtn.target = '_blank';
				waBtn.rel = 'noopener noreferrer';
				waBtn.className = 'detail__cta-btn detail__cta-btn--whatsapp';
				waBtn.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="detail__cta-icon">
						<path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3.2 496l136.2-35.7c32.8 17.8 69.7 27.2 107.4 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-80.2 21 21.4-78.2-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
					</svg>
					WhatsApp
				`;
				ctasWrapper.appendChild(waBtn);
			}

			if (item.social && item.social.url && item.social.url !== 'null') {
				const socialBtn = document.createElement('a');
				const socialUrl = safeExternalUrl(item.social.url);
				socialBtn.href = socialUrl;
				socialBtn.target = '_blank';
				socialBtn.rel = 'noopener noreferrer';
				socialBtn.className = 'detail__cta-btn detail__cta-btn--social';
				
				const isInstagram = socialUrl.includes('instagram.com');
				socialBtn.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="detail__cta-icon">
						${isInstagram ? `
							<path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12.2 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
						` : `
							<path d="M576 256c0-141.4-114.6-256-256-256S64 114.6 64 256c0 127.7 93.3 233.7 216 253V332.2h-61V256h61v-58.1c0-60.3 35.8-93.6 90.8-93.6 26.3 0 53.9 4.7 53.9 4.7v59.3h-30.4c-29.9 0-39.2 18.5-39.2 37.5V256h66.9l-10.7 76.2h-56.2V509c122.7-19.3 216-125.3 216-253z"/>
						`}
					</svg>
					${isInstagram ? `Instagram (${escapeHtml(item.social.label)})` : escapeHtml(item.social.label)}
				`;
				ctasWrapper.appendChild(socialBtn);
			}

			contactCard.appendChild(contactTitle);
			contactCard.appendChild(ctasWrapper);
			rightCol.appendChild(contactCard);
		}

		container.replaceChildren(leftCol, rightCol);
	}

	async function fetchItemDetails() {
		const { type, id } = getUrlParams();
		if (!type) {
			renderStatus('Tipo de item inválido.', true, 'evento');
			return;
		}

		// Update Back Link
		const backLink = document.querySelector('.back-link');
		const backLinkIcon = `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="back-link__icon">
				<path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
			</svg>
		`;
		if (backLink) {
			if (type === 'onde-ficar') {
				backLink.href = './onde-ficar.php';
				backLink.innerHTML = `${backLinkIcon} Voltar para Onde ficar`;
			} else if (type === 'onde-comer') {
				backLink.href = './onde-comer.php';
				backLink.innerHTML = `${backLinkIcon} Voltar para Onde comer`;
			} else if (type === 'servicos') {
				backLink.href = './servicos.php';
				backLink.innerHTML = `${backLinkIcon} Voltar para Serviços`;
			} else {
				backLink.href = './o-que-fazer.php';
				backLink.innerHTML = `${backLinkIcon} Voltar para O que fazer`;
			}
		}

		const dataUrl = DATA_URLS[type] || DATA_URLS['evento'];
		renderStatus('Carregando detalhes...');

		try {
			const response = await fetch(dataUrl);
			if (!response.ok) {
				throw new Error(`Falha ao carregar dados (${response.status})`);
			}

			const data = await response.json();
			const item = findItem(data, id, type);

			if (!item) {
				renderStatus('O item selecionado não foi localizado.', true, type);
				return;
			}

			renderItemDetails(item, type);
		} catch (error) {
			renderStatus('Não foi possível carregar os detalhes no momento.', true, type);
			console.error(error);
		}
	}

	fetchItemDetails();
})();
