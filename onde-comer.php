<?php
$pageTitle = 'Onde Comer | ATURP - Pancas, ES';
$customCss = ['./css/directory-cards.css', './css/onde-comer.css'];
$headerStartsTransparent = true;
include 'includes/header.php';
?>

		<section class="food-hero" aria-labelledby="food-hero-title">
			<div class="food-hero__content layout-container">
				<p class="eyebrow eyebrow--on-dark">Sabores de Pancas</p>
				<h1 id="food-hero-title" class="food-hero__title section-title--on-dark">Onde comer em Pancas</h1>
				<p class="food-hero__description">
					Encontre restaurantes, cafés e lanchonetes para cada momento do dia, com opções
					que combinam comida regional, pausas rápidas e experiências mais acolhedoras.
				</p>
			</div>
		</section>

		<main class="directory-page food-page">
			<?php
			$breadcrumbs = [
				['label' => 'Inicio', 'url' => './index.php'],
				['label' => 'Onde comer'],
			];
			include 'includes/breadcrumb.php';
			?>
			<section id="food-list" class="directory-section" aria-labelledby="food-directory-title">
				<div class="layout-container">
					<div class="directory-section__intro">
						<h2 id="food-directory-title" class="section-title">Escolha o lugar certo para cada refeição</h2>
					</div>

					<div class="food-filter-groups">
						<div class="food-filter-group" role="group" aria-label="Filtrar estabelecimentos por momento da refeição">
							<p class="food-filter-group__title">Momento da refeição</p>
							<div class="directory-filters">
								<button type="button" class="directory-filter is-active" data-meal-filter="all" aria-pressed="true">Todos</button>
								<button type="button" class="directory-filter" data-meal-filter="cafe-da-manha" aria-pressed="false">Café da manhã</button>
								<button type="button" class="directory-filter" data-meal-filter="almoco" aria-pressed="false">Almoço</button>
								<button type="button" class="directory-filter" data-meal-filter="jantar" aria-pressed="false">Jantar</button>
								<button type="button" class="directory-filter" data-meal-filter="lanches" aria-pressed="false">Lanches</button>
							</div>
						</div>

						<div class="food-filter-group" role="group" aria-label="Filtrar estabelecimentos por tipo">
							<p class="food-filter-group__title">Tipo de estabelecimento</p>
							<div class="directory-filters">
								<button type="button" class="directory-filter is-active" data-type-filter="all" aria-pressed="true">Todos</button>
								<button type="button" class="directory-filter" data-type-filter="restaurante" aria-pressed="false">Restaurantes</button>
								<button type="button" class="directory-filter" data-type-filter="cafe" aria-pressed="false">Cafés</button>
								<button type="button" class="directory-filter" data-type-filter="lanchonete" aria-pressed="false">Lanchonetes</button>
							</div>
						</div>
					</div>

					<div class="directory-grid" data-directory-grid role="list" aria-live="polite" aria-busy="true"></div>
				</div>
			</section>
		</main>

<?php
$customJs = ['./js/onde-comer.js'];
include 'includes/footer.php';
?>
