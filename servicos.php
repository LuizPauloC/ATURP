<?php
$pageTitle = 'Serviços | ATURP - Pancas, ES';
$customCss = ['./css/directory-cards.css', './css/servicos.css'];
$headerStartsTransparent = true;

require_once __DIR__ . '/includes/security.php';

$categoria = null;
$itens = [];
$loadError = '';

function aturpServiceExcerpt($value, int $limit = 190): string
{
    $text = trim((string) ($value ?? ''));
    $text = trim(preg_replace('/\s+/', ' ', strip_tags($text)));

    if ($text === '') {
        return 'Informações em atualização.';
    }

    if (function_exists('mb_strlen') && function_exists('mb_substr')) {
        if (mb_strlen($text, 'UTF-8') <= $limit) {
            return $text;
        }

        $excerpt = rtrim(mb_substr($text, 0, $limit, 'UTF-8'));
    } else {
        if (strlen($text) <= $limit) {
            return $text;
        }

        $excerpt = rtrim(substr($text, 0, $limit));
    }

    $lastSpace = strrpos($excerpt, ' ');
    if ($lastSpace !== false && $lastSpace > (int) ($limit * 0.65)) {
        $excerpt = substr($excerpt, 0, $lastSpace);
    }

    return rtrim($excerpt, " \t\n\r\0\x0B.,;:") . '...';
}

function aturpServiceDetailUrl(array $item): string
{
    $identifier = trim((string) ($item['slug'] ?? ''));
    if ($identifier === '') {
        $identifier = (string) ($item['id'] ?? '');
    }

    return './detalhe.php?type=servicos&id=' . rawurlencode($identifier);
}

try {
    require_once __DIR__ . '/config/database.php';
    $pdo = getDbConnection();

    $serviceSlugAliases = aturpCategorySlugAliases('servicos');
    $serviceSlugPlaceholders = implode(', ', array_fill(0, count($serviceSlugAliases), '?'));

    $stmt = $pdo->prepare("
        SELECT id, nome
        FROM categorias
        WHERE slug IN ($serviceSlugPlaceholders) AND ativo = 1 AND deletado_em IS NULL
        LIMIT 1
    ");
    $stmt->execute($serviceSlugAliases);
    $categoria = $stmt->fetch();

    if ($categoria) {
        $stmtItens = $pdo->prepare("
            SELECT
                id, slug, titulo, descricao_completa, imagem_capa,
                horario_funcionamento, endereco, link_google_maps
            FROM itens
            WHERE categoria_id = ? AND ativo = 1 AND deletado_em IS NULL
            ORDER BY titulo ASC
        ");
        $stmtItens->execute([$categoria['id']]);
        $itens = $stmtItens->fetchAll();
    } else {
        $loadError = 'A categoria de serviços não foi localizada.';
    }
} catch (Throwable $e) {
    error_log($e->getMessage());
    $loadError = 'Não foi possível carregar os serviços no momento.';
}

include 'includes/header.php';
?>

<section class="services-hero" aria-labelledby="services-hero-title">
    <div class="services-hero__content layout-container">
        <p class="eyebrow eyebrow--on-dark">Apoio ao visitante</p>
        <h1 id="services-hero-title" class="services-hero__title section-title--on-dark">Serviços em Pancas</h1>
        <p class="services-hero__description">
            Encontre serviços turísticos e locais que ajudam a planejar melhor sua visita, com contatos,
            horários e localização em um só lugar.
        </p>
    </div>
</section>

<main class="directory-page services-page">
    <?php
    $breadcrumbs = [
        ['label' => 'Início', 'url' => './index.php'],
        ['label' => 'Serviços'],
    ];
    include 'includes/breadcrumb.php';
    ?>
    <section class="directory-section services-directory" aria-labelledby="services-directory-title">
        <div class="layout-container">
            <div class="directory-section__intro">
                <p class="eyebrow">Serviços locais</p>
                <h2 id="services-directory-title" class="section-title">Encontre apoio para sua viagem</h2>
            </div>

            <div class="directory-grid services-grid" role="list">
                <?php if ($loadError !== ''): ?>
                    <p class="directory-grid__status"><?= aturpHtml($loadError) ?></p>
                <?php elseif (empty($itens)): ?>
                    <p class="directory-grid__status">Nenhum serviço cadastrado no momento.</p>
                <?php else: ?>
                    <?php foreach ($itens as $item): ?>
                        <?php
                        $detailUrl = aturpServiceDetailUrl($item);
                        $imageSrc = aturpPublicImageSrc(
                            $item['imagem_capa'] ?? '',
                            'assets/placeholders/rock-silhouette-placeholder.png'
                        );
                        $hours = trim((string) ($item['horario_funcionamento'] ?? ''));
                        $address = trim((string) ($item['endereco'] ?? ''));
                        $locationLabel = $address !== '' ? $address : 'Pancas, ES';
                        $mapUrl = aturpPublicHttpUrl($item['link_google_maps'] ?? '');
                        ?>
                        <article class="directory-card services-card" role="listitem">
                            <h3 class="directory-card__title">
                                <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__title-link">
                                    <?= aturpHtml($item['titulo']) ?>
                                </a>
                            </h3>

                            <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__image-link">
                                <img
                                    src="<?= aturpHtml($imageSrc) ?>"
                                    alt="<?= aturpHtml($item['titulo']) ?>"
                                    class="directory-card__image"
                                    loading="lazy"
                                    decoding="async"
                                >
                            </a>

                            <p class="directory-card__description">
                                <?= aturpHtml(aturpServiceExcerpt($item['descricao_completa'] ?? '')) ?>
                            </p>

                            <ul class="services-card__meta-list">
                                <li class="services-card__meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="services-card__meta-icon" aria-hidden="true">
                                        <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.3 25.9 4.3 33.2-6.7s4.3-25.9-6.7-33.2L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                                    </svg>
                                    <span><strong>Horário:</strong> <?= aturpHtml($hours !== '' ? $hours : 'Sob consulta') ?></span>
                                </li>
                            </ul>

                            <div class="directory-card__footer">
                                <hr class="directory-card__divider">

                                <?php if ($mapUrl): ?>
                                    <a href="<?= aturpHtml($mapUrl) ?>" target="_blank" rel="noreferrer" class="directory-card__link">
                                        <span class="directory-card__link-text"><?= aturpHtml($locationLabel) ?></span>
                                    </a>
                                <?php else: ?>
                                    <p class="directory-card__landmark">
                                        <span class="directory-card__link-text"><?= aturpHtml($locationLabel) ?></span>
                                    </p>
                                <?php endif; ?>

                                <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__cta">
                                    <span class="directory-card__link-text">Ver mais detalhes &rarr;</span>
                                </a>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </section>
</main>

<?php
$customJs = [];
include 'includes/footer.php';
?>
