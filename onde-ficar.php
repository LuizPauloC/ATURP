<?php
$pageTitle = 'Onde Ficar | ATURP - Pancas, ES';
$customCss = ['./css/directory-cards.css', './css/onde-ficar.css'];
include 'includes/header.php';
?>

		<section class="stay-hero" aria-labelledby="stay-hero-title">
			<div class="stay-hero__content layout-container">
				<p class="eyebrow eyebrow--on-dark">Planeje sua estadia</p>
				<h1 id="stay-hero-title" class="stay-hero__title section-title--on-dark">Onde ficar em Pancas</h1>
				<p class="stay-hero__description">
					Escolha entre pousadas e campings para ficar perto dos principais atrativos e viver Pancas
					com mais conforto, praticidade e vista para os Pontões.
				</p>
			</div>
		</section>

		<main class="directory-page stay-page">
			<section id="stay-list" class="directory-section" aria-labelledby="stay-directory-title">
				<div class="layout-container">
					<div class="directory-section__intro">
						<h2 id="stay-directory-title" class="section-title">Encontre a base ideal para explorar a região</h2>
					</div>

					<div class="directory-filters" role="group" aria-label="Filtrar hospedagens por categoria">
						<button type="button" class="directory-filter is-active" data-filter="all" aria-pressed="true">Todos</button>
						<button type="button" class="directory-filter" data-filter="pousada" aria-pressed="false">Pousada</button>
						<button type="button" class="directory-filter" data-filter="camping" aria-pressed="false">Camping</button>
					</div>

					<div class="directory-grid" data-directory-grid role="list" aria-live="polite" aria-busy="true"></div>
				</div>
			</section>
		</main>

<?php
$customJs = ['./js/onde-ficar.js'];
include 'includes/footer.php';
?>
