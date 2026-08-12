<?php
if (!headers_sent()) {
	header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
	header('Pragma: no-cache');
	header('Expires: 0');
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/security.php';
$pdo = getDbConnection();

$pageTitle = 'O que fazer | ATURP - Pancas, ES';
$customCss = ['./css/o-que-fazer.css'];
$headerStartsTransparent = true;
include 'includes/header.php';
?>

<section class="page-hero" aria-labelledby="page-hero-title">
			<div class="page-hero__content layout-container">
				<p class="eyebrow eyebrow--on-dark">Viva aventuras</p>
				<h1 id="page-hero-title" class="page-hero__title section-title--on-dark">O que fazer em Pancas?</h1>
				<p class="page-hero__description">
					Veja tudo o que Pancas tem a oferecer. Escolha aventuras incríveis de tirar o fólego! Viver está nos
					pequenos momentos que colecionamos a cada dia!
				</p>
			</div>
		</section>

		<main class="main-content">
			<?php
			$breadcrumbs = [
				['label' => 'Início', 'url' => './index.php'],
				['label' => 'O que fazer'],
			];
			include 'includes/breadcrumb.php';
			?>
			<section class="discover-section">
				<div class="layout-container">
					<hgroup>
						<p class="eyebrow">Descubra</p>
						<h2 class="section-title">O que fazer em Pancas</h2>
					</hgroup>

					<div class="discover-section__featured-group">
						<article class="featured-card featured-card--experiencias">
							<a href="./categoria.php?cat=experiencias" class="featured-card__link">
								<div class="featured-card__overlay">
									<h3 class="featured-card__title">Experiências</h3>
								</div>
							</a>
						</article>

						<article class="featured-card featured-card--eventos">
							<a href="./eventos.php" class="featured-card__link">
								<div class="featured-card__overlay">
									<h3 class="featured-card__title">Eventos</h3>
								</div>
							</a>
						</article>

						<article class="featured-card featured-card--outros">
							<a href="#categories-section" data-scroll="#categories-section" class="featured-card__link">
								<div class="featured-card__overlay">
									<h3 class="featured-card__title">Outros</h3>
								</div>
							</a>
						</article>
					</div>
				</div>
			</section>

			<section class="events-section">
				<div class="layout-container">
					<hgroup>
						<p class="eyebrow">Agenda</p>
						<h2 class="section-title">Eventos</h2>
					</hgroup>

					<div class="events-section__calendar-grid">
						<?php
						try {
							$stmtEv = $pdo->query("
								SELECT slug, titulo, imagem_capa, data_inicio, local_nome, endereco
								FROM eventos
								WHERE deletado_em IS NULL AND ativo = 1
								ORDER BY data_inicio ASC
								LIMIT 4
							");
							$eventos = $stmtEv->fetchAll();

							if (empty($eventos)): ?>
								<p class="directory-grid__status" style="color: #777; padding: 20px">Nenhum evento próximo programado.</p>
							<?php else:
								foreach ($eventos as $ev):
									$imagem = aturpPublicImageSrc($ev['imagem_capa'] ?? '', 'assets/placeholders/eventos.jpeg');

									$dataEvento = 'A definir';
									if (!empty($ev['data_inicio']) && $ev['data_inicio'] !== '0000-00-00 00:00:00') {
										$dataEvento = date('d/m/Y', strtotime($ev['data_inicio']));
									}

									$local = $ev['local_nome'] ?: $ev['endereco'];
									?>
									<a
										href="./detalhe.php?type=evento&id=<?= urlencode($ev['slug']) ?>"
										class="calendar-grid__event-card"
										style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.15)), url('<?= aturpHtml($imagem) ?>'); background-size: cover; background-position: center;"
									>
										<div class="event-card__content-wrapper">
											<h3 class="event-card__event-title"><?= aturpHtml($ev['titulo']) ?></h3>

											<?php if (!empty($local)): ?>
												<span class="event-card__event-local">
													<span class="event-card__text"><?= aturpHtml($local) ?></span>
												</span>
											<?php endif; ?>

											<span class="event-card__event-date">
												<span class="event-card__text"><?= aturpHtml($dataEvento) ?></span>
											</span>
										</div>
									</a>
								<?php endforeach;
							endif;
						} catch (PDOException $e) {
							echo '<p class="directory-grid__status" style="color: red; padding: 20px">Erro ao carregar eventos.</p>';
						}
						?>
					</div>
				</div>
			</section>

			<section id="categories-section" class="discover-section">
				<div class="layout-container">
					<hgroup>
						<p class="eyebrow">Veja outras</p>
						<h2 class="section-title">Categorias</h2>
					</hgroup>

					<div class="discover-section__categories-grid">
						<?php
						$serviceSlugAliases = aturpCategorySlugAliases('servicos');
						$serviceSlugPlaceholders = implode(', ', array_fill(0, count($serviceSlugAliases), '?'));
						$stmt = $pdo->prepare("
							SELECT nome, slug, icone_svg
							FROM categorias
							WHERE tipo_aplicacao = 'item'
								AND slug NOT IN ($serviceSlugPlaceholders)
								AND ativo = 1
								AND deletado_em IS NULL
							ORDER BY ordem ASC
						");
						$stmt->execute($serviceSlugAliases);
						while ($cat = $stmt->fetch()):
						?>
						<a href="./categoria.php?cat=<?= rawurlencode(aturpCanonicalCategorySlug($cat['slug'])) ?>" class="category-card">
							<div class="category-card__icon-wrapper">
								<?php
								$defaultIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M448 0H64C28.7 0 0 28.7 0 64v384c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zm0 448H64V64h384v384z"/></svg>';
								echo aturpSafeSvgIcon($cat['icone_svg'] ?? '', $defaultIcon);
								?>
							</div>
							<span class="category-card__name"><?= aturpHtml($cat['nome']) ?></span>
						</a>
						<?php endwhile; ?>
					</div>
				</div>
			</section>
		</main>

<?php
$customJs = [];
include 'includes/footer.php';
?>
