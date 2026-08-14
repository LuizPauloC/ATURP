<?php
if (!headers_sent()) {
	header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
	header('Pragma: no-cache');
	header('Expires: 0');
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/security.php';
$pdo = getDbConnection();

function categorySlugAliasesForPublicSql(array $slugs): array
{
	$aliases = [];
	foreach ($slugs as $slug) {
		foreach (aturpCategorySlugAliases($slug) as $alias) {
			$aliases[] = $alias;
		}
	}

	return array_values(array_unique($aliases));
}

function aturpPublicHiddenCategorySlugs(): array
{
	$slugs = categorySlugAliasesForPublicSql([
		'onde-ficar',
		'hospedagem',
		'hospedagens',
		'onde-comer',
		'gastronomia',
		'servicos',
	]);

	return array_values(array_unique(array_map('aturpCanonicalCategorySlug', $slugs)));
}

function aturpPublicIsHiddenCategory($slug): bool
{
	return in_array(aturpCanonicalCategorySlug($slug), aturpPublicHiddenCategorySlugs(), true);
}

function aturpPublicCategoryCardDescription(array $category): string
{
	$description = trim((string) ($category['seo_description'] ?? ''));
	if ($description === '') {
		return 'Veja locais, atrativos e informacoes cadastradas para esta categoria em Pancas.';
	}

	$description = trim(preg_replace('/\s+/', ' ', strip_tags($description)));
	if (function_exists('mb_strlen') && function_exists('mb_substr') && mb_strlen($description, 'UTF-8') > 150) {
		return rtrim(mb_substr($description, 0, 150, 'UTF-8')) . '...';
	}

	return strlen($description) > 150 ? rtrim(substr($description, 0, 150)) . '...' : $description;
}

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
								SELECT slug, titulo, imagem_capa, data_inicio, data_fim, local_nome, endereco
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
									$imagem = aturpPublicImageSrc($ev['imagem_capa'] ?? '');
									$backgroundStyle = $imagem
										? "background-image: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.15)), url('" . aturpHtml($imagem) . "'); background-size: cover; background-position: center;"
										: '';

									$dataEvento = 'A definir';
									if (!empty($ev['data_inicio']) && $ev['data_inicio'] !== '0000-00-00 00:00:00') {
										$dataEvento = date('d/m/Y', strtotime($ev['data_inicio']));

										if (!empty($ev['data_fim']) && $ev['data_fim'] !== '0000-00-00 00:00:00') {
											$dataEvento .= ' > ' . date('d/m/Y', strtotime($ev['data_fim']));
										}
									}

									$local = $ev['local_nome'] ?: $ev['endereco'];
									?>
									<a
										href="./detalhe.php?type=evento&id=<?= urlencode($ev['slug']) ?>"
										class="calendar-grid__event-card"
										style="<?= $backgroundStyle ?>"
									>
										<div class="event-card__content-wrapper">
											<h3 class="event-card__event-title"><?= aturpHtml($ev['titulo']) ?></h3>

											<?php if (!empty($local)): ?>
												<span class="event-card__event-local">
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="event-card__local-icon" aria-hidden="true"><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>
													<span class="event-card__text"><?= aturpHtml($local) ?></span>
												</span>
											<?php endif; ?>

											<span class="event-card__event-date">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="event-card__date-icon" aria-hidden="true"><path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z"/></svg>
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
						$stmt = $pdo->query("
							SELECT
								c.id,
								c.nome,
								c.slug,
								c.icone_svg,
								c.seo_title,
								c.seo_description,
								(
									SELECT COUNT(*)
									FROM itens i
									WHERE i.categoria_id = c.id
										AND i.ativo = 1
										AND i.deletado_em IS NULL
								) AS item_count
							FROM categorias c
							WHERE c.tipo_aplicacao = 'item'
								AND c.ativo = 1
								AND c.deletado_em IS NULL
							ORDER BY c.ordem ASC
						");
						while ($cat = $stmt->fetch()):
							if (aturpPublicIsHiddenCategory($cat['slug'] ?? '')) {
								continue;
							}

							$catSlug = aturpCanonicalCategorySlug($cat['slug'] ?? '');
							$catTitle = trim((string) ($cat['seo_title'] ?? '')) ?: $cat['nome'];
							$itemCount = (int) ($cat['item_count'] ?? 0);
							$catIcon = trim((string) ($cat['icone_svg'] ?? ''));
							$catIconSvg = $catIcon !== '' ? aturpSafeSvgIcon($catIcon, '') : '';
						?>
						<a href="./categoria.php?cat=<?= rawurlencode($catSlug) ?>" class="category-card">
							<span class="category-card__icon-wrapper">
								<?= $catIconSvg ?>
							</span>
							<span class="category-card__content">
								<strong class="category-card__title"><?= aturpHtml($catTitle) ?></strong>
								<span class="category-card__meta"><?= $itemCount === 1 ? '1 item cadastrado' : aturpHtml((string) $itemCount) . ' itens cadastrados' ?></span>
								<span class="category-card__cta">Ver detalhes</span>
							</span>
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
