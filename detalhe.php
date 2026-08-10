<?php
$pageTitle = 'Detalhes | ATURP - Pancas, ES';
$customCss = ['./css/detalhe.css'];
include 'includes/header.php';
?>

<main class="main-content detail-page-main">
			<nav class="detail-breadcrumb layout-container" data-detail-breadcrumb aria-label="Caminho da pagina">
				<a href="./index.php" class="detail-breadcrumb__link">Inicio</a>
				<span class="detail-breadcrumb__separator" aria-hidden="true">/</span>
				<span class="detail-breadcrumb__current">Carregando...</span>
			</nav>

			<div class="back-link-container layout-container">
				<a href="./o-que-fazer.php" class="back-link">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="back-link__icon">
						<path
							d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
						/>
					</svg>
					Voltar para O que fazer
				</a>
			</div>

			<section class="detail-section">
				<div class="layout-container detail-grid" data-detail-container>
					<!-- Content will be injected dynamically via JS -->
					<div class="detail-loading-status">
						<p>Carregando detalhes...</p>
					</div>
				</div>
			</section>

			<!-- Lightbox Modal para imagem expandida -->
			<dialog id="lightbox-dialog" class="lightbox-dialog">
				<button type="button" class="lightbox-dialog__backdrop-closer" aria-label="Fechar imagem"></button>

				<div class="lightbox-dialog__container">
					<button type="button" class="lightbox-dialog__close" aria-label="Fechar imagem">
						&times;
					</button>

					<button type="button" class="lightbox-dialog__arrow lightbox-dialog__arrow--prev" aria-label="Imagem anterior">
						&lsaquo;
					</button>

					<div class="lightbox-dialog__content">
						<img class="lightbox-dialog__image" src="" alt="Imagem ampliada" />
						<p class="lightbox-dialog__caption"></p>
					</div>

					<button type="button" class="lightbox-dialog__arrow lightbox-dialog__arrow--next" aria-label="Próxima imagem">
						&rsaquo;
					</button>
				</div>
			</dialog>
		</main>

<?php
$customJs = ['./js/detalhe.js'];
include 'includes/footer.php';
?>
