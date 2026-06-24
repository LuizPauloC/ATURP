(function () {
	const container = document.querySelector('[data-event-details-container]');
	const DATA_URL = '../json/eventos.json';

	if (!container) return;

	function getEventId() {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get('id');
	}

	function renderStatus(message, isError = false) {
		const wrapper = document.createElement('div');
		if (isError) {
			wrapper.className = 'event-error-status';
			wrapper.innerHTML = `
				<h3>Ops! Algo deu errado</h3>
				<p>${message}</p>
				<a href="./o-que-fazer.html" class="btn-home">Voltar para o que fazer</a>
			`;
		} else {
			wrapper.className = 'event-loading-status';
			wrapper.innerHTML = `<p>${message}</p>`;
		}
		container.replaceChildren(wrapper);
	}

	function renderEventDetails(event) {
		document.title = `${event.title} | Eventos em Pancas, ES`;

		// 1. Coluna da Esquerda (Mídia, Título e Descrição)
		const leftCol = document.createElement('div');
		leftCol.className = 'event-detail__media';

		// Bloco do Título e Descrição (Fica no topo ou junto com a mídia)
		const textCard = document.createElement('div');
		textCard.className = 'event-detail__info-content';

		const titleElement = document.createElement('h1');
		titleElement.className = 'event-detail__title';
		titleElement.textContent = event.title;

		const descTitle = document.createElement('h2');
		descTitle.className = 'event-detail__section-title';
		descTitle.textContent = 'Sobre o Evento';

		const descText = document.createElement('p');
		descText.className = 'event-detail__description-text';
		descText.textContent = event.description;

		textCard.append(titleElement, descTitle, descText);

		// Galeria de Fotos
		if (event.photos && event.photos.length > 0) {
			const mainImageWrapper = document.createElement('div');
			mainImageWrapper.className = 'event-detail__main-image-wrapper';

			const mainImage = document.createElement('img');
			mainImage.className = 'event-detail__main-image';
			mainImage.src = `..${event.photos[0]}`;
			mainImage.alt = `Imagem principal de ${event.title}`;
			mainImageWrapper.appendChild(mainImage);

			leftCol.appendChild(mainImageWrapper);

			// Se tiver mais de uma foto na galeria, renderiza thumbnails
			if (event.photos.length > 1) {
				const galleryWrapper = document.createElement('div');
				galleryWrapper.className = 'event-detail__gallery';

				event.photos.forEach((photoUrl, index) => {
					const btn = document.createElement('button');
					btn.type = 'button';
					btn.className = `event-detail__thumb-btn ${index === 0 ? 'is-active' : ''}`;
					btn.setAttribute('aria-label', `Ver foto ${index + 1} de ${event.title}`);

					const img = document.createElement('img');
					img.className = 'event-detail__thumb-image';
					img.src = `..${photoUrl}`;
					img.alt = `Miniatura ${index + 1}`;

					btn.appendChild(img);

					// Evento de clique para trocar a imagem principal
					btn.addEventListener('click', () => {
						// Remove classe active de todos
						galleryWrapper.querySelectorAll('.event-detail__thumb-btn').forEach(b => b.classList.remove('is-active'));
						// Adiciona classe active no clicado
						btn.classList.add('is-active');
						// Troca imagem principal com uma transição suave
						mainImage.style.opacity = '0';
						setTimeout(() => {
							mainImage.src = `..${photoUrl}`;
							mainImage.style.opacity = '1';
						}, 150);
					});

					galleryWrapper.appendChild(btn);
				});

				// Adiciona fade transition style à imagem principal
				mainImage.style.transition = 'opacity 0.15s ease-in-out';

				leftCol.appendChild(galleryWrapper);
			}
		}

		leftCol.appendChild(textCard);

		// 2. Coluna da Direita (Sidebar com Programação e Contatos)
		const rightCol = document.createElement('div');
		rightCol.className = 'event-detail__sidebar';

		// Card de Programação
		const scheduleCard = document.createElement('div');
		scheduleCard.className = 'event-detail__card';

		const scheduleTitle = document.createElement('h3');
		scheduleCard.className = 'event-detail__card';
		scheduleCard.innerHTML = `
			<h3 class="event-detail__card-title">Programação</h3>
			<ul class="event-detail__meta-list">
				<li class="event-detail__meta-item">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="event-detail__meta-icon">
						<path d="M96 32V64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48h-48V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM48 192H400V448H48V192z"/>
					</svg>
					<div>
						<div class="event-detail__meta-label">Data</div>
						<div class="event-detail__meta-value">${event.date}</div>
					</div>
				</li>
				<li class="event-detail__meta-item">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="event-detail__meta-icon">
						<path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.3 25.9 4.3 33.2-6.7s4.3-25.9-6.7-33.2L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
					</svg>
					<div>
						<div class="event-detail__meta-label">Horário</div>
						<div class="event-detail__meta-value">${event.time}</div>
					</div>
				</li>
				<li class="event-detail__meta-item">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="event-detail__meta-icon">
						<path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"/>
					</svg>
					<div>
						<div class="event-detail__meta-label">Local</div>
						<div class="event-detail__meta-value">${event.local}</div>
						${event.location_url ? `
							<a href="${event.location_url}" target="_blank" rel="noopener noreferrer" class="event-detail__maps-btn">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="event-detail__maps-icon">
									<path d="M432 320H400a16 16 0 0 0-16 16v112H64V128h112a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16H48a48 48 0 0 0-48 48v416a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V336a16 16 0 0 0-16-16zM488 0H336a24 24 0 0 0-24 24v16a24 24 0 0 0 24 24h68.7L213.3 255.4a24 24 0 0 0 0 33.9l11.3 11.3a24 24 0 0 0 33.9 0L448 111.3V180a24 24 0 0 0 24 24h16a24 24 0 0 0 24-24V24a24 24 0 0 0-24-24z"/>
								</svg>
								Como chegar (Google Maps)
							</a>
						` : ''}
					</div>
				</li>
			</ul>
		`;

		rightCol.appendChild(scheduleCard);

		// Card de Contatos
		if ((event.social && event.social.url) || event.whatsapp) {
			const contactCard = document.createElement('div');
			contactCard.className = 'event-detail__card';

			const contactTitle = document.createElement('h3');
			contactTitle.className = 'event-detail__card-title';
			contactTitle.textContent = 'Contato e Informações';

			const ctasWrapper = document.createElement('div');
			ctasWrapper.className = 'event-detail__ctas';

			if (event.whatsapp) {
				const waBtn = document.createElement('a');
				waBtn.href = event.whatsapp;
				waBtn.target = '_blank';
				waBtn.rel = 'noopener noreferrer';
				waBtn.className = 'event-detail__cta-btn event-detail__cta-btn--whatsapp';
				waBtn.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="event-detail__cta-icon">
						<path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3.2 496l136.2-35.7c32.8 17.8 69.7 27.2 107.4 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-80.2 21 21.4-78.2-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
					</svg>
					WhatsApp
				`;
				ctasWrapper.appendChild(waBtn);
			}

			if (event.social && event.social.url) {
				const socialBtn = document.createElement('a');
				socialBtn.href = event.social.url;
				socialBtn.target = '_blank';
				socialBtn.rel = 'noopener noreferrer';
				socialBtn.className = 'event-detail__cta-btn event-detail__cta-btn--social';
				socialBtn.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="event-detail__cta-icon">
						<path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12.2 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
					</svg>
					Instagram (${event.social.label})
				`;
				ctasWrapper.appendChild(socialBtn);
			}

			contactCard.appendChild(contactTitle);
			contactCard.appendChild(ctasWrapper);
			rightCol.appendChild(contactCard);
		}

		container.replaceChildren(leftCol, rightCol);
	}

	async function fetchEventDetails() {
		const id = getEventId();
		if (!id) {
			renderStatus('Evento não especificado.', true);
			return;
		}

		renderStatus('Carregando detalhes do evento...');

		try {
			const response = await fetch(DATA_URL);
			if (!response.ok) {
				throw new Error(`Falha ao carregar evento (${response.status})`);
			}

			const data = await response.json();
			const events = Array.isArray(data) ? data : [];
			const event = events.find(e => e.id === id);

			if (!event) {
				renderStatus('O evento selecionado não foi localizado.', true);
				return;
			}

			renderEventDetails(event);
		} catch (error) {
			renderStatus('Não foi possível carregar os detalhes do evento no momento.', true);
			console.error(error);
		}
	}

	fetchEventDetails();
})();
