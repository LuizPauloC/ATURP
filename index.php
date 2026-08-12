<?php
$pageTitle = 'Pancas Guia Turístico';
$customCss = ['css/index.css'];
$headerStartsTransparent = true;
require_once __DIR__ . '/includes/security.php';
include 'includes/header.php';
?>

<section class="hero" aria-labelledby="hero-title">
			<div class="hero__content layout-container">
				<h1 id="hero-title">Venha conhecer<br />Pancas</h1>
				<p>
					Descubra as formações rochosas mais impressionantes do Espírito Santo. Aventura, gastronomia e natureza
					em um só destino.
				</p>
				<div class="hero__actions">
					<a href="./o-que-fazer.php" class="hero__button hero__button--primary btn">
						<img src="assets/icons/compass-navigation.png" alt="" class="btn-icon" />
						Explorar Aventuras
					</a>
					<a href="./onde-ficar.php" class="hero__button hero__button--secondary btn">Planejar Estadia</a>
				</div>
				<div class="hero__scroll-indicator" aria-hidden="true">
					<img src="assets/icons/arrow-down-scroll.png" alt="" aria-hidden="true" class="down-arrow" />
				</div>
			</div>
		</section>

		<main>
			<section id="fast-guide" class="fast-guide">
				<div class="layout-container">
					<hgroup>
						<p class="eyebrow">Guia Rápido</p>
						<h2 class="section-title">
							Chegou em Pancas?<br />
							<span>Comece por aqui.</span>
						</h2>
					</hgroup>
					<div class="tiles-grid">
						<a
							href="./onde-ficar.php"
							class="guide-tile"
							aria-label="Ir para os contatos úteis e planejar sua estadia"
						>
							<div class="tile-icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" aria-hidden="true">
									<path
										d="M32 32c17.7 0 32 14.3 32 32l0 224 224 0 0-128c0-17.7 14.3-32 32-32l160 0c53 0 96 43 96 96l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64-448 0 0 64c0 17.7-14.3 32-32 32S0 465.7 0 448L0 64C0 46.3 14.3 32 32 32zm80 160a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"
									/>
								</svg>
							</div>
							<div class="tile-content">
								<h3>Onde Ficar</h3>
								<p>Pousadas, hotéis e camping</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
								class="right-arrow"
								aria-hidden="true"
							>
								<path
									d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
								/>
							</svg>
						</a>
						<a
							href="./onde-comer.php"
							class="guide-tile"
							aria-label="Ir para a página de gastronomia e planejar onde comer"
						>
							<div class="tile-icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
									<path
										d="M63.9 14.4C63.1 6.2 56.2 0 48 0s-15.1 6.2-16 14.3L17.9 149.7c-1.3 6-1.9 12.1-1.9 18.2 0 45.9 35.1 83.6 80 87.7L96 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7 0-6.1-.6-12.2-1.9-18.2L223.9 14.3C223.1 6.2 216.2 0 208 0s-15.1 6.2-15.9 14.4L178.5 149.9c-.6 5.7-5.4 10.1-11.1 10.1-5.8 0-10.6-4.4-11.2-10.2L143.9 14.6C143.2 6.3 136.3 0 128 0s-15.2 6.3-15.9 14.6L99.8 149.8c-.5 5.8-5.4 10.2-11.2 10.2-5.8 0-10.6-4.4-11.1-10.1L63.9 14.4zM448 0C432 0 320 32 320 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-448c0-17.7-14.3-32-32-32z"
									/>
								</svg>
							</div>
							<div class="tile-content">
								<h3>Onde Comer</h3>
								<p>Culinária capixaba e sabores da terra</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
								class="right-arrow"
								aria-hidden="true"
							>
								<path
									d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
								/>
							</svg>
						</a>
						<a href="./o-que-fazer.php" class="guide-tile" aria-label="Ir para a página de o que fazer">
							<div class="tile-icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
									<path
										d="M256.5 0c14.7 0 28.2 8.1 35.2 21l216 400c6.7 12.4 6.4 27.4-.8 39.5-7.2 12.1-20.3 19.5-34.3 19.5l-432 0c-14.1 0-27.1-7.4-34.3-19.5s-7.5-27.1-.8-39.5l216-400 2.9-4.6C231.7 6.2 243.6 0 256.5 0zM170.4 249.9l26.8 26.8c6.2 6.2 16.4 6.2 22.6 0l43.3-43.3c6-6 14.1-9.4 22.6-9.4l42.8 0-72.1-133.5-86.1 159.4z"
									/>
								</svg>
							</div>
							<div class="tile-content">
								<h3>O que Fazer</h3>
								<p>Experiências, eventos e outros</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
								class="right-arrow"
								aria-hidden="true"
							>
								<path
									d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
								/>
							</svg>
						</a>
						<a href="./servicos.php" class="guide-tile" aria-label="Ir para a página de serviços">
							<div class="tile-icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
									<path
										d="M240 120L240 160L400 160L400 120C400 115.6 396.4 112 392 112L248 112C243.6 112 240 115.6 240 120zM192 160L192 120C192 89.1 217.1 64 248 64L392 64C422.9 64 448 89.1 448 120L448 160L476.1 160C488.8 160 501 165.1 510 174.1L561.9 226C570.9 235 576 247.2 576 259.9L576 336L440 336L440 320C440 306.7 429.3 296 416 296C402.7 296 392 306.7 392 320L392 336L248 336L248 320C248 306.7 237.3 296 224 296C210.7 296 200 306.7 200 320L200 336L64 336L64 259.9C64 247.2 69.1 235 78.1 226L130 174.1C139 165.1 151.2 160 163.9 160L192 160zM64 480L64 384L200 384L200 400C200 413.3 210.7 424 224 424C237.3 424 248 413.3 248 400L248 384L392 384L392 400C392 413.3 402.7 424 416 424C429.3 424 440 413.3 440 400L440 384L576 384L576 480C576 515.3 547.3 544 512 544L128 544C92.7 544 64 515.3 64 480z"
									/>
								</svg>
							</div>
							<div class="tile-content">
								<h3>Serviços</h3>
								<p>Encontre serviços locais úteis para visitantes e moradores.</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
								class="right-arrow"
								aria-hidden="true"
							>
								<path
									d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
								/>
							</svg>
						</a>
						<a href="./guia-rapido.php" class="guide-tile" aria-label="Ir para a página de guia rápido">
							<div class="tile-icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" aria-hidden="true">
									<path
										d="M576 48c0-11.1-5.7-21.4-15.2-27.2s-21.2-6.4-31.1-1.4L413.5 77.5 234.1 17.6c-8.1-2.7-16.8-2.1-24.4 1.7l-128 64C70.8 88.8 64 99.9 64 112l0 352c0 11.1 5.7 21.4 15.2 27.2s21.2 6.4 31.1 1.4l116.1-58.1 173.3 57.8c-4.3-6.4-8.5-13.1-12.6-19.9-11-18.3-21.9-39.3-30-61.8l-101.2-33.7 0-284.5 128 42.7 0 99.3c31-35.8 77-58.4 128-58.4 22.6 0 44.2 4.4 64 12.5L576 48zM512 224c-66.3 0-120 52.8-120 117.9 0 68.9 64.1 150.4 98.6 189.3 11.6 13 31.3 13 42.9 0 34.5-38.9 98.6-120.4 98.6-189.3 0-65.1-53.7-117.9-120-117.9zM472 344a40 40 0 1 1 80 0 40 40 0 1 1 -80 0z"
									/>
								</svg>
							</div>
							<div class="tile-content">
								<h3>Guia Rápido</h3>
								<p>Contatos e informações úteis</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
								class="right-arrow"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
								class="right-arrow"
								aria-hidden="true"
							>
								<path
									d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
								/>
							</svg>
						</a>
					</div>
				</div>
			</section>

			<section class="events-section">
				<div class="layout-container">
					<hgroup>
						<p class="eyebrow">Agenda</p>
						<h2 class="section-title">Eventos</h2>
					</hgroup>

					<div
						class="events-section__calendar-grid"
						data-events-grid
						role="list"
						aria-live="polite"
						aria-busy="true"
					>
						<p class="directory-grid__status" style="color: #777; padding: 20px">Carregando eventos..</p>
					</div>
				</div>
			</section>

			<section id="gallery" class="gallery">
				<div class="layout-container">
					<hgroup>
						<p class="eyebrow">Fotos da cidade</p>
						<h2 class="section-title">Galeria</h2>
					</hgroup>
					<div class="gallery-grid">
						<?php
						require_once __DIR__ . '/config/database.php';
						$pdoGaleria = getDbConnection();
						$stmtGaleria = $pdoGaleria->query("
							SELECT id, url_imagem, legenda
							FROM fotos
							WHERE entidade_tipo = 'galeria_global'
							AND ordem BETWEEN 10 AND 70
							ORDER BY ordem ASC, id DESC
							LIMIT 7
						");
						$fotosHome = $stmtGaleria->fetchAll();
						$hasAssignedGalleryCovers = !empty($fotosHome);
						if (!$hasAssignedGalleryCovers) {
							$stmtGaleria = $pdoGaleria->query("
								SELECT id, url_imagem, legenda
								FROM fotos
								WHERE entidade_tipo = 'galeria_global'
								AND ordem <= 0
								ORDER BY ordem ASC, id DESC
								LIMIT 7
							");
							$fotosHome = $stmtGaleria->fetchAll();
						}
						$renderedHomePhotos = 0;
						$invalidHomePhotos = 0;
						
						if(empty($fotosHome)) {
							echo "<p style='color: #888;'>Nenhuma foto disponível no momento.</p>";
						} else {
							foreach($fotosHome as $foto) {
								$imgUrl = aturpPublicImageSrc($foto['url_imagem'] ?? '');
								if (!$imgUrl) {
									$invalidHomePhotos++;
									continue;
								}

								$renderedHomePhotos++;
								$imgUrl = aturpHtml($imgUrl);
								$alt = aturpHtml($foto['legenda']);
								echo "<div class='gallery-item'><img src='{$imgUrl}' alt='{$alt}' loading='lazy'></div>";
							}
						}

						if ($invalidHomePhotos > 0) {
							error_log('[ATURP] index.php ignorou ' . $invalidHomePhotos . ' foto(s) da home com caminho invalido ou arquivo ausente.');
						}

						if (!empty($fotosHome) && $renderedHomePhotos === 0) {
							echo "<p style='color: #888;'>Nenhuma foto disponÃ­vel no momento.</p>";
						}
						?>
					</div>
					<a type="button" class="gallery__btn" href="./galeria.php">
						<span>Ver todas as fotos</span>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="right-arrow" aria-hidden="true">
							<path
								d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
							/>
						</svg>
					</a>
				</div>
			</section>
		</main>

<?php
$customJs = ['./js/eventos.js'];
include 'includes/footer.php';
?>
