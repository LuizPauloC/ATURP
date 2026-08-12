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

	function getDetailTypeMeta(type) {
		const metas = {
			'evento': {
				label: 'Eventos',
				singular: 'Evento',
				url: './o-que-fazer.php',
				aboutLabel: 'Sobre o Evento',
			},
			'onde-ficar': {
				label: 'Hospedagens',
				singular: 'Hospedagem',
				url: './onde-ficar.php',
				aboutLabel: 'Sobre a Hospedagem',
			},
			'onde-comer': {
				label: 'Gastronomia',
				singular: 'Estabelecimento',
				url: './onde-comer.php',
				aboutLabel: 'Sobre o Estabelecimento',
			},
			'servicos': {
				label: 'Serviços',
				singular: 'Serviço',
				url: './servicos.php',
				aboutLabel: 'Sobre o Serviço',
			},
			'experiencias': {
				label: 'Experiências',
				singular: 'Experiência',
				url: './o-que-fazer.php',
				aboutLabel: 'Sobre a Experiência',
			},
		};

		return metas[type] || metas.evento;
	}

	function renderBreadcrumb(item, type) {
		const breadcrumb = document.querySelector('[data-detail-breadcrumb]');
		if (!breadcrumb) return;

		const meta = getDetailTypeMeta(type);
		breadcrumb.innerHTML = `
			<a href="./index.php" class="detail-breadcrumb__link">Início</a>
			<span class="detail-breadcrumb__separator" aria-hidden="true">/</span>
			<a href="${escapeHtml(meta.url)}" class="detail-breadcrumb__link">${escapeHtml(meta.label)}</a>
			<span class="detail-breadcrumb__separator" aria-hidden="true">/</span>
			<span class="detail-breadcrumb__current">${escapeHtml(item?.title || meta.singular)}</span>
		`;
	}

	const DETAIL_ICONS = {
		price: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M14 9H11.5C10.6716 9 10 9.67157 10 10.5C10 11.3284 10.6716 12 11.5 12H12.5C13.3284 12 14 12.6716 14 13.5C14 14.3284 13.3284 15 12.5 15H10M12 8V9M12 15V16M18 12H18.01M6 12H6.01M2 8.2L2 15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.07989 19 5.2 19L18.8 19C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5L5.2 5C4.0799 5 3.51984 5 3.09202 5.21799C2.7157 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.07989 2 8.2ZM18.5 12C18.5 12.2761 18.2761 12.5 18 12.5C17.7239 12.5 17.5 12.2761 17.5 12C17.5 11.7239 17.7239 11.5 18 11.5C18.2761 11.5 18.5 11.7239 18.5 12ZM6.5 12C6.5 12.2761 6.27614 12.5 6 12.5C5.72386 12.5 5.5 12.2761 5.5 12C5.5 11.7239 5.72386 11.5 6 11.5C6.27614 11.5 6.5 11.7239 6.5 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		daily: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M8.5 14.6667C8.5 15.9553 9.54467 17 10.8333 17H13C14.3807 17 15.5 15.8807 15.5 14.5C15.5 13.1193 14.3807 12 13 12H11C9.61929 12 8.5 10.8807 8.5 9.5C8.5 8.11929 9.61929 7 11 7H13.1667C14.4553 7 15.5 8.04467 15.5 9.33333M12 5.5V7M12 17V18.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		phone: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M8.38028 8.85335C9.07627 10.303 10.0251 11.6616 11.2266 12.8632C12.4282 14.0648 13.7869 15.0136 15.2365 15.7096C15.3612 15.7694 15.4235 15.7994 15.5024 15.8224C15.7828 15.9041 16.127 15.8454 16.3644 15.6754C16.4313 15.6275 16.4884 15.5704 16.6027 15.4561C16.9523 15.1064 17.1271 14.9316 17.3029 14.8174C17.9658 14.3864 18.8204 14.3864 19.4833 14.8174C19.6591 14.9316 19.8339 15.1064 20.1835 15.4561L20.3783 15.6509C20.9098 16.1824 21.1755 16.4481 21.3198 16.7335C21.6069 17.301 21.6069 17.9713 21.3198 18.5389C21.1755 18.8242 20.9098 19.09 20.3783 19.6214L20.2207 19.779C19.6911 20.3087 19.4263 20.5735 19.0662 20.7757C18.6667 21.0001 18.0462 21.1615 17.588 21.1601C17.1751 21.1589 16.8928 21.0788 16.3284 20.9186C13.295 20.0576 10.4326 18.4332 8.04466 16.0452C5.65668 13.6572 4.03221 10.7948 3.17124 7.76144C3.01103 7.19699 2.93092 6.91477 2.9297 6.50182C2.92833 6.0436 3.08969 5.42311 3.31411 5.0236C3.51636 4.66357 3.78117 4.39876 4.3108 3.86913L4.46843 3.7115C4.99987 3.18006 5.2656 2.91433 5.55098 2.76999C6.11854 2.48292 6.7888 2.48292 7.35636 2.76999C7.64174 2.91433 7.90747 3.18006 8.43891 3.7115L8.63378 3.90637C8.98338 4.25597 9.15819 4.43078 9.27247 4.60655C9.70347 5.26945 9.70347 6.12403 9.27247 6.78692C9.15819 6.96269 8.98338 7.1375 8.63378 7.4871C8.51947 7.60142 8.46231 7.65857 8.41447 7.72538C8.24446 7.96281 8.18576 8.30707 8.26748 8.58743C8.29048 8.66632 8.32041 8.72866 8.38028 8.85335Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		website: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22M2.50002 9H21.5M2.5 15H21.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		cuisine: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M127.9 78.4C127.1 70.2 120.2 64 112 64C103.8 64 96.9 70.2 96 78.3L81.9 213.7C80.6 219.7 80 225.8 80 231.9C80 277.8 115.1 315.5 160 319.6L160 544C160 561.7 174.3 576 192 576C209.7 576 224 561.7 224 544L224 319.6C268.9 315.5 304 277.8 304 231.9C304 225.8 303.4 219.7 302.1 213.7L287.9 78.3C287.1 70.2 280.2 64 272 64C263.8 64 256.9 70.2 256.1 78.4L242.5 213.9C241.9 219.6 237.1 224 231.4 224C225.6 224 220.8 219.6 220.2 213.8L207.9 78.6C207.2 70.3 200.3 64 192 64C183.7 64 176.8 70.3 176.1 78.6L163.8 213.8C163.3 219.6 158.4 224 152.6 224C146.8 224 142 219.6 141.5 213.9L127.9 78.4zM512 64C496 64 384 96 384 240L384 352C384 387.3 412.7 416 448 416L480 416L480 544C480 561.7 494.3 576 512 576C529.7 576 544 561.7 544 544L544 96C544 78.3 529.7 64 512 64z"/></svg>',
		type: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M9 21V13.6C9 13.0399 9 12.7599 9.109 12.546C9.20487 12.3578 9.35785 12.2049 9.54601 12.109C9.75993 12 10.04 12 10.6 12H13.4C13.9601 12 14.2401 12 14.454 12.109C14.6422 12.2049 14.7951 12.3578 14.891 12.546C15 12.7599 15 13.0399 15 13.6V21M2 9.5L11.04 2.72C11.3843 2.46181 11.5564 2.33271 11.7454 2.28294C11.9123 2.23902 12.0877 2.23902 12.2546 2.28295C12.4436 2.33271 12.6157 2.46181 12.96 2.72L22 9.5M4 8V17.8C4 18.9201 4 19.4802 4.21799 19.908C4.40974 20.2843 4.7157 20.5903 5.09202 20.782C5.51985 21 6.0799 21 7.2 21H16.8C17.9201 21 18.4802 21 18.908 20.782C19.2843 20.5903 19.5903 20.2843 19.782 19.908C20 19.4802 20 18.9201 20 17.8V8L13.92 3.44C13.2315 2.92361 12.8872 2.66542 12.5091 2.56589C12.1754 2.47804 11.8246 2.47804 11.4909 2.56589C11.1128 2.66542 10.7685 2.92361 10.08 3.44L4 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		instagram: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/></svg>',
		meals: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M272 208C272 155 229 112 176 112C123 112 80 155 80 208C80 261 123 304 176 304C229 304 272 261 272 208zM316.4 240C301.9 304.1 244.5 352 176 352C96.5 352 32 287.5 32 208C32 128.5 96.5 64 176 64C244.5 64 301.9 111.9 316.4 176L388.2 176C397 166.2 409.8 160 424 160L528 160C554.5 160 576 181.5 576 208C576 234.5 554.5 256 528 256L424 256C409.8 256 397 249.8 388.2 240L316.4 240zM176 144C211.3 144 240 172.7 240 208C240 243.3 211.3 272 176 272C140.7 272 112 243.3 112 208C112 172.7 140.7 144 176 144zM432 304C445.3 304 456 314.7 456 328L456 336L552 336C565.3 336 576 346.7 576 360C576 373.3 565.3 384 552 384L312 384C298.7 384 288 373.3 288 360C288 346.7 298.7 336 312 336L408 336L408 328C408 314.7 418.7 304 432 304zM320 528L320 416L544 416L544 528C544 554.5 522.5 576 496 576L368 576C341.5 576 320 554.5 320 528zM80 384L208 384C234.5 384 256 405.5 256 432C256 458.5 234.5 480 208 480L192 480C192 497.7 177.7 512 160 512L96 512C78.3 512 64 497.7 64 480L64 400C64 391.2 71.2 384 80 384zM208 448C216.8 448 224 440.8 224 432C224 423.2 216.8 416 208 416L192 416L192 448L208 448zM56 528L232 528C245.3 528 256 538.7 256 552C256 565.3 245.3 576 232 576L56 576C42.7 576 32 565.3 32 552C32 538.7 42.7 528 56 528z"/></svg>',
		reservation: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64zM160 176C151.2 176 144 183.2 144 192L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 192C496 183.2 488.8 176 480 176L160 176zM390.7 241.9C398.5 231.2 413.5 228.8 424.2 236.6C434.9 244.4 437.3 259.4 429.5 270.1L307.4 438.1C303.3 443.8 296.9 447.4 289.9 447.9C282.9 448.4 276 445.9 271.1 441L215.2 385.1C205.8 375.7 205.8 360.5 215.2 351.2C224.6 341.9 239.8 341.8 249.1 351.2L285.1 387.2L390.7 242z"/></svg>',
		checkin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M416 160L480 160C497.7 160 512 174.3 512 192L512 448C512 465.7 497.7 480 480 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L480 544C533 544 576 501 576 448L576 192C576 139 533 96 480 96L416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160zM406.6 342.6C419.1 330.1 419.1 309.8 406.6 297.3L278.6 169.3C266.1 156.8 245.8 156.8 233.3 169.3C220.8 181.8 220.8 202.1 233.3 214.6L306.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L306.7 352L233.3 425.4C220.8 437.9 220.8 458.2 233.3 470.7C245.8 483.2 266.1 483.2 278.6 470.7L406.6 342.7z"/></svg>',
		checkout: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160zM566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L438.6 169.3C426.1 156.8 405.8 156.8 393.3 169.3C380.8 181.8 380.8 202.1 393.3 214.6L466.7 288L256 288C238.3 288 224 302.3 224 320C224 337.7 238.3 352 256 352L466.7 352L393.3 425.4C380.8 437.9 380.8 458.2 393.3 470.7C405.8 483.2 426.1 483.2 438.6 470.7L566.6 342.7z"/></svg>',
		wifi: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M320 160C229.1 160 146.8 196 86.3 254.6C73.6 266.9 53.3 266.6 41.1 253.9C28.9 241.2 29.1 220.9 41.8 208.7C113.7 138.9 211.9 96 320 96C428.1 96 526.3 138.9 598.3 208.7C611 221 611.3 241.3 599 253.9C586.7 266.5 566.4 266.9 553.8 254.6C493.2 196 410.9 160 320 160zM272 496C272 469.5 293.5 448 320 448C346.5 448 368 469.5 368 496C368 522.5 346.5 544 320 544C293.5 544 272 522.5 272 496zM200 390.2C188.3 403.5 168.1 404.7 154.8 393C141.5 381.3 140.3 361.1 152 347.8C193 301.4 253.1 272 320 272C386.9 272 447 301.4 488 347.8C499.7 361.1 498.4 381.3 485.2 393C472 404.7 451.7 403.4 440 390.2C410.6 356.9 367.8 336 320 336C272.2 336 229.4 356.9 200 390.2z"/></svg>',
		parking: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM288 320L336 320C353.7 320 368 305.7 368 288C368 270.3 353.7 256 336 256L288 256L288 320zM336 384L288 384L288 416C288 433.7 273.7 448 256 448C238.3 448 224 433.7 224 416L224 232C224 209.9 241.9 192 264 192L336 192C389 192 432 235 432 288C432 341 389 384 336 384z"/></svg>',
		air: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M352.2 64C352.2 46.3 337.9 32 320.2 32C302.5 32 288.2 46.3 288.2 64L288.2 126.1L273.2 111.1C263.8 101.7 248.6 101.7 239.3 111.1C230 120.5 229.9 135.7 239.3 145L288.3 194L288.3 264.6L227.1 229.3L209.2 162.4C205.8 149.6 192.6 142 179.8 145.4C167 148.8 159.3 162 162.7 174.8L168.2 195.3L114.5 164.3C99.2 155.5 79.6 160.7 70.8 176C62 191.3 67.2 210.9 82.5 219.7L136.2 250.7L115.7 256.2C102.9 259.6 95.3 272.8 98.7 285.6C102.1 298.4 115.3 306 128.1 302.6L195 284.7L256.2 320L195 355.3L128.1 337.4C115.3 334 102.1 341.6 98.7 354.4C95.3 367.2 102.9 380.4 115.7 383.8L136.2 389.3L82.5 420.3C67.2 429.1 62 448.7 70.8 464C79.6 479.3 99.2 484.6 114.5 475.7L168.2 444.7L162.7 465.2C159.3 478 166.9 491.2 179.7 494.6C192.5 498 205.7 490.4 209.1 477.6L227 410.7L288.2 375.4L288.2 446L239.2 495C229.8 504.4 229.8 519.6 239.2 528.9C248.6 538.2 263.8 538.3 273.1 528.9L288.1 513.9L288.1 576C288.1 593.7 302.4 608 320.1 608C337.8 608 352.1 593.7 352.1 576L352.1 513.9L367.1 528.9C376.5 538.3 391.7 538.3 401 528.9C410.3 519.5 410.4 504.3 401 495L352 446L352 375.4L413.2 410.7L431.1 477.6C434.5 490.4 447.7 498 460.5 494.6C473.3 491.2 480.9 478 477.5 465.2L472 444.7L525.7 475.7C541 484.5 560.6 479.3 569.4 464C578.2 448.7 573 429.1 557.7 420.3L504 389.3L524.5 383.8C537.3 380.4 544.9 367.2 541.5 354.4C538.1 341.6 524.9 334 512.1 337.4L445.2 355.3L384 320L445.2 284.7L512.1 302.6C524.9 306 538.1 298.4 541.5 285.6C544.9 272.8 537.3 259.6 524.5 256.2L504 250.7L557.7 219.7C573 210.9 578.3 191.3 569.4 176C560.5 160.7 541 155.5 525.7 164.3L472 195.3L477.5 174.8C480.9 162 473.3 148.8 460.5 145.4C447.7 142 434.5 149.6 431.1 162.4L413.2 229.3L352 264.6L352 194L401 145C410.4 135.6 410.4 120.4 401 111.1C391.6 101.8 376.4 101.7 367.1 111.1L352.1 126.1L352.1 64z"/></svg>',
		pool: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M552 216C552 185.1 526.9 160 496 160C465.1 160 440 185.1 440 216C440 246.9 465.1 272 496 272C526.9 272 552 246.9 552 216zM293.4 262.2L204.8 336.1C205.9 336.1 207 336 208.1 336C241.2 335.8 274.4 346.2 302.5 367.4C324.6 384 331.6 384 353.7 367.4C381.2 346.7 413.6 336.2 446.1 336C450.9 336 455.8 336.2 460.6 336.6C452.3 306.6 436.3 278.9 413.8 256.4C395.4 238 373.2 223.7 348.8 214.6L280.2 188.9C252.8 178.6 222.2 181.4 197.1 196.5L143.6 228.6C128.4 237.7 123.5 257.3 132.6 272.5C141.7 287.7 161.3 292.6 176.5 283.5L230 251.3C238.4 246.3 248.6 245.4 257.7 248.8L293.4 262.2zM403.4 444.1C424.7 428 453.3 428 474.6 444.1C493.6 458.5 516.5 472.3 541.8 477.4C568.3 482.8 596.1 478.2 622.5 458.3C633.1 450.3 635.2 435.3 627.2 424.7C619.2 414.1 604.2 412 593.6 420C578.7 431.2 565 433.1 551.3 430.3C536.4 427.3 520.4 418.4 503.5 405.7C465.1 376.7 413 376.7 374.5 405.7C350.5 423.8 333.8 432 320 432C306.2 432 289.5 423.8 265.5 405.7C227.1 376.7 175 376.7 136.5 405.7C114.9 422 95.2 431.5 77.6 431.4C68 431.3 57.7 428.4 46.4 419.9C35.8 411.9 20.8 414 12.8 424.6C4.8 435.2 7 450.3 17.6 458.3C36.7 472.7 57 479.3 77.4 479.4C111.3 479.6 141.7 462 165.5 444.1C186.8 428 215.4 428 236.7 444.1C260.9 462.4 289 480 320.1 480C351.2 480 379.2 462.3 403.5 444.1z"/></svg>',
		accessibility: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM225.5 233.9C213.3 228.7 199.2 234.3 194 246.5C188.8 258.7 194.4 272.8 206.6 278L218.5 283.1C235.8 290.5 253.7 296 272.1 299.4L272.1 349.5C272.1 353.8 271.4 358.1 270 362.1L241.3 448.2C237.1 460.8 243.9 474.4 256.5 478.6C269.1 482.8 282.7 476 286.9 463.4L311.3 390.2C312.6 386.4 316.1 383.8 320.1 383.8C324.1 383.8 327.7 386.4 328.9 390.2L353.3 463.4C357.5 476 371.1 482.8 383.7 478.6C396.3 474.4 403 461 398.8 448.4L370.1 362.3C368.7 358.2 368 354 368 349.7L368 299.6C386.4 296.1 404.3 290.7 421.6 283.3L433.5 278.2C445.7 273 451.3 258.9 446.1 246.7C440.9 234.5 426.8 228.9 414.6 234.1L402.7 239C376.6 250.2 348.5 256 320 256C291.5 256 263.5 250.2 237.3 239L225.4 233.9zM320 224C342.1 224 360 206.1 360 184C360 161.9 342.1 144 320 144C297.9 144 280 161.9 280 184C280 206.1 297.9 224 320 224z"/></svg>',
		pets: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M64 176C80.6 176 94.2 188.6 95.8 204.7L96.1 211.3C97.8 227.4 111.4 240 128 240L307.1 240L448 300.4L448 544C448 561.7 433.7 576 416 576L384 576C366.3 576 352 561.7 352 544L352 412.7C328 425 300.8 432 272 432C243.2 432 216 425 192 412.7L192 544C192 561.7 177.7 576 160 576L128 576C110.3 576 96 561.7 96 544L96 298.4C58.7 285.2 32 249.8 32 208C32 190.3 46.3 176 64 176zM387.8 32C395.5 32 402.7 35.6 407.4 41.8L424 64L476.1 64C488.8 64 501 69.1 510 78.1L528 96L584 96C597.3 96 608 106.7 608 120L608 144C608 188.2 572.2 224 528 224L464 224L457 252L332.3 198.6L363.9 51.4C366.3 40.1 376.2 32 387.8 32zM480 108C469 108 460 117 460 128C460 139 469 148 480 148C491 148 500 139 500 128C500 117 491 108 480 108z"/></svg>',
		delivery: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M64 160C64 124.7 92.7 96 128 96L416 96C451.3 96 480 124.7 480 160L480 192L530.7 192C547.7 192 564 198.7 576 210.7L621.3 256C633.3 268 640 284.3 640 301.3L640 448C640 483.3 611.3 512 576 512L572.7 512C562.3 548.9 528.3 576 488 576C447.7 576 413.8 548.9 403.3 512L300.7 512C290.3 548.9 256.3 576 216 576C175.7 576 141.8 548.9 131.3 512L128 512C92.7 512 64 483.3 64 448L64 400L24 400C10.7 400 0 389.3 0 376C0 362.7 10.7 352 24 352L136 352C149.3 352 160 341.3 160 328C160 314.7 149.3 304 136 304L24 304C10.7 304 0 293.3 0 280C0 266.7 10.7 256 24 256L200 256C213.3 256 224 245.3 224 232C224 218.7 213.3 208 200 208L24 208C10.7 208 0 197.3 0 184C0 170.7 10.7 160 24 160L64 160zM576 352L576 301.3L530.7 256L480 256L480 352L576 352zM256 488C256 465.9 238.1 448 216 448C193.9 448 176 465.9 176 488C176 510.1 193.9 528 216 528C238.1 528 256 510.1 256 488zM488 528C510.1 528 528 510.1 528 488C528 465.9 510.1 448 488 448C465.9 448 448 465.9 448 488C448 510.1 465.9 528 488 528z"/></svg>',
		pickup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M278.6 374.6L214.6 438.6C202.1 451.1 181.8 451.1 169.3 438.6L105.3 374.6C92.8 362.1 92.8 341.8 105.3 329.3C117.8 316.8 138.1 316.8 150.6 329.3L160 338.7L160 96C160 78.3 174.3 64 192 64C209.7 64 224 78.3 224 96L224 338.7L233.4 329.3C245.9 316.8 266.2 316.8 278.7 329.3C291.2 341.8 291.2 362.1 278.7 374.6zM534.6 374.6L470.6 438.6C458.1 451.1 437.8 451.1 425.3 438.6L361.3 374.6C348.8 362.1 348.8 341.8 361.3 329.3C373.8 316.8 394.1 316.8 406.6 329.3L416 338.7L416 96C416 78.3 430.3 64 448 64C465.7 64 480 78.3 480 96L480 338.7L489.4 329.3C501.9 316.8 522.2 316.8 534.7 329.3C547.2 341.8 547.2 362.1 534.7 374.6zM96 576C78.3 576 64 561.7 64 544C64 526.3 78.3 512 96 512L544 512C561.7 512 576 526.3 576 544C576 561.7 561.7 576 544 576L96 576z"/></svg>',
		pix: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M306.4 356.5C311.8 351.1 321.1 351.1 326.5 356.5L403.5 433.5C417.7 447.7 436.6 455.5 456.6 455.5L471.7 455.5L374.6 552.6C344.3 582.1 295.1 582.1 264.8 552.6L167.3 455.2L176.6 455.2C196.6 455.2 215.5 447.4 229.7 433.2L306.4 356.5zM326.5 282.9C320.1 288.4 311.9 288.5 306.4 282.9L229.7 206.2C215.5 191.1 196.6 184.2 176.6 184.2L167.3 184.2L264.7 86.8C295.1 56.5 344.3 56.5 374.6 86.8L471.8 183.9L456.6 183.9C436.6 183.9 417.7 191.7 403.5 205.9L326.5 282.9zM176.6 206.7C190.4 206.7 203.1 212.3 213.7 222.1L290.4 298.8C297.6 305.1 307 309.6 316.5 309.6C325.9 309.6 335.3 305.1 342.5 298.8L419.5 221.8C429.3 212.1 442.8 206.5 456.6 206.5L494.3 206.5L552.6 264.8C582.9 295.1 582.9 344.3 552.6 374.6L494.3 432.9L456.6 432.9C442.8 432.9 429.3 427.3 419.5 417.5L342.5 340.5C328.6 326.6 304.3 326.6 290.4 340.6L213.7 417.2C203.1 427 190.4 432.6 176.6 432.6L144.8 432.6L86.8 374.6C56.5 344.3 56.5 295.1 86.8 264.8L144.8 206.7L176.6 206.7z"/></svg>',
		card: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M512 176C520.8 176 528 183.2 528 192L528 224L112 224L112 192C112 183.2 119.2 176 128 176L512 176zM528 288L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 288L528 288zM128 128C92.7 128 64 156.7 64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192C576 156.7 547.3 128 512 128L128 128zM144 408C144 421.3 154.7 432 168 432L216 432C229.3 432 240 421.3 240 408C240 394.7 229.3 384 216 384L168 384C154.7 384 144 394.7 144 408zM288 408C288 421.3 298.7 432 312 432L376 432C389.3 432 400 421.3 400 408C400 394.7 389.3 384 376 384L312 384C298.7 384 288 394.7 288 408z"/></svg>',
		location: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>',
		menu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" focusable="false"><path d="M480 0H32A31.981 31.981 0 0 0 0 32V480A31.981 31.981 0 0 0 32 512H480A31.981 31.981 0 0 0 512 480V32A31.981 31.981 0 0 0 480 0ZM448 448H64V64H448Z"/><path d="M128 128H384V192H128zM128 224H384V288H128zM128 320H384V384H128z"/></svg>',
		clock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>',
		map: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M576 112C576 100.9 570.3 90.6 560.8 84.8C551.3 79 539.6 78.4 529.7 83.4L413.5 141.5L234.1 81.6C226 78.9 217.3 79.5 209.7 83.3L81.7 147.3C70.8 152.8 64 163.9 64 176L64 528C64 539.1 69.7 549.4 79.2 555.2C88.7 561 100.4 561.6 110.3 556.6L226.4 498.5L399.7 556.3C395.4 549.9 391.2 543.2 387.1 536.4C376.1 518.1 365.2 497.1 357.1 474.6L255.9 440.9L255.9 156.4L383.9 199.1L383.9 298.4C414.9 262.6 460.9 240 511.9 240C534.5 240 556.1 244.4 575.9 252.5L576 112zM512 288C445.7 288 392 340.8 392 405.9C392 474.8 456.1 556.3 490.6 595.2C502.2 608.2 521.9 608.2 533.5 595.2C568 556.3 632.1 474.8 632.1 405.9C632.1 340.8 578.4 288 512.1 288zM472 408C472 385.9 489.9 368 512 368C534.1 368 552 385.9 552 408C552 430.1 534.1 448 512 448C489.9 448 472 430.1 472 408z"/></svg>',
		gallery: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" focusable="false"><path d="M160 144C151.2 144 144 151.2 144 160L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 160C496 151.2 488.8 144 480 144L160 144zM96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM224 192C241.7 192 256 206.3 256 224C256 241.7 241.7 256 224 256C206.3 256 192 241.7 192 224C192 206.3 206.3 192 224 192zM360 264C368.5 264 376.4 268.5 380.7 275.8L460.7 411.8C465.1 419.2 465.1 428.4 460.8 435.9C456.5 443.4 448.6 448 440 448L200 448C191.1 448 182.8 443 178.7 435.1C174.6 427.2 175.2 417.6 180.3 410.3L236.3 330.3C240.8 323.9 248.1 320.1 256 320.1C263.9 320.1 271.2 323.9 275.7 330.3L292.9 354.9L339.4 275.9C343.7 268.6 351.6 264.1 360.1 264.1z"/></svg>',
		check: '<svg viewBox="0 0 24 24" fill="none" focusable="false"><path d="M5 12.5 9.5 17 19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	};

	function detailIconSvg(svg, className) {
		return `
			<span class="${className}" aria-hidden="true">
				${svg}
			</span>
		`;
	}

	function getHostingSummaryIcon(key) {
		return detailIconSvg(DETAIL_ICONS[key] || DETAIL_ICONS.type, 'detail__extra-summary-icon');
	}

	function getHostingAmenityIcon(label) {
		const normalized = String(label || '').toLowerCase();
		let icon = 'check';

		if (normalized.includes('wi-fi') || normalized.includes('wifi')) {
			icon = 'wifi';
		} else if (normalized.includes('estacionamento')) {
			icon = 'parking';
		} else if (normalized.includes('ar-condicionado')) {
			icon = 'air';
		} else if (normalized.includes('piscina')) {
			icon = 'pool';
		} else if (normalized.includes('cozinha') || normalized.includes('cafe') || normalized.includes('manha')) {
			icon = 'cuisine';
		} else if (normalized.includes('acessibilidade')) {
			icon = 'accessibility';
		} else if (normalized.includes('pets')) {
			icon = 'pets';
		} else if (normalized.includes('delivery')) {
			icon = 'delivery';
		} else if (normalized.includes('retirada')) {
			icon = 'pickup';
		} else if (normalized.includes('consumo') || normalized.includes('local')) {
			icon = 'cuisine';
		} else if (normalized.includes('pix')) {
			icon = 'pix';
		} else if (normalized.includes('cartao')) {
			icon = 'card';
		} else if (normalized.includes('dinheiro')) {
			icon = 'price';
		}

		return detailIconSvg(DETAIL_ICONS[icon], 'detail__extra-chip-icon');
	}

	function renderContactIcon(icon) {
		if (DETAIL_ICONS[icon]) {
			return detailIconSvg(DETAIL_ICONS[icon], 'detail__contact-icon');
		}

		const svg = String(icon || '').trim().startsWith('<svg')
			? icon
			: `<svg viewBox="0 0 24 24" fill="none" focusable="false">${icon}</svg>`;

		return detailIconSvg(svg, 'detail__contact-icon');
	}

	function formatWhatsappLabel(value) {
		let digits = String(value || '').replace(/\D/g, '');
		if (digits.length > 11 && digits.startsWith('55')) {
			digits = digits.slice(2);
		}

		if (digits.length === 11) {
			return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
		}

		if (digits.length === 10) {
			return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
		}

		return digits;
	}

	function formatWebsiteLabel(value) {
		const safeUrl = safeExternalUrl(value);
		if (safeUrl === '#') return '';

		try {
			const url = new URL(safeUrl);
			return url.hostname.replace(/^www\./, '');
		} catch {
			return '';
		}
	}

	function splitDetailLabels(value) {
		return String(value || '')
			.split(',')
			.map((label) => label.trim())
			.filter(Boolean);
	}

	function getHostingMapUrl(item) {
		const explicitUrl = safeExternalUrl(item.location?.url || '');
		if (explicitUrl !== '#') {
			return explicitUrl;
		}

		const locationLabel = item.location?.label || 'Pancas, ES';
		const query = [item.title, locationLabel].filter(Boolean).join(', ');
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
	}

	function renderHostingContactRow(type, label, href = '') {
		if (!label) return '';

		const icons = {
			location: 'location',
			phone: 'phone',
			instagram: 'instagram',
			website: 'website',
		};
		const content = href && safeExternalUrl(href) !== '#'
			? `<a href="${escapeHtml(safeExternalUrl(href))}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
			: escapeHtml(label);

		return `
			<li class="detail__contact-row">
				${renderContactIcon(icons[type] || 'location')}
				<span>${content}</span>
			</li>
		`;
	}

	function renderHostingContactHtml(item) {
		const extra = item.hostingExtra || {};
		const locationLabel = item.location?.label || 'Pancas, ES';
		const whatsappLabel = formatWhatsappLabel(item.whatsapp);
		const instagramLabel = item.social?.label || '';
		const instagramUrl = item.social?.url || '';
		const websiteLabel = formatWebsiteLabel(item.website);
		const dailyPrice = String(extra.mediaDiaria || '').trim();
		const reservationUrl = item.ticket?.url || extra.linkReserva || '';
		const mapUrl = getHostingMapUrl(item);

		return `
			<h3 class="detail__contact-title">CONTATO E LOCALIZAÇÃO</h3>
			<ul class="detail__contact-list">
				${renderHostingContactRow('location', locationLabel)}
				${renderHostingContactRow('phone', whatsappLabel, item.whatsapp)}
				${renderHostingContactRow('instagram', instagramLabel, instagramUrl)}
				${renderHostingContactRow('website', websiteLabel, item.website)}
			</ul>
			${dailyPrice || reservationUrl || mapUrl ? '<div class="detail__contact-divider"></div>' : ''}
			${dailyPrice ? `<p class="detail__contact-price">Diária média a partir de <strong>${escapeHtml(dailyPrice)}</strong></p>` : ''}
			<div class="detail__contact-actions">
				${safeExternalUrl(reservationUrl) !== '#' ? `
					<a class="detail__contact-reserve" href="${escapeHtml(safeExternalUrl(reservationUrl))}" target="_blank" rel="noopener noreferrer">
						${renderContactIcon('reservation')}
						Reservar hospedagem
					</a>
				` : ''}
				${safeExternalUrl(mapUrl) !== '#' ? `<a class="detail__contact-map-link" href="${escapeHtml(safeExternalUrl(mapUrl))}" target="_blank" rel="noopener noreferrer">Ver no mapa</a>` : ''}
			</div>
		`;
	}

	function renderGastronomyContactHtml(item) {
		const extra = item.gastronomyExtra || {};
		const locationLabel = item.location?.label || 'Pancas, ES';
		const whatsappLabel = formatWhatsappLabel(item.whatsapp);
		const instagramLabel = item.social?.label || '';
		const instagramUrl = item.social?.url || '';
		const menuUrl = item.ticket?.url || extra.linkCardapio || item.website || '';
		const menuLabel = formatWebsiteLabel(menuUrl) || 'Cardápio';
		const mapUrl = getHostingMapUrl(item);
		const hours = Array.isArray(item.hours)
			? item.hours
				.map((hour) => String(hour?.value || '').trim())
				.filter(Boolean)
				.join(', ')
			: '';

		return `
			<h3 class="detail__contact-title">CONTATO E LOCALIZAÇÃO</h3>
			<ul class="detail__contact-list">
				${renderHostingContactRow('location', locationLabel)}
				${renderHostingContactRow('phone', whatsappLabel, item.whatsapp)}
				${renderHostingContactRow('instagram', instagramLabel, instagramUrl)}
				${renderHostingContactRow('website', menuLabel, menuUrl)}
			</ul>
			${hours || menuUrl || mapUrl ? '<div class="detail__contact-divider"></div>' : ''}
			${hours ? `
				<div class="detail__contact-hours">
					<span class="detail__contact-hours-label">Horário de funcionamento</span>
					<p>${escapeHtml(hours)}</p>
				</div>
			` : ''}
			<div class="detail__contact-actions">
				${safeExternalUrl(menuUrl) !== '#' ? `
					<a class="detail__contact-reserve" href="${escapeHtml(safeExternalUrl(menuUrl))}" target="_blank" rel="noopener noreferrer">
						${renderContactIcon('menu')}
						Ver cardápio
					</a>
				` : ''}
				${safeExternalUrl(mapUrl) !== '#' ? `<a class="detail__contact-map-link" href="${escapeHtml(safeExternalUrl(mapUrl))}" target="_blank" rel="noopener noreferrer">Ver no mapa</a>` : ''}
			</div>
		`;
	}

	function renderHostingMapCard(item) {
		const locationLabel = item.location?.label || 'Pancas, ES';
		const mapUrl = getHostingMapUrl(item);
		const card = document.createElement('div');
		card.className = 'detail__map-card';

		const mapContent = safeExternalUrl(mapUrl) !== '#'
			? `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(item.title + ', ' + locationLabel)}&t=&z=15&ie=UTF8&iwloc=&output=embed" class="detail__map-frame" allowfullscreen="" loading="lazy" title="Mapa de localização de ${escapeHtml(item.title)}"></iframe>`
			: '<div class="detail__map-placeholder">Mapa</div>';

		card.innerHTML = `
			${mapContent}
			<p class="detail__map-caption">Localização aproximada · ${escapeHtml(locationLabel)}</p>
		`;

		return card;
	}

	function renderHostingIntroActions(item) {
		const reservationUrl = safeExternalUrl(item.ticket?.url || item.hostingExtra?.linkReserva || '');
		const whatsappUrl = safeExternalUrl(item.whatsapp || '');
		const actions = [];

		if (reservationUrl !== '#') {
			actions.push(`
				<a class="detail__info-button detail__info-button--primary" href="${escapeHtml(reservationUrl)}" target="_blank" rel="noopener noreferrer">
					${renderContactIcon('reservation')}
					Reservar hospedagem
				</a>
			`);
		}

		if (whatsappUrl !== '#') {
			actions.push(`
				<a class="detail__info-button detail__info-button--secondary" href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer">
					${renderContactIcon('phone')}
					Falar no WhatsApp
				</a>
			`);
		}

		return actions.length > 0 ? `<div class="detail__info-actions">${actions.join('')}</div>` : '';
	}

	function renderGastronomyIntroActions(item) {
		const menuUrl = safeExternalUrl(item.ticket?.url || item.gastronomyExtra?.linkCardapio || item.website || '');
		const whatsappUrl = safeExternalUrl(item.whatsapp || '');
		const actions = [];

		if (menuUrl !== '#') {
			actions.push(`
				<a class="detail__info-button detail__info-button--primary" href="${escapeHtml(menuUrl)}" target="_blank" rel="noopener noreferrer">
					${renderContactIcon('menu')}
					Ver cardápio
				</a>
			`);
		}

		if (whatsappUrl !== '#') {
			actions.push(`
				<a class="detail__info-button detail__info-button--secondary" href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer">
					${renderContactIcon('phone')}
					Falar no WhatsApp
				</a>
			`);
		}

		return actions.length > 0 ? `<div class="detail__info-actions">${actions.join('')}</div>` : '';
	}

	function renderHostingExtraSection(item) {
		if (!item.hostingExtra || typeof item.hostingExtra !== 'object') {
			return null;
		}

		const extra = item.hostingExtra;
		const summaryItems = [
			['type', 'Tipo de hospedagem', extra.tipo],
			['price', 'Faixa de preço', extra.faixaPreco],
			['daily', 'Média de diária', extra.mediaDiaria],
			['checkin', 'Check-in', extra.checkin],
			['checkout', 'Check-out', extra.checkout],
		].filter(([, , value]) => String(value ?? '').trim() !== '');

		const amenities = Array.isArray(item.amenities)
			? item.amenities
				.map((amenity) => String(amenity?.label || '').trim())
				.filter(Boolean)
			: [];
		const observation = String(extra.observacoesUteis || '').trim();

		if (summaryItems.length === 0 && amenities.length === 0 && !observation) {
			return null;
		}

		const section = document.createElement('section');
		section.className = 'detail__extra-section';
		section.innerHTML = `
			<div class="detail__extra-header">
				<p class="detail__extra-eyebrow">Hospedagem</p>
				<h2 class="detail__extra-title">Detalhes da estadia</h2>
				<p class="detail__extra-intro">Informações cadastradas para ajudar no planejamento antes do contato direto.</p>
			</div>
			${summaryItems.length > 0 ? `
				<div class="detail__extra-summary">
					${summaryItems.map(([iconKey, label, value]) => `
						<div class="detail__extra-summary-item">
							${getHostingSummaryIcon(iconKey)}
							<div>
								<span class="detail__extra-summary-label">${escapeHtml(label)}</span>
								<strong class="detail__extra-summary-value">${escapeHtml(value)}</strong>
							</div>
						</div>
					`).join('')}
				</div>
			` : ''}
			${amenities.length > 0 ? `
				<div class="detail__extra-feature-group">
					<h3 class="detail__extra-subtitle">Comodidades e diferenciais</h3>
					<div class="detail__extra-chips">
						${amenities.map((label) => `<span class="detail__extra-chip">${getHostingAmenityIcon(label)}${escapeHtml(label)}</span>`).join('')}
					</div>
				</div>
			` : ''}
			${observation ? `
				<div class="detail__extra-note">
					<span class="detail__extra-note-label">Observação útil</span>
					<p>${escapeHtml(observation)}</p>
				</div>
			` : ''}
		`;

		return section;
	}

	function renderGastronomyExtraSection(item) {
		if (!item.gastronomyExtra || typeof item.gastronomyExtra !== 'object') {
			return null;
		}

		const extra = item.gastronomyExtra;
		const summaryItems = [
			['cuisine', 'Tipo de cozinha', extra.tipoCozinha],
			['price', 'Faixa de preço', extra.faixaPreco],
			['meals', 'Refeições', extra.refeicoes],
			['reservation', 'Aceita reserva', extra.aceitaReserva],
		].filter(([, , value]) => String(value ?? '').trim() !== '');
		const services = splitDetailLabels(extra.servicos);
		const payments = splitDetailLabels(extra.formasPagamento);
		const observation = String(extra.observacoesUteis || '').trim();

		if (summaryItems.length === 0 && services.length === 0 && payments.length === 0 && !observation) {
			return null;
		}

		const section = document.createElement('section');
		section.className = 'detail__extra-section';
		section.innerHTML = `
			<div class="detail__extra-header">
				<p class="detail__extra-eyebrow">Gastronomia</p>
				<h2 class="detail__extra-title">Dados gastronômicos</h2>
				<p class="detail__extra-intro">Informações práticas para planejar a sua refeição antes do contato direto.</p>
			</div>
			${summaryItems.length > 0 ? `
				<div class="detail__extra-summary detail__extra-summary--compact">
					${summaryItems.map(([iconKey, label, value]) => `
						<div class="detail__extra-summary-item">
							${getHostingSummaryIcon(iconKey)}
							<div>
								<span class="detail__extra-summary-label">${escapeHtml(label)}</span>
								<strong class="detail__extra-summary-value">${escapeHtml(value)}</strong>
							</div>
						</div>
					`).join('')}
				</div>
			` : ''}
			${services.length > 0 ? `
				<div class="detail__extra-feature-group">
					<h3 class="detail__extra-subtitle">Serviços</h3>
					<div class="detail__extra-chips">
						${services.map((label) => `<span class="detail__extra-chip">${getHostingAmenityIcon(label)}${escapeHtml(label)}</span>`).join('')}
					</div>
				</div>
			` : ''}
			${payments.length > 0 ? `
				<div class="detail__extra-feature-group">
					<h3 class="detail__extra-subtitle">Formas de pagamento</h3>
					<div class="detail__extra-chips">
						${payments.map((label) => `<span class="detail__extra-chip">${getHostingAmenityIcon(label)}${escapeHtml(label)}</span>`).join('')}
					</div>
				</div>
			` : ''}
			${observation ? `
				<div class="detail__extra-note">
					<span class="detail__extra-note-label">Observações úteis</span>
					<p>${escapeHtml(observation)}</p>
				</div>
			` : ''}
		`;

		return section;
	}

	function renderTemporaryExtraCard(item, type) {
		const linkRow = (label, url, text) => {
			const safeUrl = safeExternalUrl(url);
			return safeUrl !== '#'
				? [label, `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`]
				: null;
		};

		const configs = {
			'servicos': {
				title: 'Dados cadastrados do serviço',
				extra: item.serviceExtra,
				rows: (extra) => [
					['Tipo de serviço', extra.tipoServico],
					['Área de atendimento', extra.areaAtendimento],
					['Formas de atendimento', extra.formasAtendimento],
					['Aceita agendamento', extra.aceitaAgendamento],
					['Atendimento 24h', extra.atendimento24h],
					['Formas de pagamento', extra.formasPagamento],
					['Observações úteis', extra.observacoesUteis],
					linkRow('Link do serviço', extra.linkServico, 'Abrir serviço'),
				],
			},
			'experiencias': {
				title: 'Dados cadastrados da experiência',
				extra: item.experienceExtra,
				rows: (extra) => [
					['Tipo de experiência', extra.tipoExperiencia],
					['Nível de dificuldade', extra.nivelDificuldade],
					['Duração média', extra.duracaoMedia],
					['Melhor período', extra.melhorPeriodo],
					['Público indicado', extra.publicoIndicado],
					['Estrutura disponível', extra.estruturaDisponivel],
					['Agendamento obrigatório', extra.agendamentoObrigatorio],
					['Entrada gratuita', extra.entradaGratuita],
					['Preço base', extra.precoBase],
					['Observações úteis', extra.observacoesUteis],
					linkRow('Link de informações', extra.linkInformacoes, 'Abrir informações'),
				],
			},
		};

		const config = configs[type];
		if (!config || !config.extra || typeof config.extra !== 'object') {
			return null;
		}

		const rows = config.rows(config.extra)
			.filter(Boolean)
			.filter(([, value]) => String(value ?? '').trim() !== '');

		if (rows.length === 0) {
			return null;
		}

		const card = document.createElement('div');
		card.className = 'detail__card';
		card.innerHTML = `
			<h3 class="detail__card-title">${escapeHtml(config.title)}</h3>
			<ul class="detail__meta-list">
				${rows.map(([label, value]) => `
					<li class="detail__meta-item">
						<div>
							<div class="detail__meta-label">${escapeHtml(label)}</div>
							<div class="detail__meta-value">${String(value).includes('<a ') ? value : escapeHtml(value)}</div>
						</div>
					</li>
				`).join('')}
			</ul>
		`;

		return card;
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
		const detailMeta = getDetailTypeMeta(type);
		const hasWideHeroMedia = type === 'onde-ficar' || type === 'onde-comer' || type === 'servicos';
		renderBreadcrumb(item, type);

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
		descTitle.textContent = detailMeta.aboutLabel;

		const descText = document.createElement('p');
		descText.className = 'detail__description-text';
		descText.textContent = item.description;

		if (type === 'onde-ficar' || type === 'onde-comer') {
			textCard.classList.add('detail__info-content--featured');

			const eyebrow = document.createElement('p');
			eyebrow.className = 'detail__info-eyebrow';
			eyebrow.textContent = type === 'onde-ficar' ? 'HOSPEDAGEM EM PANCAS' : 'GASTRONOMIA EM PANCAS';

			const specialty = document.createElement('p');
			specialty.className = 'detail__info-specialty';
			specialty.textContent = item.specialty || detailMeta.singular;

			const locationLine = document.createElement('p');
			locationLine.className = 'detail__info-location';
			locationLine.innerHTML = `
				${renderContactIcon('location')}
				${escapeHtml(item.location?.label || 'Pancas, ES')}
			`;

			const actions = document.createElement('div');
			actions.innerHTML = type === 'onde-ficar'
				? renderHostingIntroActions(item)
				: renderGastronomyIntroActions(item);

			textCard.append(eyebrow, titleElement);
			if (type === 'onde-comer' && specialty.textContent.trim()) {
				textCard.append(specialty);
			}
			textCard.append(locationLine, descText);
			if (actions.firstElementChild) {
				textCard.append(actions.firstElementChild);
			}
		} else {
			textCard.append(titleElement, descTitle, descText);
		}

		// Galeria de Fotos / Imagem principal
		const rawPhotos = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos : (item.image ? [item.image] : []);
		const photos = rawPhotos.map(safeImageSrc).filter(Boolean);
		const heroMedia = document.createElement('div');
		heroMedia.className = 'detail__hero-media';
		
		if (photos.length > 0) {
			const mainImageWrapper = document.createElement('div');
			mainImageWrapper.className = 'detail__main-image-wrapper';
			if (hasWideHeroMedia) {
				mainImageWrapper.classList.add('detail__main-image-wrapper--wide');
			}

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

			const mediaTarget = hasWideHeroMedia ? heroMedia : leftCol;
			mediaTarget.appendChild(mainImageWrapper);

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
				mediaTarget.appendChild(galleryWrapper);
			}
		}

		leftCol.appendChild(textCard);

		if (type === 'onde-ficar') {
			const hostingExtraSection = renderHostingExtraSection(item);
			if (hostingExtraSection) {
				leftCol.appendChild(hostingExtraSection);
			}
		} else if (type === 'onde-comer') {
			const gastronomyExtraSection = renderGastronomyExtraSection(item);
			if (gastronomyExtraSection) {
				leftCol.appendChild(gastronomyExtraSection);
			}
		}

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
					${item.price ? `
						<li class="detail__meta-item">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="detail__meta-icon">
								<path d="M64 64C28.7 64 0 92.7 0 128v64c0 8.8 7.2 16 16 16c26.5 0 48 21.5 48 48s-21.5 48-48 48c-8.8 0-16 7.2-16 16v64c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64v-64c0-8.8-7.2-16-16-16c-26.5 0-48-21.5-48-48s21.5-48 48-48c8.8 0 16-7.2 16-16v-64c0-35.3-28.7-64-64-64H64zm64 96h320v192H128V160z"/>
							</svg>
							<div>
								<div class="detail__meta-label">Valor base</div>
								<div class="detail__meta-value">${escapeHtml(item.price)}</div>
							</div>
						</li>
					` : ''}
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
			infoCard.classList.add('detail__contact-card');
			infoHtml = renderHostingContactHtml(item);
		} else if (type === 'onde-comer') {
			infoCard.classList.add('detail__contact-card');
			infoHtml = renderGastronomyContactHtml(item);
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

		if (type === 'onde-ficar' || type === 'onde-comer') {
			rightCol.appendChild(renderHostingMapCard(item));
		}

		const temporaryExtraCard = renderTemporaryExtraCard(item, type);
		if (temporaryExtraCard) {
			rightCol.appendChild(temporaryExtraCard);
		}

		// Card de Comodidades / Destaques
		if (type !== 'onde-ficar' && type !== 'onde-comer' && item.amenities && item.amenities.length > 0) {
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
		if (type === 'onde-comer' && item.hours && item.hours.length > 0 && !infoCard.classList.contains('detail__contact-card')) {
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
		if (type !== 'onde-ficar' && type !== 'onde-comer' && ((item.ticket && item.ticket.url && item.ticket.url !== 'null') || (item.social && item.social.url && item.social.url !== 'null') || (item.whatsapp && item.whatsapp !== 'null'))) {
			const contactCard = document.createElement('div');
			contactCard.className = 'detail__card';

			const contactTitle = document.createElement('h3');
			contactTitle.className = 'detail__card-title';
			contactTitle.textContent = 'Contato e Informações';

			const ctasWrapper = document.createElement('div');
			ctasWrapper.className = 'detail__ctas';

			if (item.ticket && item.ticket.url && item.ticket.url !== 'null') {
				const ticketBtn = document.createElement('a');
				ticketBtn.href = safeExternalUrl(item.ticket.url);
				ticketBtn.target = '_blank';
				ticketBtn.rel = 'noopener noreferrer';
				ticketBtn.className = 'detail__cta-btn detail__cta-btn--ticket';
				ticketBtn.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="detail__cta-icon">
						<path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128H466.7L265.4 329.4C252.9 341.9 252.9 362.2 265.4 374.7C277.9 387.2 298.2 387.2 310.7 374.7L512 173.3V256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256V96C576 78.3 561.7 64 544 64H384zM144 160C99.8 160 64 195.8 64 240V496C64 540.2 99.8 576 144 576H400C444.2 576 480 540.2 480 496V416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416V496C416 504.8 408.8 512 400 512H144C135.2 512 128 504.8 128 496V240C128 231.2 135.2 224 144 224H224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160H144z"/>
					</svg>
					${escapeHtml(item.ticket.label || 'Ingressos e informações')}
				`;
				ctasWrapper.appendChild(ticketBtn);
			}

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

		if (hasWideHeroMedia && heroMedia.children.length > 0) {
			container.replaceChildren(heroMedia, leftCol, rightCol);
		} else {
			container.replaceChildren(leftCol, rightCol);
		}
	}

	async function fetchItemDetails() {
		const { type, id } = getUrlParams();
		if (!type) {
			renderStatus('Tipo de item inválido.', true, 'evento');
			return;
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
