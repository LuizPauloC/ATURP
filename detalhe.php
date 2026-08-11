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
